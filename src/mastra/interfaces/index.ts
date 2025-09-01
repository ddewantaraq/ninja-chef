interface RecipeIntructionResponse {
  name: string;
  id: string;
  steps: Step[];
}

interface Step {
  number: number;
  step: string;
  equipment: Equipment[];
  ingredients: Ingredient[];
  length?: TimeLength;
}

interface Equipment {
  id: number;
  image: string;
  name: string;
  temperature?: Temperature;
}

interface Ingredient {
  id: number;
  image: string;
  name: string;
}

interface Temperature {
  number: number;
  unit: string; // e.g., 'Fahrenheit', 'Celsius'
}

interface TimeLength {
  number: number;
  unit: string; // e.g., 'minutes', 'seconds'
}

interface RecipeResponse {
  id: string;
  title: string;
  image: string;
  imageType: string;
}

interface MealPlanRequirements {
  ingredients: string;
  timeRange: string;
  cuisine: string;
  recipes: RecipeResponse[];
  instructions: RecipeIntructionResponse[];
  threadId?: string;
  userId?: string;
}

interface ExtractedData {
  ingredients: string;
  timeRange: string;
  cuisine: string;
  threadId?: string;
  userId?: string;
}

type NinjaChefRuntimeContext = {
  threadId: string;
  userId: string;
};

export {
  RecipeIntructionResponse,
  Step,
  RecipeResponse,
  MealPlanRequirements,
  ExtractedData,
  NinjaChefRuntimeContext
}