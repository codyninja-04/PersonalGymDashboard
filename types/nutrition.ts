export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export type MealCategory = "breakfast" | "lunch" | "dinner" | "snack" | "pre-workout" | "post-workout";

export interface MealEntry {
  id: string;
  name: string;
  category: MealCategory;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  timestamp: string;
}

export interface DailyFuel {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  waterLiters: number;
  creatineTaken: boolean;
  meals: MealEntry[];
}
