
import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { ninjaChefExtractData, ninjaChefMealPlanner } from './agents';
import { ninjaChefWorkflow } from './workflows';
import { storage } from './memory'

export const mastra = new Mastra({
  agents: { ninjaChefExtractData, ninjaChefMealPlanner },
  workflows: { ninjaChefWorkflow },
  storage: storage,
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
