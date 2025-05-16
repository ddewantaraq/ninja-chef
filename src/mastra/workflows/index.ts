import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { ExtractedDataSchema, MealPlanRequirementsSchema, NinjaChefMealPlanSchema } from '../schemas';
import { ninjaChefMealPlanner, ninjaChefExtractData } from '../agents';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedData, MealPlanRequirements } from '../interfaces';
import { getMealPlanExternal } from '../tools';

const firstStep = new Step({
  id: "extract-data",
  outputSchema: ExtractedDataSchema,
  execute: async ({ context, mastra }) => {
    const randomUuid = uuidv4();
    const res = await ninjaChefExtractData.generate([
      {
        role: 'user',
        content: context?.triggerData?.message,
      },
    ], {
      output: ExtractedDataSchema,
      threadId: context?.triggerData?.threadId || randomUuid,
      resourceId: `extractData-${context?.triggerData?.userId || 'dmz'}`,
    });
    const result = {...res?.object, ...{ threadId: context?.triggerData?.threadId || randomUuid, userId: context?.triggerData?.userId || 'dmz' } };
    return result || { 
      cuisine: '', timeRange: '', ingredients: '', 
      threadId: context?.triggerData?.threadId || randomUuid, 
      userId: context?.triggerData?.userId || 'dmz'  };  
  },
});

const secondStep = new Step({
  id: "get-meal-plan-requirements",
  outputSchema: MealPlanRequirementsSchema,
  execute: async ({ context, mastra }) => {
    const extractedData: ExtractedData = context?.getStepResult(firstStep);
    if (!extractedData) {
      throw new Error('Meal plan not found');
    }
    const externalResult: MealPlanRequirements =  await getMealPlanExternal(extractedData.ingredients, extractedData.timeRange, extractedData.cuisine);

    return {
      ...externalResult,
      threadId: extractedData.threadId,
      userId: extractedData.userId,
    }; // Merge the results
  }
});

const thirdStep = new Step({
  id: "generate-meal-plan",
  outputSchema: NinjaChefMealPlanSchema,
  execute: async ({ context, mastra }) => {
    const randomUuid = uuidv4();
    const mealPlan: MealPlanRequirements = context?.getStepResult(secondStep);
    if (!mealPlan) {
      throw new Error('Meal plan not found');
    }
    const prompt = `Based on the following data provided, suggest meal plan:
      ${JSON.stringify(mealPlan, null, 2)}
      `;
    const res = await ninjaChefMealPlanner.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      output: NinjaChefMealPlanSchema,
      threadId: randomUuid, 
      resourceId: `generateMealPlan-${context?.triggerData?.userId || 'dmz'}`,
    });
    return res?.object || { meal_plan: [], cuisine: '', timeRange: '', ingredients: '' };
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

ninjaChefWorkflow.step(firstStep).then(secondStep).then(thirdStep);
ninjaChefWorkflow.commit();