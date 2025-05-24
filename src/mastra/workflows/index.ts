import { Step, Workflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { ExtractedDataSchema, MealPlanRequirementsSchema, NinjaChefMealPlanSchema } from '../schemas';
import { ninjaChefMealPlanner, ninjaChefExtractData } from '../agents';
import { v4 as uuidv4 } from 'uuid';
import { ExtractedData, MealPlanRequirements } from '../interfaces';
import { getMealPlanExternal } from '../tools';

export const ninjaChefWorkflow = new Workflow({
  name: 'ninjachef-workflow',
  triggerSchema: z.object({
    message: z.string().describe('what kind of meal do you want?'),
  }),
})

const firstStep = new Step({
  id: "extract-data",
  outputSchema: ExtractedDataSchema,
  execute: async ({ context, mastra, runtimeContext }) => {
    const randomUuid = uuidv4();
    const threadId = (runtimeContext?.get("threadId") as string) || randomUuid;
    const userId = (runtimeContext?.get("userId") as string) || 'dmz';
    const res = await ninjaChefExtractData.generate([
      {
        role: 'user',
        content: context?.triggerData?.message,
      },
    ], {
      output: ExtractedDataSchema,
      threadId,
      resourceId: `extractData-${userId}`,
    });
    const result = res?.object;
    return result || {
      cuisine: '', timeRange: '', ingredients: ''
    };
  },
});

const secondStep = new Step({
  id: "get-meal-plan-requirements",
  outputSchema: MealPlanRequirementsSchema,
  execute: async ({ context, mastra, runtimeContext }) => {
    const extractedData: ExtractedData = context?.getStepResult(firstStep);
    if (!extractedData) {
      throw new Error('Meal plan not found');
    }
    const externalResult: MealPlanRequirements = await getMealPlanExternal(extractedData.ingredients, 
      extractedData.timeRange, extractedData.cuisine);
    return externalResult;
  }
});

const thirdStep = new Step({
  id: "generate-meal-plan",
  outputSchema: NinjaChefMealPlanSchema,
  execute: async ({ context, mastra, runtimeContext }) => {
    const randomUuid = uuidv4();
    const mealPlan: MealPlanRequirements = context?.getStepResult(secondStep);
    if (!mealPlan) {
      throw new Error('Meal plan not found');
    }
    const prompt = `Based on the following data provided, suggest meal plan:\n${JSON.stringify(mealPlan, null, 2)}\n`;
    const threadId = (runtimeContext?.get("threadId") as string) || randomUuid;
    const userId = (runtimeContext?.get("userId") as string) || 'dmz';
    const res = await ninjaChefMealPlanner.generate([
      {
        role: 'user',
        content: prompt,
      },
    ], {
      output: NinjaChefMealPlanSchema,
      threadId,
      resourceId: `generateMealPlan-${userId}`,
    });
    // The .object property may not exist, so return res directly if it matches schema
    return (res as any)?.object || res || { meal_plan: [], cuisine: '', timeRange: '', ingredients: '' };
  },
});

ninjaChefWorkflow.step(firstStep).then(secondStep).then(thirdStep);
ninjaChefWorkflow.commit();