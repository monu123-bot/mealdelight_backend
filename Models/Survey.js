const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  completedSteps: { type: Number, default: 0 },
  discountCode: { type: String, default: null },
  surveyData: {
    basicInfo: {
      fullName: String,
      age: String,
      gender: String,
      email: String,
      phone: String,
    },
    location: {
      hometownZip: String,
      currentCityZip: String,
    },
    currentFoodDetails: {
      mealManagement: [String],
      mealsOutside: String,
      mealProblems: [String],
      mealServiceSubscribed: String,
      mealServiceName: String,
      otherMealProblem: String,
    },
    mealPreferences: {
      foodType: [String],
      hygiene: String,
      spendPerMeal: String,
    },
    workHabitats: {
      mealTimes: mongoose.Schema.Types.Mixed,
      occupation: String,
      dailyActivity: String,
      foodOrdering: String,
    },
    budget: {
      incomeRange: String,
      premiumServices: String,
      mealBudget: String,
    },
    customizations: {
      chooseMealService: [String],
      mealPlansFor: [String],
      appInterest: String,
      recommendMealService: String,
    },
    recommendations: {
      suggestions: String,
    },
  },
}, { timestamps: true });

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;