const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Error: ", err));

const MealSchema = new mongoose.Schema({
  name: String,
  weight: Number,
  calories: Number,
  protein: Number,
  carbs: Number,
  fats: Number,
});
const Meal = mongoose.model("Meal", MealSchema);

const goalThresholds = {
  "Weight Loss": { calories: 1500, protein: 120, carbs: 130, fats: 50 },
  "Maintenance": { calories: 2000, protein: 150, carbs: 200, fats: 65 },
  "Muscle Gain": { calories: 2500, protein: 180, carbs: 250, fats: 80 },
};

let currentGoal = "Maintenance";
const baseNutrients = { calories: 120, protein: 10, carbs: 15, fats: 5 };

async function getDashboardState() {
  const meals = await Meal.find();
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFats = 0;

  meals.forEach((m) => {
    totalCalories += m.calories;
    totalProtein += m.protein;
    totalCarbs += m.carbs;
    totalFats += m.fats;
  });

  const targets = goalThresholds[currentGoal];
  const isExceeded = totalCalories > targets.calories;

  return {
    meals,
    totals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFats,
    },
    targets,
    currentGoal,
    isExceeded,
  };
}

app.get("/api/state", async (req, res) => {
  const state = await getDashboardState();
  res.json(state);
});

// AI Scanner Endpoint for Simulation
app.get("/api/scan", (req, res) => {
  res.json({ name: "AI Scanned Chicken Salad", weight: 250 });
});

app.post("/api/goal", async (req, res) => {
  currentGoal = req.body.goal;
  const state = await getDashboardState();
  res.json(state);
});

app.post("/api/meals", async (req, res) => {
  const { name, weight } = req.body;
  const scale = weight / 100;

  const newMeal = new Meal({
    name,
    weight,
    calories: Math.round(baseNutrients.calories * scale),
    protein: Math.round(baseNutrients.protein * scale),
    carbs: Math.round(baseNutrients.carbs * scale),
    fats: Math.round(baseNutrients.fats * scale),
  });

  await newMeal.save();
  const state = await getDashboardState();
  res.json(state);
});

app.delete("/api/meals/:id", async (req, res) => {
  await Meal.findByIdAndDelete(req.params.id);
  const state = await getDashboardState();
  res.json(state);
});

app.listen(5000, () => console.log("Backend running on port 5000"));