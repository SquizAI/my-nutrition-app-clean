import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface Meal {
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time?: string;
  ingredients: string[];
  instructions: string[];
  preparationTime?: number;
  dietaryTags?: string[];
}

interface MealCardProps {
  meals: Meal[];
  onAddMeal: (type: string) => void;
  onEditMeal: (meal: Meal) => void;
  onDeleteMeal: (meal: Meal) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  overflow-y: auto;
`;

const MealSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
`;

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const MealTitle = styled.h3`
  margin: 0;
  color: #81e6d9;
  font-size: 16px;
  font-weight: 600;
`;

const MealList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MealItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  position: relative;
`;

const MealItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const MealName = styled.div`
  font-weight: 500;
`;

const MealTime = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
`;

const MacroGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

const MacroItem = styled.div`
  text-align: center;
  font-size: 12px;

  span:first-child {
    color: rgba(255, 255, 255, 0.6);
    display: block;
    margin-bottom: 4px;
  }

  span:last-child {
    font-weight: 500;
  }
`;

const ActionButton = styled(motion.button)`
  background: none;
  border: none;
  padding: 4px;
  color: #81e6d9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0;
  transition: opacity 0.2s;

  ${MealItem}:hover & {
    opacity: 1;
  }
`;

const AddButton = styled(motion.button)`
  background: rgba(129, 230, 217, 0.1);
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  color: #81e6d9;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    background: rgba(129, 230, 217, 0.2);
  }
`;

const MealCard: React.FC<MealCardProps> = ({ meals, onAddMeal, onEditMeal, onDeleteMeal }) => {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  const getMealsByType = (type: string) => {
    return meals.filter(meal => meal.type === type);
  };

  return (
    <Container>
      {mealTypes.map((type) => (
        <MealSection key={type}>
          <MealHeader>
            <MealTitle>{type.charAt(0).toUpperCase() + type.slice(1)}</MealTitle>
            <AddButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddMeal(type)}
            >
              <Plus size={14} />
              Add
            </AddButton>
          </MealHeader>
          <MealList>
            {getMealsByType(type).map((meal) => (
              <MealItem key={meal.name}>
                <MealItemHeader>
                  <MealName>{meal.name}</MealName>
                  {meal.time && <MealTime>{meal.time}</MealTime>}
                </MealItemHeader>
                <MacroGrid>
                  <MacroItem>
                    <span>Calories</span>
                    <span>{meal.calories}</span>
                  </MacroItem>
                  <MacroItem>
                    <span>Protein</span>
                    <span>{meal.protein}g</span>
                  </MacroItem>
                  <MacroItem>
                    <span>Carbs</span>
                    <span>{meal.carbs}g</span>
                  </MacroItem>
                  <MacroItem>
                    <span>Fat</span>
                    <span>{meal.fats}g</span>
                  </MacroItem>
                </MacroGrid>
                <ActionButtons>
                  <ActionButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onEditMeal(meal)}
                  >
                    <Edit2 size={14} />
                  </ActionButton>
                  <ActionButton
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onDeleteMeal(meal)}
                  >
                    <Trash2 size={14} />
                  </ActionButton>
                </ActionButtons>
              </MealItem>
            ))}
          </MealList>
        </MealSection>
      ))}
    </Container>
  );
};

export default MealCard;