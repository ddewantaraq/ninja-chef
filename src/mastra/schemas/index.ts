import { z } from 'zod';

const MealTimeSchema = z.enum(["breakfast", "lunch", "dinner"]);

const MenuSchema = z.object({
  time: MealTimeSchema,
  menu_description: z.string(),
  menu_name: z.string(),
  steps_to_cook: z.string(), // can be long and multiline
});

const DailyMealSchema = z.object({
  day: z.number().int().min(1),
  menus: z.array(MenuSchema),
});

const NinjaChefMealPlanSchema = z.object({
  meal_plan: z.array(DailyMealSchema),
});

export {
    NinjaChefMealPlanSchema
}
