import React, { useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Camera, Award, Users, Calendar, Settings, Search, Bell, ChevronDown, PlusCircle, Zap, Utensils, Droplet, TrendingUp, MessageCircle, Heart, Star, ArrowRight } from 'lucide-react';

// Data
const calorieData = [
  { name: 'Mon', consumed: 1800, burned: 2200, goal: 2000 },
  { name: 'Tue', consumed: 2100, burned: 2300, goal: 2000 },
  { name: 'Wed', consumed: 1900, burned: 2100, goal: 2000 },
  { name: 'Thu', consumed: 2000, burned: 2400, goal: 2000 },
  { name: 'Fri', consumed: 2200, burned: 2000, goal: 2000 },
  { name: 'Sat', consumed: 2300, burned: 2500, goal: 2000 },
  { name: 'Sun', consumed: 1950, burned: 2150, goal: 2000 },
];

const macroData = [
  { name: 'Protein', value: 30, color: '#FF6B6B' },
  { name: 'Carbs', value: 50, color: '#4ECDC4' },
  { name: 'Fat', value: 20, color: '#45B7D1' },
];

const mealData = [
  { name: 'Breakfast', calories: 400, protein: 20, carbs: 50, fat: 15 },
  { name: 'Lunch', calories: 600, protein: 30, carbs: 70, fat: 20 },
  { name: 'Dinner', calories: 500, protein: 25, carbs: 60, fat: 18 },
  { name: 'Snacks', calories: 300, protein: 10, carbs: 40, fat: 12 },
];

const nutrientData = [
  { name: 'Vitamin A', value: 80 },
  { name: 'Vitamin C', value: 120 },
  { name: 'Vitamin D', value: 60 },
  { name: 'Iron', value: 90 },
  { name: 'Calcium', value: 100 },
];

const exerciseData = [
  { name: 'Mon', duration: 30 },
  { name: 'Tue', duration: 45 },
  { name: 'Wed', duration: 60 },
  { name: 'Thu', duration: 30 },
  { name: 'Fri', duration: 45 },
  { name: 'Sat', duration: 90 },
  { name: 'Sun', duration: 60 },
];

// Components
const DashboardCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg ${className}`}>
    <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
    {children}
  </div>
);

const QuickAction: React.FC<{ icon: React.ElementType; label: string; color: string }> = ({ icon: Icon, label, color }) => (
  <button className={`flex flex-col items-center justify-center p-4 ${color} rounded-xl transition-transform hover:scale-105`}>
    <Icon size={28} className="mb-2" />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const ProgressRing: React.FC<{ progress: number; size?: number; strokeWidth?: number }> = ({ progress, size = 120, strokeWidth = 8 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={size} width={size} className="transform -rotate-90">
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#4CAF50"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="text-2xl font-bold fill-current text-gray-800"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
      >
        {`${progress}%`}
      </text>
    </svg>
  );
};

const NavBar: React.FC<{ activeView: string; setActiveView: (view: string) => void }> = ({ activeView, setActiveView }) => (
  <nav className="bg-white shadow-md">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center">
            <img className="h-8 w-auto" src="https://via.placeholder.com/32" alt="Logo" />
            <span className="ml-2 text-xl font-bold text-gray-800">NutriPro</span>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            {['dashboard', 'meal-planner', 'progress', 'community'].map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`${
                  activeView === view
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center">
          <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Search size={20} />
          </button>
          <button className="ml-4 p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Bell size={20} />
          </button>
          <div className="ml-4 flex items-center">
            <img className="h-8 w-8 rounded-full" src="https://via.placeholder.com/32" alt="User" />
            <ChevronDown size={16} className="ml-1 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  </nav>
);

const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard title="Today's Summary" className="col-span-full lg:col-span-2">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-3xl font-bold text-gray-800">1,850 / 2,000 kcal</p>
            <p className="text-sm text-gray-500">Calories Consumed / Goal</p>
          </div>
          <ProgressRing progress={85} />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="consumed" stroke="#8884d8" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="burned" stroke="#82ca9d" />
            <Line type="monotone" dataKey="goal" stroke="#ffc658" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Macronutrients">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={macroData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {macroData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Water Intake" className="col-span-full md:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-blue-500">1.5 / 2.5 L</p>
            <p className="text-sm text-gray-500">Current / Goal</p>
          </div>
          <Droplet size={48} className="text-blue-500" />
        </div>
        <div className="mt-4 bg-blue-100 rounded-full h-4">
          <div className="bg-blue-500 h-4 rounded-full" style={{ width: '60%' }}></div>
        </div>
      </DashboardCard>

      <DashboardCard title="Quick Actions" className="col-span-full">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <QuickAction icon={Camera} label="Log Meal" color="bg-purple-100 text-purple-600" />
          <QuickAction icon={Zap} label="Log Exercise" color="bg-green-100 text-green-600" />
          <QuickAction icon={Utensils} label="Meal Plan" color="bg-yellow-100 text-yellow-600" />
          <QuickAction icon={Users} label="Community" color="bg-blue-100 text-blue-600" />
        </div>
      </DashboardCard>
    </div>
  );
};

