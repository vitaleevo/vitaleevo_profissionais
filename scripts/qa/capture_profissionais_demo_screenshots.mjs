import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";

const baseUrl = normalizeBaseUrl(process.env.PROFISSIONAIS_SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3001");
const apiBaseUrl = normalizeBaseUrl(process.env.PROFISSIONAIS_SCREENSHOT_API_BASE_URL ?? process.env.RAILS_API_BASE_URL ?? baseUrl);
const outputDir = process.env.PROFISSIONAIS_SCREENSHOT_OUTPUT_DIR ?? `tmp/demo-screenshots/${new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z")}`;
const chromeBin = process.env.PROFISSIONAIS_SCREENSHOT_CHROME_BIN ?? "/ms-playwright/chromium-1200/chrome-linux64/chrome";
const captureAuthenticated = (process.env.PROFISSIONAIS_SCREENSHOT_AUTHENTICATED ?? "true") === "true";
const password = process.env.PROFISSIONAIS_SCREENSHOT_PASSWORD ?? "Conecta123!";

const credentials = {
  client: {
    email: process.env.PROFISSIONAIS_SCREENSHOT_CLIENT_EMAIL ?? "ana.manuel@example.com",
    password,
  },
  professional: {
    email: process.env.PROFISSIONAIS_SCREENSHOT_PROFESSIONAL_EMAIL ?? "joaquim@conectaangola.ao",
    password,
  },
  admin: {
    email: process.env.PROFISSIONAIS_SCREENSHOT_ADMIN_EMAIL ?? "admin@conectaangola.ao",
    password,
  },
};

const viewports = {
  mobile: { width: 320, height: 900 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1440, height: 900 },
};

const publicShots = [
  { name: "public-home-desktop", path: "/", expected: "ProfiAngola", viewport: "desktop" },
  { name: "public-demo-mobile", path: "/demo", expected: "Demo guiada", viewport: "mobile" },
  { name: "public-demo-desktop", path: "/demo", expected: "Demo guiada", viewport: "desktop" },
  { name: "public-client-tablet", path: "/cliente", expected: "Solicite servicos", viewport: "tablet" },
  { name: "public-professionals-desktop", path: "/profissionais", expected: "Encontre profissionais", viewport: "desktop" },
  { name: "public-help-mobile", path: "/ajuda", expected: "suporte@profiangola.ao", viewport: "mobile" },
];

const authenticatedShots = [
  { role: "client", name: "client-orders-desktop", path: "/pedidos", expected: "Meus pedidos", viewport: "desktop" },
  { role: "client", name: "client-new-request-mobile", path: "/pedidos/novo", expected: "Triagem de servico", viewport: "mobile" },
  { role: "professional", name: "professional-jobs-desktop", path: "/profissional/vagas", expected: "Pedidos abertos", viewport: "desktop" },
  { role: "professional", name: "professional-wallet-mobile", path: "/profissional/carteira", expected: "Carteira profissional", viewport: "mobile" },
  { role: "admin", name: "operations-dashboard-desktop", path: "/operacoes", expected: "Auditoria operacional", viewport: "desktop" },
  { role: "admin", name: "operations-requests-desktop", path: "/pedidos?status=assigned&province=Luanda&urgency=urgent", expected: "Pedidos operacionais", viewport: "desktop" },
  { role: "admin", name: "operations-network-tablet", path: "/operacoes/profissionais", expected: "Rede operacional", viewport: "tablet" },
];

await mkdir(outputDir, { recursive: true });

const userDataDir = await mkdtemp(join(tmpdir(), "profissionais-chrome-"));
const chrome = spawn(chromeBin, [
  "--headless=new",
  "--disable-gpu",
  "--disable-dev-shm-usage",
  "--no-sandbox",
  "--hide-scrollbars",
  "--remote-debugging-port=0",
  `--user-data-dir=${userDataDir}`,
  "about:blank",
], {
  stdio: ["ignore", "ignore", "pipe"],
});

let browserSocketUrl;
let stderrBuffer = "";

chrome.stderr.on("data", (chunk) => {
  stderrBuffer += chunk.toString();
  const match = stderrBuffer.match(/DevTools listening on (ws:\/\/[^\s]+)/);
  if (match) browserSocketUrl = match[1];
});

try {
  await waitFor(() => browserSocketUrl, 15_000, "Chrome DevTools nao iniciou");
  const cdp = await connectCdp(browserSocketUrl);
  const results = [];

  for (const shot of publicShots) {
    results.push(await captureShot(cdp, shot));
  }

  if (captureAuthenticated) {
    const cookiesByRole = {};
    for (const role of Object.keys(credentials)) {
      cookiesByRole[role] = await loginAndCollectCookies(role, credentials[role]);
    }

    const resolvedAuthenticatedShots = [...authenticatedShots];
    const professionalDetailPath = await professionalDetailPathByName(cookiesByRole.admin, "Joaquim Mateus");
    resolvedAuthenticatedShots.push(
      {
        role: "admin",
        name: "operations-professional-detail-desktop",
        path: professionalDetailPath,
        expected: "Controle operacional",
        viewport: "desktop",
      },
      {
        role: "admin",
        name: "operations-professional-detail-mobile",
        path: professionalDetailPath,
        expected: "Controle operacional",
        viewport: "mobile",
      },
    );

    for (const shot of resolvedAuthenticatedShots) {
      results.push(await captureShot(cdp, shot, cookiesByRole[shot.role]));
    }
  }

  await cdp.close();
  await writeManifest(results);
  await writeReadme(results);
  console.log(`OK ${results.length} screenshots em ${outputDir}`);
} finally {
  chrome.kill("SIGTERM");
  await waitForChromeExit(chrome).catch(() => undefined);
  await rm(userDataDir, { force: true, recursive: true }).catch(() => undefined);
}

async function captureShot(cdp, shot, cookies = []) {
  const viewport = viewports[shot.viewport];
  const targetId = await cdp.send("Target.createTarget", { url: "about:blank" }).then((result) => result.targetId);
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId, flatten: true });
  const url = new URL(shot.path, baseUrl).toString();

  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Network.enable", {}, sessionId);
  await cdp.send("Runtime.enable", {}, sessionId);
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width < 768,
  }, sessionId);

  if (cookies.length > 0) {
    await cdp.send("Network.setExtraHTTPHeaders", {
      headers: {
        Cookie: cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; "),
      },
    }, sessionId);
    await cdp.send("Network.setCookies", { cookies: cookies.map((cookie) => cookieToCdp(cookie, url)) }, sessionId);
  }

  const loadPromise = cdp.waitForEvent("Page.loadEventFired", sessionId, 20_000);
  await cdp.send("Page.navigate", { url }, sessionId);
  await loadPromise.catch(() => undefined);
  await delay(1_000);

  const audit = await cdp.send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => {
      const viewportWidth = window.innerWidth;
      const root = document.documentElement;
      const body = document.body;
      const text = body.innerText || "";
      const normalizedText = text.toLocaleLowerCase("pt");
      const overflowing = Array.from(document.querySelectorAll("body *"))
        .map((element) => {
          const rect = element.getBoundingClientRect();
          return {
            tag: element.tagName,
            text: (element.textContent || "").trim().slice(0, 80),
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width)
          };
        })
        .filter((item) => item.width > 0 && (item.left < -2 || item.right > viewportWidth + 2))
        .slice(0, 8);
      const brokenImages = Array.from(document.images)
        .filter((image) => image.currentSrc && image.complete && image.naturalWidth === 0)
        .map((image) => image.alt || image.currentSrc || image.src)
        .slice(0, 8);
      return {
        title: document.title,
        currentUrl: location.href,
        viewportWidth,
        viewportHeight: window.innerHeight,
        documentScrollWidth: root.scrollWidth,
        bodyScrollWidth: body.scrollWidth,
        hasHorizontalOverflow: root.scrollWidth > viewportWidth + 2 || body.scrollWidth > viewportWidth + 2,
        overflowing,
        brokenImages,
        expectedFound: normalizedText.includes(${JSON.stringify(shot.expected.toLocaleLowerCase("pt"))}),
        applicationError: text.includes("Application error")
      };
    })()`,
  }, sessionId).then((result) => result.result.value);

  if (!audit.expectedFound) {
    await writeDebugDump(cdp, sessionId, shot, audit);
    throw new Error(`${shot.name}: nao encontrou texto esperado "${shot.expected}" em ${url}`);
  }
  if (audit.applicationError) {
    await writeDebugDump(cdp, sessionId, shot, audit);
    throw new Error(`${shot.name}: encontrou Application error em ${url}`);
  }
  if (audit.hasHorizontalOverflow) {
    await writeDebugDump(cdp, sessionId, shot, audit);
    throw new Error(`${shot.name}: overflow horizontal em ${audit.viewportWidth}px`);
  }
  if (audit.brokenImages.length > 0) {
    await writeDebugDump(cdp, sessionId, shot, audit);
    throw new Error(`${shot.name}: imagens quebradas: ${audit.brokenImages.join(", ")}`);
  }

  const screenshot = await cdp.send("Page.captureScreenshot", {
    captureBeyondViewport: false,
    format: "png",
    fromSurface: true,
  }, sessionId);

  const filename = `${shot.name}.png`;
  await writeFile(join(outputDir, filename), Buffer.from(screenshot.data, "base64"));
  await cdp.send("Target.closeTarget", { targetId });

  return {
    ...shot,
    url,
    file: filename,
    audit,
  };
}

async function writeDebugDump(cdp, sessionId, shot, audit) {
  const dump = await cdp.send("Runtime.evaluate", {
    awaitPromise: true,
    returnByValue: true,
    expression: `(() => ({
      text: (document.body.innerText || "").slice(0, 5000),
      html: document.documentElement.outerHTML.slice(0, 5000)
    }))()`,
  }, sessionId).then((result) => result.result.value);

  await writeFile(join(outputDir, `${shot.name}.debug.txt`), [
    `name=${shot.name}`,
    `path=${shot.path}`,
    `expected=${shot.expected}`,
    `audit=${JSON.stringify(audit, null, 2)}`,
    "",
    "TEXT:",
    dump.text,
    "",
    "HTML:",
    dump.html,
    "",
  ].join("\n"));
}

async function loginAndCollectCookies(role, credential) {
  const loginUrl = new URL("/api/auth/login", baseUrl).toString();
  const response = await fetch(loginUrl, {
    body: new URLSearchParams({ email: credential.email, password: credential.password }),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
    redirect: "manual",
  });

  if (response.status !== 303 && response.status !== 302) {
    throw new Error(`${role}: login esperava redirect 303/302, recebeu ${response.status}`);
  }

  const setCookie = getSetCookieHeaders(response.headers);
  if (setCookie.length === 0) {
    throw new Error(`${role}: login nao retornou Set-Cookie`);
  }

  return dedupeCookies(setCookie.map(parseSetCookie).filter(Boolean));
}

async function professionalDetailPathByName(cookies, name) {
  const response = await fetch(new URL("/api/v1/professionals", apiBaseUrl), {
    headers: {
      Accept: "application/json",
      Cookie: cookieHeader(cookies),
    },
  });

  if (!response.ok) {
    throw new Error(`profissionais API esperava 200, recebeu ${response.status}`);
  }

  const payload = await response.json();
  const professional = payload.data?.find((item) => item.name === name);
  if (!professional) {
    throw new Error(`profissional nao encontrado para screenshot: ${name}`);
  }

  return `/operacoes/profissionais/${professional.id}`;
}

function cookieHeader(cookies) {
  return cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");
}

function getSetCookieHeaders(headers) {
  if (typeof headers.getSetCookie === "function") return headers.getSetCookie();
  const single = headers.get("set-cookie");
  return single ? splitCombinedSetCookie(single) : [];
}

function splitCombinedSetCookie(header) {
  return header.split(/,(?=\s*[^;,]+=)/).map((item) => item.trim()).filter(Boolean);
}

function parseSetCookie(header) {
  const [pair, ...attributes] = header.split(";").map((item) => item.trim());
  const [name, ...valueParts] = pair.split("=");
  const value = valueParts.join("=");
  if (!name || !value) return null;

  const cookie = {
    name,
    path: "/",
    value,
  };

  for (const attribute of attributes) {
    const [rawKey, ...rawValue] = attribute.split("=");
    const key = rawKey.toLowerCase();
    const attributeValue = rawValue.join("=");
    if (key === "path" && attributeValue) cookie.path = attributeValue;
    if (key === "domain" && attributeValue) cookie.domain = attributeValue.replace(/^\./, "");
    if (key === "secure") cookie.secure = true;
    if (key === "httponly") cookie.httpOnly = true;
    if (key === "samesite" && attributeValue) cookie.sameSite = normalizeSameSite(attributeValue);
  }

  return cookie;
}

function dedupeCookies(cookies) {
  const byKey = new Map();
  for (const cookie of cookies) {
    byKey.set(`${cookie.name};${cookie.path ?? "/"};${cookie.domain ?? ""}`, cookie);
  }
  return [...byKey.values()];
}

function cookieToCdp(cookie, url) {
  return {
    httpOnly: cookie.httpOnly,
    name: cookie.name,
    path: cookie.path ?? "/",
    sameSite: cookie.sameSite,
    secure: cookie.secure,
    url,
    value: cookie.value,
  };
}

function normalizeSameSite(value) {
  const normalized = value.toLowerCase();
  if (normalized === "lax") return "Lax";
  if (normalized === "strict") return "Strict";
  if (normalized === "none") return "None";
  return undefined;
}

async function writeManifest(results) {
  const manifest = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    authenticated: captureAuthenticated,
    screenshots: results,
  };
  await writeFile(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

async function writeReadme(results) {
  const lines = [
    "# Screenshots Demo - Profissionais",
    "",
    `Gerado em UTC: ${new Date().toISOString()}`,
    `Base URL: ${baseUrl}`,
    `Fluxos autenticados: ${captureAuthenticated ? "sim" : "nao"}`,
    "",
    "## Arquivos",
    "",
    ...results.map((result) => `- \`${result.file}\` - ${result.name} - ${result.audit.viewportWidth}x${result.audit.viewportHeight}`),
    "",
    "## Gate",
    "",
    "- cada pagina capturada encontrou o texto esperado;",
    "- nenhuma captura encontrou `Application error`;",
    "- nenhum viewport capturado teve overflow horizontal;",
    "- nenhuma imagem carregada estava quebrada.",
    "",
    "Use apenas credenciais e dados de staging/demo. Nao anexe screenshots com dados reais de clientes, documentos ou comprovativos.",
  ];
  await writeFile(join(outputDir, "README.md"), `${lines.join("\n")}\n`);
}

