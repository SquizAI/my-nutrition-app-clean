import React from 'react';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 20px;
`;

const CalorieCount = styled.div`
  text-align: center;
  margin-top: 20px;
`;

const CurrentCalories = styled.h2`
  font-size: 32px;
  margin: 0;
  background: linear-gradient(135deg, #31E5FF 0%, #9747FF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const GoalCalories = styled.p`
  color: rgba(255, 255, 255, 0.6);
  margin: 5px 0;
  font-size: 14px;
`;

const MacroContainer = styled.div`
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-top: 20px;
`;

const MacroItem = styled.div`
  text-align: center;
`;

const MacroValue = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #31E5FF;
`;

const MacroLabel = styled.p`
  margin: 5px 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

interface CalorieCardProps {
  currentCalories: number;
  goalCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

const COLORS = ['#31E5FF', '#9747FF', '#FF6B6B'];

const CalorieCard: React.FC<CalorieCardProps> = ({
  currentCalories,
  goalCalories,
  macros,
}) => {
  const percentage = goalCalories > 0 ? Math.min((currentCalories / goalCalories) * 100, 100) : 0;
  const calorieData = [{ value: percentage || 0 }];
  
  const macroData = [
    { name: 'Protein', value: macros.protein || 0 },
    { name: 'Carbs', value: macros.carbs || 0 },
    { name: 'Fat', value: macros.fat || 0 },
  ];

  return (
    <CardContent>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            barSize={10}
            data={calorieData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background
              dataKey="value"
              cornerRadius={30}
              fill="#31E5FF"
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <CalorieCount>
        <CurrentCalories>{Math.round(currentCalories)}</CurrentCalories>
        <GoalCalories>of {Math.round(goalCalories)} kcal goal</GoalCalories>
      </CalorieCount>

      <div style={{ width: '100%', height: 100 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={macroData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={35}
              paddingAngle={5}
              dataKey="value"
            >
              {macroData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <MacroContainer>
        {macroData.map((macro, index) => (
          <MacroItem key={macro.name}>
            <MacroValue>{Math.round(macro.value)}g</MacroValue>
            <MacroLabel>{macro.name}</MacroLabel>
          </MacroItem>
        ))}
      </MacroContainer>
    </CardContent>
  );
};

export default CalorieCard; 