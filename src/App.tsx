import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import MealPlanner from './pages/MealPlanner';
import Progress from './pages/Progress';
import Community from './pages/Community';
import Insights from './pages/Insights';
import MusicMood from './pages/MusicMood';

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meal-planner" element={<MealPlanner />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/community" element={<Community />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/music-mood" element={<MusicMood />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;