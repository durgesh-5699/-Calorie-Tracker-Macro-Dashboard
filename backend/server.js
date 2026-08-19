// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (Make sure MongoDB is running locally or use Atlas URI)
mongoose.connect('mongodb://127.0.0.1:27017/vibecoding', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error: ", err));

// Mongoose Schema
const MealSchema = new mongoose.Schema({
    name: String,
    weight: Number, // in grams
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number
});
const Meal = mongoose.model('Meal', MealSchema);

// Base Target Thresholds for Vibe Check
const goalThresholds = {
    "Weight Loss": { calories: 1500, protein: 120, carbs: 130, fats: 50 },
    "Maintenance": { calories: 2000, protein: 150, carbs: 200, fats: 65 },
    "Muscle Gain": { calories: 2500, protein: 180, carbs: 250, fats: 80 }
};

// Global State for Goal
let currentGoal = "Maintenance";

// Baseline Nutrient Data (per 100g) for Scaling Algorithm
const baseNutrients = { calories: 120, protein: 10, carbs: 15, fats: 5 };

// Helper: Calculate State & Budget
async function getDashboardState() {
    const meals = await Meal.find();
    let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;
    
    meals.forEach(m => {
        totalCalories += m.calories;
        totalProtein += m.protein;
        totalCarbs += m.carbs;
        totalFats += m.fats;
    });

    const targets = goalThresholds[currentGoal];
    // Output validation status flag
    const isExceeded = totalCalories > targets.calories; 

    return {
        meals,
        totals: { calories: totalCalories, protein: totalProtein, carbs: totalCarbs, fats: totalFats },
        targets,
        currentGoal,
        isExceeded
    };
}

// GET: Fetch Dashboard State
app.get('/api/state', async (req, res) => {
    const state = await getDashboardState();
    res.json(state);
});

// POST: Change Fitness Goal (Vibe Check)[cite: 1, 2]
app.post('/api/goal', async (req, res) => {
    currentGoal = req.body.goal; // Doesn't wipe out existing meals[cite: 1, 2]
    const state = await getDashboardState();
    res.json(state);
});

// POST: Log a Meal (Manual or AI Mock)[cite: 1, 2]
app.post('/api/meals', async (req, res) => {
    const { name, weight, isImageUpload } = req.body;
    let finalName = name, finalWeight = weight;

    // Simulated Image Upload Auto-fill[cite: 1, 2]
    if (isImageUpload) {
        finalName = "AI Scanned Chicken Salad";
        finalWeight = 250; 
    }

    // Cost Nutrient Scaling Algorithm[cite: 1, 2]
    const scale = finalWeight / 100;
    const newMeal = new Meal({
        name: finalName,
        weight: finalWeight,
        calories: Math.round(baseNutrients.calories * scale),
        protein: Math.round(baseNutrients.protein * scale),
        carbs: Math.round(baseNutrients.carbs * scale),
        fats: Math.round(baseNutrients.fats * scale)
    });

    await newMeal.save();
    const state = await getDashboardState();
    res.json(state);
});

// DELETE: Remove Meal (Instantly lowers progress bars)[cite: 1, 2]
app.delete('/api/meals/:id', async (req, res) => {
    await Meal.findByIdAndDelete(req.params.id);
    const state = await getDashboardState();
    res.json(state);
});

app.listen(5000, () => console.log('Backend running on port 5000'));