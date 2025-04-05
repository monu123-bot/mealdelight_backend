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
      timeTaken:Number
    },
    location: {
      hometownZip: String,
      currentCityZip: String,
      timeTaken:Number
    },
    currentFoodDetails: {
      mealManagement: [String],
      mealsOutside: String,
      mealProblems: [String],
      mealServiceSubscribed: String,
      mealServiceName: String,
      otherMealProblem: String,
      timeTaken:Number
    },
    mealPreferences: {
      foodType: [String],
      hygiene: String,
      spendPerMeal: String,
      timeTaken:Number
    },
    workHabitats: {
      mealTimes: mongoose.Schema.Types.Mixed,
      occupation: String,
      dailyActivity: String,
      foodOrdering: String,
      timeTaken:Number
    },
    budget: {
      incomeRange: String,
      premiumServices: String,
      mealBudget: String,
      timeTaken:Number
    },
    customizations: {
      chooseMealService: [String],
      mealPlansFor: [String],
      appInterest: String,
      recommendMealService: String,
      timeTaken:Number
    },
    recommendations: {
      suggestions: String,
      timeTaken:Number
    },
  },
}, { timestamps: true });

const Survey = mongoose.model("Survey", surveySchema);
module.exports = Survey;