import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px;
`;

const MetricSelector = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
`;

const MetricButton = styled(motion.button)<{ active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${props => props.active ? '#31E5FF' : 'rgba(49, 229, 255, 0.2)'};
  background: ${props => props.active ? 'rgba(49, 229, 255, 0.1)' : 'transparent'};
  color: ${props => props.active ? '#31E5FF' : 'rgba(255, 255, 255, 0.6)'};
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #31E5FF;
  }
`;

const CustomTooltip = styled.div`
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(49, 229, 255, 0.2);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const TooltipLabel = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
`;

const TooltipValue = styled.p`
  margin: 4px 0 0;
  color: #31E5FF;
  font-size: 14px;
  font-weight: 600;
`;

interface ProgressCardProps {
  data: {
    date: string;
    weight?: number;
    calories?: number;
    steps?: number;
    sleep?: number;
  }[];
}

type MetricType = 'weight' | 'calories' | 'steps' | 'sleep';

const metricConfig = {
  weight: { label: 'Weight', unit: 'kg', color: '#31E5FF' },
  calories: { label: 'Calories', unit: 'kcal', color: '#9747FF' },
  steps: { label: 'Steps', unit: 'steps', color: '#FF6B6B' },
  sleep: { label: 'Sleep', unit: 'hours', color: '#6BFF8E' },
};

const ProgressCard: React.FC<ProgressCardProps> = ({ data }) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('weight');

  const CustomTooltipContent = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const metric = metricConfig[selectedMetric];
      
      return (
        <CustomTooltip>
          <TooltipLabel>{label}</TooltipLabel>
          <TooltipValue>
            {value.toLocaleString()} {metric.unit}
          </TooltipValue>
        </CustomTooltip>
      );
    }
    return null;
  };

  return (
    <CardContent>
      <MetricSelector>
        {Object.entries(metricConfig).map(([key, config]) => (
          <MetricButton
            key={key}
            active={selectedMetric === key}
            onClick={() => setSelectedMetric(key as MetricType)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {config.label}
          </MetricButton>
        ))}
      </MetricSelector>

      <div style={{ flex: 1, width: '100%', minHeight: 200 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="rgba(255, 255, 255, 0.5)"
              tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
            />
            <YAxis
              stroke="rgba(255, 255, 255, 0.5)"
              tick={{ fill: 'rgba(255, 255, 255, 0.5)', fontSize: 12 }}
            />
            <Tooltip content={CustomTooltipContent} />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={metricConfig[selectedMetric].color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, fill: metricConfig[selectedMetric].color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  );
};

export default ProgressCard; 