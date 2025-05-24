import { createStep, createWorkflow } from '@mastra/core';
import { z } from 'zod';
import { ExtractedDataSchema, MealPlanRequirementsSchema, NinjaChefMealPlanSchema } from '../schemas';
import { ninjaChefMealPlanner, ninjaChefExtractData } from '../agents';
import { v4 as uuidv4 } from 'uuid';
import { MealPlanRequirements } from '../interfaces';
import { getMealPlanExternal } from '../tools';

export const ninjaChefWorkflow = createWorkflow({
  id: 'ninjachef-workflow',
  inputSchema: z.object({
    message: z.string().describe('what kind of meal do you want?'),
  }),
  outputSchema: NinjaChefMealPlanSchema,
  steps: [], // will be chained below
});

const firstStep = createStep({
  id: "extract-data",
  inputSchema: z.object({ message: z.string() }),
  outputSchema: ExtractedDataSchema,
  execute: async (context) => {
    const { inputData, mastra, runtimeContext } = context;
    const randomUuid = uuidv4();
    const threadId = (runtimeContext as any)?.threadId || randomUuid;
    const userId = (runtimeContext as any)?.userId || 'dmz';
    const res = await ninjaChefExtractData.generate([
      {
        role: 'user',
        content: inputData.message,
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

const secondStep = createStep({
  id: "get-meal-plan-requirements",
  inputSchema: ExtractedDataSchema,
  outputSchema: MealPlanRequirementsSchema,
  execute: async (context) => {
    const { inputData, mastra, runtimeContext } = context;
    if (!inputData) {
      throw new Error('Meal plan not found');
    }
    const externalResult: MealPlanRequirements = await getMealPlanExternal(inputData.ingredients, 
      inputData.timeRange, inputData.cuisine);
    return externalResult;
  }
});

const thirdStep = createStep({
  id: "generate-meal-plan",
  inputSchema: MealPlanRequirementsSchema,
  outputSchema: NinjaChefMealPlanSchema,
  execute: async (context) => {
    const { inputData, mastra, runtimeContext } = context;
    const randomUuid = uuidv4();
    if (!inputData) {
      throw new Error('Meal plan not found');
    }
    const prompt = `Based on the following data provided, suggest meal plan:\n${JSON.stringify(inputData, null, 2)}\n`;
    const threadId = (runtimeContext as any)?.threadId || randomUuid;
    const userId = (runtimeContext as any)?.userId || 'dmz';
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
    return (res as any)?.object || res || { meal_plan: [], cuisine: '', timeRange: '', ingredients: '' };
  },
});

ninjaChefWorkflow.then(firstStep).then(secondStep).then(thirdStep).commit();