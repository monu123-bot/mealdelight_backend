// 1) MongoDB Schema (menuModel.js)
const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  name: String,
});

const daySchema = new mongoose.Schema({
  breakfast: [mealSchema],
  lunch: [mealSchema],
  dinner: [mealSchema],
});

const MenuSchema = new mongoose.Schema({
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyMenu", MenuSchema);