const MealPlanner: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <DashboardCard title="Meal Schedule" className="lg:col-span-2">
        <div className="grid grid-cols-7 gap-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center">
              <div className="font-semibold mb-2">{day}</div>
              {['Breakfast', 'Lunch', 'Dinner'].map((meal) => (
                <div key={meal} className="bg-gray-100 p-2 mb-2 rounded">
                  <div className="text-sm font-medium">{meal}</div>
                  <div className="text-xs text-gray-500">Planned meal</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DashboardCard>
      <div className="space-y-6">
        <DashboardCard title="Grocery List">
          <ul className="space-y-2">
            {['Chicken breast', 'Brown rice', 'Broccoli', 'Olive oil', 'Almonds'].map((item) => (
              <li key={item} className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <button className="mt-4 text-blue-500 hover:text-blue-600 flex items-center">
            <PlusCircle size={16} className="mr-1" />
            Add Item
          </button>
        </DashboardCard>
        <DashboardCard title="Recipe of the Day">
          <img src="https://via.placeholder.com/300x200" alt="Recipe" className="w-full h-32 object-cover rounded-lg mb-4" />
          <h4 className="font-semibold mb-2">Grilled Chicken Salad</h4>
          <p className="text-sm text-gray-600 mb-2">A healthy and delicious meal packed with protein and vegetables.</p>
          <button className="text-blue-500 hover:text-blue-600 flex items-center">
            View Recipe
            <ArrowRight size={16} className="ml-1" />
          </button>
        </DashboardCard>
      </div>
    </div>
  );
};

const Progress: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <DashboardCard title="Weight Progress" className="col-span-full">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={calorieData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="consumed" name="Weight" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Body Measurements">
        <div className="space-y-4">
          {['Weight', 'Body Fat', 'Muscle Mass', 'Waist', 'Hips'].map((metric) => (
            <div key={metric} className="flex justify-between items-center">
              <span>{metric}</span>
              <div className="flex items-center">
              <span className="font-medium mr-2">70 kg</span>
                <TrendingUp size={16} className="text-green-500" />
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Nutrient Intake">
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={nutrientData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Exercise Log">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={exerciseData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="duration" stroke="#82ca9d" fill="#82ca9d" />
          </AreaChart>
        </ResponsiveContainer>
      </DashboardCard>

      <DashboardCard title="Achievements">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((_, index) => (
            <div key={index} className="flex flex-col items-center">
              <Award size={40} className="text-yellow-500 mb-2" />
              <span className="text-sm text-center">Achievement {index + 1}</span>
            </div>
          ))}
        </div>
      </DashboardCard>

      <DashboardCard title="Goal Progress">
        <div className="space-y-4">
          {[
            { name: 'Weight Loss', progress: 75 },
            { name: 'Muscle Gain', progress: 60 },
            { name: 'Cardio Fitness', progress: 80 },
          ].map((goal) => (
            <div key={goal.name}>
              <div className="flex justify-between mb-1">
                <span>{goal.name}</span>
                <span>{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${goal.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
};

const Community: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <DashboardCard title="Community Feed">
          {[1, 2, 3].map((post) => (
            <div key={post} className="mb-6 pb-6 border-b border-gray-200 last:border-b-0">
              <div className="flex items-center mb-4">
                <img src={`https://via.placeholder.com/40`} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <h4 className="font-semibold">User {post}</h4>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <p className="mb-4">Just completed a 5k run and feeling great! Who else is working on their cardio goals this week?</p>
              <img src={`https://via.placeholder.com/400x200`} alt="Post Image" className="w-full h-48 object-cover rounded-lg mb-4" />
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-gray-500 hover:text-blue-500">
                  <Heart size={20} className="mr-1" />
                  <span>24 Likes</span>
                </button>
                <button className="flex items-center text-gray-500 hover:text-blue-500">
                  <MessageCircle size={20} className="mr-1" />
                  <span>8 Comments</span>
                </button>
              </div>
            </div>
          ))}
        </DashboardCard>
      </div>
      <div className="space-y-6">
        <DashboardCard title="Challenges">
          {[
            { name: "30-Day Water Challenge", participants: 1245 },
            { name: "Vegetarian Week", participants: 876 },
            { name: "10k Steps Daily", participants: 2341 },
          ].map((challenge) => (
            <div key={challenge.name} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
              <h4 className="font-semibold mb-2">{challenge.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{challenge.participants} participants</p>
              <button className="text-blue-500 hover:text-blue-600">Join Challenge</button>
            </div>
          ))}
        </DashboardCard>
        <DashboardCard title="Groups">
          {[
            { name: "Weight Loss Support", members: 3456 },
            { name: "Vegan Recipes", members: 2198 },
            { name: "Fitness Enthusiasts", members: 5672 },
          ].map((group) => (
            <div key={group.name} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
              <h4 className="font-semibold mb-2">{group.name}</h4>
              <p className="text-sm text-gray-500 mb-2">{group.members} members</p>
              <button className="text-blue-500 hover:text-blue-600">Join Group</button>
            </div>
          ))}
        </DashboardCard>
        <DashboardCard title="Leaderboard">
          {[1, 2, 3, 4, 5].map((rank) => (
            <div key={rank} className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${rank <= 3 ? 'bg-yellow-400 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {rank}
                </span>
                <img src={`https://via.placeholder.com/32`} alt={`User ${rank}`} className="w-8 h-8 rounded-full mr-3" />
                <span>User {rank}</span>
              </div>
              <div className="flex items-center">
                <Star size={16} className="text-yellow-400 mr-1" />
                <span>{1000 - rank * 50} pts</span>
              </div>
            </div>
          ))}
        </DashboardCard>
      </div>
    </div>
  );
};

const AdvancedNutritionApp: React.FC = () => {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="bg-gray-100 min-h-screen">
      <NavBar activeView={activeView} setActiveView={setActiveView} />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'meal-planner' && <MealPlanner />}
          {activeView === 'progress' && <Progress />}
          {activeView === 'community' && <Community />}
        </div>
      </main>
    </div>
  );
};

export default AdvancedNutritionApp;