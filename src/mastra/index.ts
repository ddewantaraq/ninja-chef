import { Mastra } from '@mastra/core';
import { PinoLogger } from '@mastra/loggers';
import { ninjaChefExtractData, ninjaChefMealPlanner } from './agents';
import { ninjaChefWorkflow } from './workflows';
import { storage } from './memory'
import { v4 as uuidv4 } from 'uuid';
import { RuntimeContext } from '@mastra/core/di';
import type { NinjaChefRuntimeContext } from './interfaces';

export const mastra = new Mastra({
  agents: { ninjaChefExtractData, ninjaChefMealPlanner },
  workflows: { ninjaChefWorkflow },
  server: {
    build: {
      swaggerUI: true,
    },
    middleware: [
      {
        handler: async (c, next) => {
          const authHeader = c.req.header("Authorization");
          const threadId = c.req.header("x-thread-id");
          const userId = c.req.header("x-user-id");
          if (process.env.NODE_ENV === 'production') {
            if (!authHeader || !threadId || !userId) {
              return new Response("Unauthorized", { status: 401 });
            }
          }
 
          await next();
        },
        path: "/api/*",
      },
      async (c, next) => {
        const runtimeContext = c.get("runtimeContext") as RuntimeContext<NinjaChefRuntimeContext>;
        const threadId = c.req.header("x-thread-id") || uuidv4();
        const userId = c.req.header("x-user-id") || 'dmz';
        runtimeContext.set("threadId", threadId);
        runtimeContext.set("userId", userId);
        await next();
      },
    ],
  },
  storage: storage,
  logger: new PinoLogger({ name: 'Mastra', level: 'info' }),
});
