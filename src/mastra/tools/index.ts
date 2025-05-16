import { 
  RecipeIntructionResponse, 
  RecipeResponse,
  MealPlanRequirements,
} from "../interfaces";

export async function getMealPlanExternal(ingredients: string, timeRange: string, cuisine: string): Promise<MealPlanRequirements> {
  const formattedCuisine = cuisine ? cuisine.toLowerCase() : '';
    const formattedIngredients = ingredients.split(',').map(ingredient => ingredient.trim()).join(',');

    const apiKey = process.env.SPOONACULAR_API_KEY;
    const apiUrl = process.env.SPOONACULAR_URL;

    async function searchRecipes(ingredients: String, mealType: String, cuisine: String, timeRange: String) {
      const baseUrl = `${apiUrl}/recipes/complexSearch?includeIngredients=${ingredients}`;
      let url = `${baseUrl}&type=${mealType}&number=${timeRange}&apiKey=${apiKey}`;
      if (cuisine) {
        url = `${baseUrl}&type=${mealType}&cuisine=${cuisine}&number=3&apiKey=${apiKey}`;
      }
      console.log(`Searching for recipes at URL: ${url}`);

      const response = await fetch(url);
      const data = await response.json();
      return data.results as RecipeResponse[]; // Array of recipe summaries
    }

    async function getRecipeInstructions(recipeId: String) {
      const url = `${apiUrl}/recipes/${recipeId}/analyzedInstructions?apiKey=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();
      return data as RecipeIntructionResponse[]; // Array of recipe instructions
    }

    let result: MealPlanRequirements = {
      ingredients: formattedIngredients,
      timeRange: timeRange,
      cuisine: formattedCuisine,
      recipes: [],
      instructions: [],
    };

    const breakfast: RecipeResponse[] = await searchRecipes(formattedIngredients, 'breakfast', formattedCuisine, timeRange);
    const lunch: RecipeResponse[] = await searchRecipes(formattedIngredients, 'main course', formattedCuisine, timeRange);
    const dinner: RecipeResponse[] = lunch; // Reusing lunch recipes for dinner
    const allRecipes: RecipeResponse[] = [...breakfast, ...lunch];
    let instructions: RecipeIntructionResponse[] = [];
    for (const recipe of allRecipes) {
      const instructionData: RecipeIntructionResponse[] = await getRecipeInstructions(recipe.id);
      if (instructionData.length === 0) {
        console.log(`No instructions found for recipe ID: ${recipe.id}`);
        continue;
      }
      const mappedData: RecipeIntructionResponse[] = instructionData.map((data) => ({
        ...data,
        id: recipe.id,
      }));

      instructions.push(...mappedData);
    }
    result.recipes = allRecipes;
    result.instructions = instructions;

    return result;
}