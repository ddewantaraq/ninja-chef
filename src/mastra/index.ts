
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { ninjaChefExtractData, ninjaChefMealPlanner } from './agents';
import { ninjaChefWorkflow } from './workflows';
import { storage } from './memory'
import { VercelDeployer } from '@mastra/deployer-vercel';

export const mastra = new Mastra({
  agents: { ninjaChefExtractData, ninjaChefMealPlanner },
  workflows: { ninjaChefWorkflow },
  deployer: new VercelDeployer({
    projectName: 'ninja-chef',
    teamSlug: 'dimas-dewantaras-projects',
    token: process.env.VERCEL_TOKEN || '',
  }),
  server: {
    build: {
      swaggerUI: true,
    }
  },
  storage: storage,
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
