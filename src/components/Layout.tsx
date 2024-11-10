import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Utensils, TrendingUp, Users, Brain, Music } from 'lucide-react';

const NavItem: React.FC<{ to: string; icon: React.ElementType; label: string }> = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        isActive ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-600'
      }`}
    >
      <Icon className="mr-3 h-6 w-6" />
      {label}
    </Link>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-indigo-800">
        <div className="flex items-center justify-center h-16 bg-indigo-900">
          <span className="text-white font-bold text-lg">NutriPro AI</span>
        </div>
        <div className="mt-6 px-3">
          <NavItem to="/" icon={Home} label="Dashboard" />
          <NavItem to="/meal-planner" icon={Utensils} label="Meal Planner" />
          <NavItem to="/progress" icon={TrendingUp} label="Progress" />
          <NavItem to="/community" icon={Users} label="Community" />
          <NavItem to="/insights" icon={Brain} label="Insights" />
          <NavItem to="/music-mood" icon={Music} label="Music & Mood" />
        </div>
      </nav>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900">NutriPro AI</h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;