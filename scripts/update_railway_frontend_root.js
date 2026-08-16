const { execSync } = require('child_process');

const mutation = `
mutation {
  serviceInstanceUpdate(
    serviceId: "80293b12-c531-4e7e-a198-a3bdfe473b50"
    environmentId: "328a5f6d-f9bf-4540-a3e6-fee365b60576"
    input: {
      rootDirectory: "frontend"
      dockerfilePath: "Dockerfile"
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
