const { execSync } = require('child_process');

const mutation = `
mutation {
  serviceInstanceUpdate(
    serviceId: "5d008cb5-8bd0-409b-a183-0f9cb6d680b7"
    environmentId: "328a5f6d-f9bf-4540-a3e6-fee365b60576"
    input: {
      rootDirectory: "backend"
      dockerfilePath: "Dockerfile"
      healthcheckPath: "/api/v1/health/"
    }
  )
}
`;

try {
  const result = execSync('npx @railway/cli api', {
    input: mutation,
    encoding: 'utf8'
  });
  console.log('Result:', result);
} catch (e) {
  console.error('Error:', e.stdout || e.message);
}
