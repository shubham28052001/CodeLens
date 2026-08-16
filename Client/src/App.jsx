import React from 'react'
import api from './services/api'
import { useState } from 'react';
import { useEffect } from 'react';
function App() {
  const [health, setHealth] =useState(null);
  useEffect(() => {
  const fetchHealth = async () => {
    try {
      const response = await api.get("/health");
      setHealth(response.data);
    }catch (error) {
      console.error("Error fetching health:", error);
    }
  }

  fetchHealth();
  }, []);
  return (
    <div>
    <h1>CodeLens</h1>
    {health && <p>{health.message}</p>}
    </div>
  )
}

export default App;
