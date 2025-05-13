import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { NinjaChefMealPlanSchema } from '../schemas';
import { ninjaChefAgent } from '../agents';
import { v4 as uuidv4 } from 'uuid';

// use redis to store rate limit

const firstStep = new Step({
  id: "generate-meal-plan",
  outputSchema: NinjaChefMealPlanSchema,
  execute: async ({ context, mastra }) => {
    const randomUuid = uuidv4();
    const res = await ninjaChefAgent.generate([
      {
        role: 'user',
        content: context?.triggerData?.message,
      },
    ], {
      output: NinjaChefMealPlanSchema,
      threadId: context?.triggerData?.threadId || randomUuid,
      resourceId: `generateMealPlan-${context?.triggerData?.userId || 'dmz'}`,
    });
    return res?.object || { meal_plan: [] };  
  },
});

export const ninjaChefWorkflow = new Workflow({
  name: 'ninjachef-workflow',
  triggerSchema: z.object({
    message: z.string().describe('what kind of meal do you want?'),
    threadId: z.string().describe('threadId'),
    userId: z.string().describe('userId'),
  }),
})

ninjaChefWorkflow.step(firstStep);
ninjaChefWorkflow.commit();