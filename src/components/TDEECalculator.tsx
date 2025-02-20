import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useMacroCalculator } from '../services/macroCalculator';

const Container = styled.div`
  background: linear-gradient(135deg, #1a1f2c, #2d3748);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #81e6d9;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(129, 230, 217, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #81e6d9;
    box-shadow: 0 0 0 2px rgba(129, 230, 217, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(129, 230, 217, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #81e6d9;
    box-shadow: 0 0 0 2px rgba(129, 230, 217, 0.2);
  }
`;

const Button = styled(motion.button)`
  background: linear-gradient(135deg, #81e6d9, #4fd1c5);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #1a1f2c;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ResultsContainer = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ResultCard = styled.div`
  background: rgba(129, 230, 217, 0.1);
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
`;

const ResultLabel = styled.div`
  font-size: 0.875rem;
  color: #81e6d9;
  margin-bottom: 0.5rem;
`;

const ResultValue = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
`;

const TDEECalculator: React.FC = () => {
  const { setUserStats, macros } = useMacroCalculator();
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: '',
    height: '',
    bodyFatPercentage: '',
    activityLevel: 'moderatelyActive',
    goal: 'maintain',
    stepsPerDay: '',
    workoutsPerWeek: '',
    unitSystem: 'imperial'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserStats({
      ...formData,
      age: parseInt(formData.age),
      weight: parseInt(formData.weight),
      height: parseInt(formData.height),
      bodyFatPercentage: formData.bodyFatPercentage ? parseInt(formData.bodyFatPercentage) : undefined,
      stepsPerDay: parseInt(formData.stepsPerDay),
      workoutsPerWeek: parseInt(formData.workoutsPerWeek)
    } as any);
  };

  return (
    <Container>
      <h2 style={{ marginBottom: '1.5rem', color: '#81e6d9' }}>Advanced TDEE Calculator</h2>
      <Form onSubmit={handleSubmit}>
        <div>
          <FormGroup>
            <Label>Age</Label>
            <Input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Gender</Label>
            <Select name="gender" value={formData.gender} onChange={handleInputChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Weight (lbs)</Label>
            <Input
              type="number"
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Height (inches)</Label>
            <Input
              type="number"
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
        </div>
        <div>
          <FormGroup>
            <Label>Body Fat Percentage (%)</Label>
            <Input
              type="number"
              name="bodyFatPercentage"
              value={formData.bodyFatPercentage}
              onChange={handleInputChange}
            />
          </FormGroup>
          <FormGroup>
            <Label>Daily Steps</Label>
            <Input
              type="number"
              name="stepsPerDay"
              value={formData.stepsPerDay}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Workouts per Week</Label>
            <Input
              type="number"
              name="workoutsPerWeek"
              value={formData.workoutsPerWeek}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label>Activity Level</Label>
            <Select name="activityLevel" value={formData.activityLevel} onChange={handleInputChange}>
              <option value="sedentary">Sedentary (No workouts, &lt;5k steps)</option>
              <option value="lightlyActive">Lightly Active (1-3 workouts/week)</option>
              <option value="moderatelyActive">Moderately Active (3-5 workouts/week)</option>
              <option value="active">Active (6+ workouts/week)</option>
              <option value="veryActive">Very Active (Intense training/physical job)</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Goal</Label>
            <Select name="goal" value={formData.goal} onChange={handleInputChange}>
              <option value="lose">Weight Loss</option>
              <option value="maintain">Maintenance</option>
              <option value="gain">Weight Gain</option>
            </Select>
          </FormGroup>
        </div>
        <Button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
        >
          Calculate TDEE & Macros
        </Button>
      </Form>

      {macros && (
        <ResultsContainer>
          <h3 style={{ color: '#81e6d9', marginBottom: '1rem' }}>Your Results</h3>
          <ResultsGrid>
            <ResultCard>
              <ResultLabel>Daily Calories</ResultLabel>
              <ResultValue>{macros.targetCalories}</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>Protein</ResultLabel>
              <ResultValue>{macros.protein}g</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>Carbs</ResultLabel>
              <ResultValue>{macros.carbs}g</ResultValue>
            </ResultCard>
            <ResultCard>
              <ResultLabel>Fats</ResultLabel>
              <ResultValue>{macros.fats}g</ResultValue>
            </ResultCard>
          </ResultsGrid>
        </ResultsContainer>
      )}
    </Container>
  );
};

export default TDEECalculator; 