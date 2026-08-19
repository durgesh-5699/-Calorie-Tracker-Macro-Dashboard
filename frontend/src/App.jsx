// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [state, setState] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState('');

  const fetchState = async () => {
    const res = await axios.get(`${API_URL}/state`);
    setState(res.data);
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleGoalChange = async (e) => {
    const res = await axios.post(`${API_URL}/goal`, { goal: e.target.value });
    setState(res.data);
  };

  const handleAddMeal = async (e, isImageUpload = false) => {
    if (e) e.preventDefault();
    const res = await axios.post(`${API_URL}/meals`, {
      name: foodName,
      weight: Number(weight),
      isImageUpload
    });
    setState(res.data);
    setFoodName('');
    setWeight('');
  };

  const handleDelete = async (id) => {
    const res = await axios.delete(`${API_URL}/meals/${id}`);
    setState(res.data);
  };

  if (!state) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

  // Visual formatting logic based on budget flag[cite: 1, 2]
  const calPercent = Math.min((state.totals.calories / state.targets.calories) * 100, 100);
  const barColor = state.isExceeded ? 'crimson' : '#4CAF50'; 

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial' }}>
      
      {/* Dynamic Feedback Warning Modal[cite: 1, 2] */}
      {state.isExceeded && (
        <div style={{ background: 'crimson', color: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
          ⚠️ Daily Budget Exceeded!
        </div>
      )}

      {/* The Vibe Check (Fitness Goal Toggle)[cite: 1, 2] */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Calorie & Macro Dashboard</h2>
        <select value={state.currentGoal} onChange={handleGoalChange} style={{ padding: '8px', fontSize: '16px' }}>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Muscle Gain">Muscle Gain</option>
        </select>
      </div>

      {/* The Visual Dashboard[cite: 1, 2] */}
      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Daily Calorie Budget ({state.totals.calories} / {state.targets.calories} kcal)</h3>
        <div style={{ width: '100%', height: '25px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ width: `${calPercent}%`, height: '100%', background: barColor, transition: '0.3s' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <MacroBar name="Protein" total={state.totals.protein} target={state.targets.protein} color="blue" />
          <MacroBar name="Carbs" total={state.totals.carbs} target={state.targets.carbs} color="orange" />
          <MacroBar name="Fats" total={state.totals.fats} target={state.targets.fats} color="purple" />
        </div>
      </div>

      {/* The Logging Panel[cite: 1, 2] */}
      <div style={{ background: '#e9ecef', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h3>Log a Meal</h3>
        <form onSubmit={(e) => handleAddMeal(e, false)} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input type="text" placeholder="Food Name" value={foodName} onChange={e => setFoodName(e.target.value)} required style={{ flex: 1, padding: '10px' }} />
          <input type="number" placeholder="Weight (g)" value={weight} onChange={e => setWeight(e.target.value)} required style={{ width: '100px', padding: '10px' }} />
          <button type="submit" style={{ padding: '10px 20px', background: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}>Add Manual</button>
        </form>
        <button onClick={() => handleAddMeal(null, true)} style={{ width: '100%', padding: '12px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
          📸 Image Upload (Simulate AI Scanner)
        </button>
      </div>

      {/* The Daily History[cite: 1, 2] */}
      <div>
        <h3>Meal History</h3>
        {state.meals.length === 0 ? <p>No meals logged today.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px' }}>Meal</th>
                <th>Weight</th>
                <th>Calories</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {state.meals.map(meal => (
                <tr key={meal._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>{meal.name}</td>
                  <td>{meal.weight}g</td>
                  <td>{meal.calories} kcal</td>
                  <td>
                    <button onClick={() => handleDelete(meal._id)} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}>
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Helper Component for Macros
function MacroBar({ name, total, target, color }) {
  const percent = Math.min((total / target) * 100, 100);
  return (
    <div style={{ flex: 1 }}>
      <p style={{ margin: '0 0 5px' }}>{name} ({total}g / {target}g)</p>
      <div style={{ width: '100%', height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, transition: '0.3s' }}></div>
      </div>
    </div>
  );
}