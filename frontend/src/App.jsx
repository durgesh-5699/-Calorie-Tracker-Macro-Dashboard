import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [state, setState] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [weight, setWeight] = useState('');
  const [scanning, setScanning] = useState(false);

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

  const handleAddMeal = async (e) => {
    if (e) e.preventDefault();
    const res = await axios.post(`${API_URL}/meals`, {
      name: foodName,
      weight: Number(weight)
    });
    setState(res.data);
    setFoodName('');
    setWeight('');
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const res = await axios.get(`${API_URL}/scan`);
      setFoodName(res.data.name);
      setWeight(res.data.weight);
    } finally {
      setScanning(false);
    }
  };

  const handleDelete = async (id) => {
    const res = await axios.delete(`${API_URL}/meals/${id}`);
    setState(res.data);
  };

  if (!state) return <div className="loading">Loading...</div>;

  const calPercent = Math.min((state.totals.calories / state.targets.calories) * 100, 100);

  return (
    <div className="app-shell">

      {state.isExceeded && (
        <div className="alert-banner">
          ⚠️ Daily Budget Exceeded! Limit crossed.
        </div>
      )}

      <div className="header-card">
        <div>
          <h2>🥗 Calorie & Macro Dashboard</h2>
          <p>Real-time health journal & tracker</p>
        </div>
        <select className="goal-select" value={state.currentGoal} onChange={handleGoalChange}>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Muscle Gain">Muscle Gain</option>
        </select>
      </div>

      <div className="card">
        <div className="budget-row">
          <h3>Daily Calorie Budget</h3>
          <span className={state.isExceeded ? 'budget-figure over' : 'budget-figure'}>
            {state.totals.calories} / {state.targets.calories} kcal
          </span>
        </div>
        <div className="progress-track large">
          <div
            className={state.isExceeded ? 'progress-fill exceeded' : 'progress-fill ok'}
            style={{ width: `${calPercent}%` }}
          />
        </div>

        <div className="macro-row">
          <MacroBar name="Protein" total={state.totals.protein} target={state.targets.protein} colorClass="protein" />
          <MacroBar name="Carbs" total={state.totals.carbs} target={state.targets.carbs} colorClass="carbs" />
          <MacroBar name="Fats" total={state.totals.fats} target={state.targets.fats} colorClass="fats" />
        </div>
      </div>

      <div className="card">
        <h3>Log a Meal</h3>
        <form onSubmit={handleAddMeal} className="log-form">
          <input
            type="text"
            placeholder="Food Name (e.g., Paneer Tikka)"
            value={foodName}
            onChange={e => setFoodName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Weight (g)"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary">Add Meal</button>
        </form>
        <button className="btn-scan" onClick={handleScan} disabled={scanning}>
          {scanning ? 'Scanning…' : '📸 Simulate AI Image Scanner'}
        </button>
      </div>

      <div className="card">
        <h3>Today's Food Journal</h3>
        {state.meals.length === 0 ? (
          <p className="empty-state">No meals logged yet today.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>MEAL ITEM</th>
                <th>PORTION</th>
                <th>CALORIES</th>
                <th className="align-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {state.meals.map(meal => (
                <tr key={meal._id}>
                  <td className="meal-name">{meal.name}</td>
                  <td>{meal.weight}g</td>
                  <td><span className="calorie-pill">{meal.calories} kcal</span></td>
                  <td className="align-right">
                    <button className="btn-delete" onClick={() => handleDelete(meal._id)}>
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

function MacroBar({ name, total, target, colorClass }) {
  const percent = Math.min((total / target) * 100, 100);
  return (
    <div className="macro-bar">
      <p>{name} ({total}g / {target}g)</p>
      <div className="progress-track small">
        <div className={`progress-fill macro ${colorClass}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}