function connectCdp(url) {
  const socket = new WebSocket(url);
  let nextId = 1;
  const pending = new Map();
  const eventWaiters = [];

  socket.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message));
      else resolve(payload.result ?? {});
      return;
    }

    for (const waiter of [...eventWaiters]) {
      if (waiter.method === payload.method && waiter.sessionId === payload.sessionId) {
        clearTimeout(waiter.timeout);
        eventWaiters.splice(eventWaiters.indexOf(waiter), 1);
        waiter.resolve(payload.params ?? {});
      }
    }
  });

  return new Promise((resolve, reject) => {
    socket.addEventListener("open", () => {
      resolve({
        close: () => socket.close(),
        send(method, params = {}, sessionId) {
          const id = nextId++;
          const payload = { id, method, params };
          if (sessionId) payload.sessionId = sessionId;
          socket.send(JSON.stringify(payload));
          return new Promise((commandResolve, commandReject) => {
            pending.set(id, { resolve: commandResolve, reject: commandReject });
          });
        },
        waitForEvent(method, sessionId, timeoutMs) {
          return new Promise((eventResolve, eventReject) => {
            const waiter = {
              method,
              resolve: eventResolve,
              sessionId,
              timeout: setTimeout(() => {
                eventWaiters.splice(eventWaiters.indexOf(waiter), 1);
                eventReject(new Error(`Timeout aguardando ${method}`));
              }, timeoutMs),
            };
            eventWaiters.push(waiter);
          });
        },
      });
    });
    socket.addEventListener("error", () => reject(new Error("Falha ao conectar ao Chrome DevTools")));
  });
}

function normalizeBaseUrl(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForChromeExit(processHandle) {
  if (processHandle.exitCode !== null) return Promise.resolve();

  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, 2_000);
    processHandle.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function waitFor(callback, timeoutMs, message) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const value = callback();
    if (value) return value;
    await delay(50);
  }
  throw new Error(message);
}
