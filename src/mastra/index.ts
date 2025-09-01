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
          const origin = c.req.header('Origin') || '*';
          console.log(`${c.req.method} ${c.req.url} ${origin}`);
          if (c.req.method === 'OPTIONS') {
            return new Response(null, {
              status: 204,
              headers: {
                'Access-Control-Allow-Origin': origin,
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'x-user-id, x-thread-id, Content-Type',
                'Access-Control-Max-Age': '86400',
              }
            });
          }

          // Apply CORS headers to all other responses too
          c.header('Access-Control-Allow-Origin', origin);
          c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          c.header('Access-Control-Allow-Headers', 'x-user-id, x-thread-id, Content-Type');

          const runtimeContext = c.get("runtimeContext") as RuntimeContext<NinjaChefRuntimeContext>;
          const threadId = c.req.header("x-thread-id") || uuidv4();
          const userId = c.req.header("x-user-id") || 'dmz';
          console.log("threadId:", threadId);
          console.log("userId:", userId);
          if (process.env.NODE_ENV === 'production') {
            if (!threadId || !userId) {
              return new Response("Unauthorized", { status: 401 });
            }
          }
          runtimeContext.set("threadId", threadId);
          runtimeContext.set("userId", userId);
          await next();
        },
        path: "/api/*",
      },
    ],
  },
  storage: storage,
  logger: new PinoLogger({ name: 'Mastra', level: 'error' }),
});
