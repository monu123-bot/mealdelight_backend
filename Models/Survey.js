const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other", "Prefer Not to Say"] },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  
  location: {
    hometown: { type: String, required: true },
    currentCity: { type: String, required: true },
    metroStatus: { type: String, enum: ["Metro", "Non-Metro"], required: true }
  },
  
  foodHabits: {
    mealManagement: { type: String, required: true },
    outsideMealsPerDay: { type: Number, required: true },
    subscribedToMealService: { type: Boolean, required: true },
    currentMealService: { type: String },
    mealServiceProblems: [{ type: String }]
  },
  
  mealPreferences: {
    foodType: [{ type: String, required: true }],
    hygieneImportance: { type: String, enum: ["Extremely Important", "Important", "Neutral", "Not Important"] },
    perMealBudget: { type: Number, required: true },
    planPreference: { type: String, enum: ["Per Meal", "Weekly", "Monthly"], required: true },
    idealMonthlyCost: { type: Number, required: true },
    healthyMealPreference: { type: Boolean, required: true }
  },
  
  lifestyle: {
    occupation: { type: String, required: true },
    dailyLocation: { type: String, required: true },
    onlineFoodOrdersFrequency: { type: String, required: true },
    preferredMealTimings: {
      breakfast: { type: String },
      lunch: { type: String },
      dinner: { type: String }
    }
  },
  
  budget: {
    incomeRange: { type: String, required: true },
    monthlySpendingOnMeals: { type: Number, required: true },
    interestedInPremium: { type: Boolean, required: true }
  },
  
  customization: {
    preferredFeatures: [{ type: String }],
    interestedForWhom: [{ type: String }],
    interestedInApp: { type: Boolean, required: true },
    recommendationLikelihood: { type: String, required: true }
  },
  
  additionalFeedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Survey = mongoose.model("Survey", surveySchema);

module.exports = Survey;

