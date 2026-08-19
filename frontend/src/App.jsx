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

  const calPercent = Math.min((state.totals.calories / state.targets.calories) * 100, 100);
  const barColor = state.isExceeded ? '#ef4444' : '#0ea5e9'; 

  return (
    <div style={{ padding: '30px', maxWidth: '850px', margin: '0 auto', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', borderRadius: '12px' }}>
      
      {state.isExceeded && (
        <div style={{ background: '#ef4444', color: 'white', padding: '16px', borderRadius: '10px', marginBottom: '24px', textAlign: 'center', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}>
          ⚠️ Daily Budget Exceeded! Limit crossed.
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1e293b' }}>🥗 Calorie & Macro Dashboard</h2>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>Real-time health journal & tracker</p>
        </div>
        <select value={state.currentGoal} onChange={handleGoalChange} style={{ padding: '10px 14px', fontSize: '14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '600', cursor: 'pointer' }}>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Muscle Gain">Muscle Gain</option>
        </select>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, color: '#334155' }}>Daily Calorie Budget</h3>
          <span style={{ fontWeight: 'bold', color: state.isExceeded ? '#ef4444' : '#0ea5e9' }}>
            {state.totals.calories} / {state.targets.calories} kcal
          </span>
        </div>
        <div style={{ width: '100%', height: '14px', background: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ width: `${calPercent}%`, height: '100%', background: barColor, transition: 'width 0.4s ease' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <MacroBar name="Protein" total={state.totals.protein} target={state.targets.protein} color="#3b82f6" />
          <MacroBar name="Carbs" total={state.totals.carbs} target={state.targets.carbs} color="#f59e0b" />
          <MacroBar name="Fats" total={state.totals.fats} target={state.targets.fats} color="#8b5cf6" />
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#334155' }}>Log a Meal</h3>
        <form onSubmit={(e) => handleAddMeal(e, false)} style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          <input type="text" placeholder="Food Name (e.g., Paneer Tikka)" value={foodName} onChange={e => setFoodName(e.target.value)} required style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          <input type="number" placeholder="Weight (g)" value={weight} onChange={e => setWeight(e.target.value)} required style={{ width: '120px', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          <button type="submit" style={{ padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Add Meal</button>
        </form>
        <button onClick={() => handleAddMeal(null, true)} style={{ width: '100%', padding: '12px', background: '#475569', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
          📸 Simulate AI Image Scanner
        </button>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#334155' }}>Today's Food Journal</h3>
        {state.meals.length === 0 ? <p style={{ color: '#94a3b8', textAlign: 'center', margin: '20px 0' }}>No meals logged yet today.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '13px' }}>
                <th style={{ padding: '10px' }}>MEAL ITEM</th>
                <th>PORTION</th>
                <th>CALORIES</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {state.meals.map(meal => (
                <tr key={meal._id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '14px', color: '#334155' }}>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>{meal.name}</td>
                  <td>{meal.weight}g</td>
                  <td><span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>{meal.calories} kcal</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(meal._id)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
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

function MacroBar({ name, total, target, color }) {
  const percent = Math.min((total / target) * 100, 100);
  return (
    <div style={{ flex: 1 }}>
      <p style={{ margin: '0 0 5px', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{name} ({total}g / {target}g)</p>
      <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: `${percent}%`, height: '100%', background: color, transition: 'width 0.4s ease' }}></div>
      </div>
    </div>
  );
}