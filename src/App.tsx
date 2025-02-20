import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { ToastProvider } from './components/shared/Toast';
import { MealPlanProvider } from './services/mealPlanContext';
import Layout from './components/Layout';

// Import all pages
import Dashboard from './pages/Dashboard';
import MealPlanner from './pages/MealPlanner';
import Progress from './pages/Progress';
import Community from './pages/Community';
import Insights from './pages/Insights';
import MusicMood from './pages/MusicMood';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';

// Import profile sections
import { LifestyleSection } from './components/onboarding/sections/LifestyleSection';
import { HealthHistorySection } from './components/onboarding/sections/HealthHistorySection';
import { HydrationSleepSection } from './components/onboarding/sections/HydrationSleepSection';
import { EatingSection } from './components/onboarding/sections/EatingSection';
import { GroceryPreferencesSection } from './components/onboarding/sections/GroceryPreferencesSection';

// Layout wrapper component
const LayoutWrapper: React.FC = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const App: React.FC = () => {
  // Check if onboarding is completed
  const isOnboardingCompleted = localStorage.getItem('onboardingCompleted') === 'true';

  return (
    <ErrorBoundary>
      <ToastProvider>
        <MealPlanProvider>
          <Router>
            <Routes>
              {/* Onboarding route without Layout */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Protected routes with Layout */}
              <Route element={
                isOnboardingCompleted ? <LayoutWrapper /> : <Navigate to="/onboarding" replace />
              }>
                {/* Main routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/meal-planner" element={<MealPlanner />} />
                <Route path="/progress" element={<Progress />} />
                <Route path="/community" element={<Community />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/music-mood" element={<MusicMood />} />

                {/* Profile routes */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/lifestyle" element={
                  <LifestyleSection 
                    onComplete={() => {}} 
                    onPrevious={() => {}}
                  />
                } />
                <Route path="/profile/health" element={
                  <HealthHistorySection 
                    onComplete={() => {}} 
                    onPrevious={() => {}}
                  />
                } />
                <Route path="/profile/sleep" element={
                  <HydrationSleepSection 
                    onComplete={() => {}} 
                    onPrevious={() => {}}
                  />
                } />
                <Route path="/profile/eating" element={
                  <EatingSection 
                    onComplete={() => {}} 
                    onPrevious={() => {}}
                  />
                } />
                <Route path="/profile/shopping" element={
                  <GroceryPreferencesSection 
                    onComplete={() => {}} 
                    onPrevious={() => {}}
                  />
                } />
              </Route>

              {/* Redirect to onboarding if not completed */}
              <Route path="*" element={
                isOnboardingCompleted ? <Navigate to="/" /> : <Navigate to="/onboarding" />
              } />
            </Routes>
          </Router>
        </MealPlanProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;