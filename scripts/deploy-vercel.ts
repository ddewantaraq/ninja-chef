import { VercelDeployer } from '@mastra/deployer-vercel';

async function main() {
  const projectName = process.env.VERCEL_PROJECT_NAME || '';
  const teamSlug = process.env.VERCEL_TEAM_SLUG || '';
  const token = process.env.VERCEL_TOKEN || '';

  if (!projectName || !token) {
    console.error('Missing VERCEL_PROJECT_NAME or VERCEL_TOKEN environment variables.');
    process.exit(1);
  }

  const deployer = new VercelDeployer({
    projectName,
    teamSlug,
    token,
  });

  const outputDirectory = '.mastra/output';

  try {
    const result = await deployer.deploy(outputDirectory);
    console.log('Deployment successful:', result);
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

main(); 