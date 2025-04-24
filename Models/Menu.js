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
  name: {
    type: String,
    required: true,
  },
  description:{
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("WeeklyMenu", MenuSchema);
