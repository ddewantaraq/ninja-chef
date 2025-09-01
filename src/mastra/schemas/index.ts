import { z } from "zod";

// Enums
const MealTimeSchema = z.enum(["breakfast", "lunch", "dinner"]);

// Base Schemas
const TemperatureSchema = z.object({
  number: z.number(),
  unit: z.string(), // e.g., 'Fahrenheit', 'Celsius'
});

const TimeLengthSchema = z.object({
  number: z.number(),
  unit: z.string(), // e.g., 'minutes', 'seconds'
});

const IngredientSchema = z.object({
  id: z.number(),
  image: z.string(),
  name: z.string(),
});

const EquipmentSchema = z.object({
  id: z.number(),
  image: z.string(),
  name: z.string(),
  temperature: TemperatureSchema.optional(),
});

const StepSchema = z.object({
  number: z.number(),
  step: z.string(),
  equipment: z.array(EquipmentSchema),
  ingredients: z.array(IngredientSchema),
  length: TimeLengthSchema.optional(),
});

const RecipeInstructionResponseSchema = z.object({
  name: z.string(),
  id: z.string(),
  steps: z.array(StepSchema),
});

const RecipeResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string(),
  imageType: z.string(),
});

// Menu & Meal Plan
const MenuSchema = z.object({
  time: MealTimeSchema,
  menu_description: z.string(),
  menu_image: z.string(),
  menu_name: z.string(),
  steps_to_cook: z.string(),
});

const DailyMealSchema = z.object({
  day: z.number().int().min(1),
  menus: z.array(MenuSchema),
});

const NinjaChefMealPlanSchema = z.object({
  meal_plan: z.array(DailyMealSchema),
  cuisine: z.string(),
  timeRange: z.string(),
  ingredients: z.string(),
});

// Meal Plan Requirements
const MealPlanRequirementsSchema = z.object({
  ingredients: z.string(),
  timeRange: z.string(),
  cuisine: z.string(),
  recipes: z.array(RecipeResponseSchema),
  instructions: z.array(RecipeInstructionResponseSchema),
});

const ExtractedDataSchema = z.object({
  cuisine: z.string(),
  timeRange: z.string(),
  ingredients: z.string()
});

export {
  NinjaChefMealPlanSchema,
  MealPlanRequirementsSchema,
  ExtractedDataSchema
}
