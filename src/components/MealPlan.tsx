import React, { useState } from 'react';
import { useMealGenerator } from '../services/mealGenerator';
import { useMacroCalculator } from '../services/macroCalculator';
import { useNutrition } from '../services/nutritionService';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, GripVertical, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { Meal } from '../types/meal';

const MealPlanContainer = styled.div`
  background: linear-gradient(135deg, #1a1f2c, #2d3748);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 24px;
  margin: 0;
  background: linear-gradient(135deg, #81e6d9, #4fd1c5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const GenerateButton = styled.button`
  background: linear-gradient(135deg, #81e6d9, #4fd1c5);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: #1a1f2c;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 209, 197, 0.3);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const NutritionSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.1);
  padding: 16px;
  border-radius: 12px;
`;

const NutritionItem = styled.div`
  text-align: center;

  h4 {
    margin: 0 0 8px;
    color: #81e6d9;
  }

  p {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }
`;

const MealList = styled.div`
  display: grid;
  gap: 24px;
`;

const StyledRecipeCard = styled(motion.div)<{ $isDragging?: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: grab;
  position: relative;
  border: 1px solid ${({ $isDragging }) => $isDragging ? '#81e6d9' : 'rgba(255, 255, 255, 0.1)'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: #81e6d9;
  }

  &:active {
    cursor: grabbing;
  }
`;

const RecipeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const RecipeTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  color: #81e6d9;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecipeDetails = styled(motion.div)`
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const RecipeStats = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IngredientsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
`;

const Ingredient = styled.li`
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);

  &:before {
    content: "•";
    color: #81e6d9;
  }
`;

const Instructions = styled.ol`
  padding-left: 20px;
  margin: 0;
`;

const Instruction = styled.li`
  margin-bottom: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
`;

const DietaryTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
`;

const Tag = styled.span`
  background: rgba(129, 230, 217, 0.1);
  color: #81e6d9;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
`;

const DragHandle = styled(GripVertical)`
  color: rgba(255, 255, 255, 0.5);
  cursor: grab;
  
  &:hover {
    color: #81e6d9;
  }
`;

const StyledRecipeModal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(135deg, #1a1f2c, #2d3748);
  border-radius: 20px;
  padding: 32px;
  color: #fff;
  z-index: 1100;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #81e6d9;
    border-radius: 4px;
  }
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 1000;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 28px;
  background: linear-gradient(135deg, #81e6d9, #4fd1c5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const CloseButton = styled(motion.button)`
  background: none;
  border: none;
  color: #81e6d9;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &:hover {
    background: rgba(129, 230, 217, 0.1);
  }
`;

const RecipeSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  color: #81e6d9;
  margin: 0 0 16px 0;
  font-size: 20px;
`;

const RecipeImage = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, rgba(129, 230, 217, 0.2), rgba(79, 209, 197, 0.2));
  border-radius: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const NutritionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  text-align: center;

  h4 {
    margin: 0 0 8px 0;
    color: #81e6d9;
    font-size: 14px;
  }

  p {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
`;

const RecipeDetailsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const DetailCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;

  h4 {
    margin: 0 0 12px 0;
    color: #81e6d9;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    margin: 0;
    line-height: 1.6;
  }
`;

interface RecipeCardProps {
  meal: Meal;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, meal: Meal) => void;
  onClick: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ meal, onDragStart, onClick }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleInfoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <StyledRecipeCard
      draggable
      onDragStart={(e) => onDragStart(e, meal)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      animate={{ borderColor: showDetails ? '#81e6d9' : 'rgba(255, 255, 255, 0.1)' }}
    >
      <RecipeHeader>
        <RecipeTitle>
          <GripVertical size={20} />
          {meal.name}
        </RecipeTitle>
        <motion.button
          onClick={handleInfoClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
        >
          <Info size={20} color="#81e6d9" />
        </motion.button>
      </RecipeHeader>

      <RecipeStats>
        <StatItem>🔥 {meal.calories} cal</StatItem>
        <StatItem>🥩 {meal.protein}g</StatItem>
        <StatItem>🍚 {meal.carbs}g</StatItem>
        <StatItem>🥑 {meal.fats}g</StatItem>
        <StatItem>⏱️ {meal.preparationTime} min</StatItem>
      </RecipeStats>

      {showDetails && (
        <RecipeDetails
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <h4 style={{ color: '#81e6d9', marginBottom: 8 }}>Ingredients</h4>
          <IngredientsList>
            {meal.ingredients.map((ingredient: string, index: number) => (
              <Ingredient key={`${ingredient}-${index}`}>{ingredient}</Ingredient>
            ))}
          </IngredientsList>

          <h4 style={{ color: '#81e6d9', marginBottom: 8 }}>Instructions</h4>
          <Instructions>
            {meal.instructions.map((instruction: string, index: number) => (
              <Instruction key={`${instruction}-${index}`}>{instruction}</Instruction>
            ))}
          </Instructions>

          <DietaryTags>
            {meal.dietaryTags.map((tag: string, index: number) => (
              <Tag key={`${tag}-${index}`}>{tag}</Tag>
            ))}
          </DietaryTags>
        </RecipeDetails>
      )}
    </StyledRecipeCard>
  );
};

interface RecipeModalProps {
  meal: Meal;
  onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ meal, onClose }) => {
  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      <ModalOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <StyledRecipeModal
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          onClick={handleModalClick}
        >
          <ModalHeader>
            <ModalTitle>{meal.name}</ModalTitle>
            <CloseButton
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </CloseButton>
          </ModalHeader>

          <RecipeImage>
            {meal.image ? (
              <img src={meal.image} alt={meal.name} />
            ) : (
              <span style={{ color: '#81e6d9', fontSize: '48px' }}>🍽️</span>
            )}
          </RecipeImage>

          <NutritionGrid>
            <NutritionCard>
              <h4>Calories</h4>
              <p>{meal.calories}</p>
            </NutritionCard>
            <NutritionCard>
              <h4>Protein</h4>
              <p>{meal.protein}g</p>
            </NutritionCard>
            <NutritionCard>
              <h4>Carbs</h4>
              <p>{meal.carbs}g</p>
            </NutritionCard>
            <NutritionCard>
              <h4>Fats</h4>
              <p>{meal.fats}g</p>
            </NutritionCard>
          </NutritionGrid>

          <RecipeDetailsList>
            <DetailCard>
              <h4>⏱️ Preparation Time</h4>
              <p>{meal.preparationTime} minutes</p>
            </DetailCard>
            <DetailCard>
              <h4>🥘 Cooking Method</h4>
              <p>{meal.cookingMethod || 'Various methods'}</p>
            </DetailCard>
            <DetailCard>
              <h4>🏷️ Dietary Tags</h4>
              <DietaryTags>
                {meal.dietaryTags.map((tag: string, index: number) => (
                  <Tag key={`${tag}-${index}`}>{tag}</Tag>
                ))}
              </DietaryTags>
            </DetailCard>
          </RecipeDetailsList>

          <RecipeSection>
            <SectionTitle>Ingredients</SectionTitle>
            <IngredientsList>
              {meal.ingredients.map((ingredient: string, index: number) => (
                <Ingredient key={`${ingredient}-${index}`}>{ingredient}</Ingredient>
              ))}
            </IngredientsList>
          </RecipeSection>

          <RecipeSection>
            <SectionTitle>Instructions</SectionTitle>
            <Instructions>
              {meal.instructions.map((instruction: string, index: number) => (
                <Instruction key={`${instruction}-${index}`}>{instruction}</Instruction>
              ))}
            </Instructions>
          </RecipeSection>
        </StyledRecipeModal>
      </ModalOverlay>
    </AnimatePresence>
  );
};

export const MealPlan: React.FC = () => {
  const { currentPlan, generateMealPlan, isGenerating } = useMealGenerator();
  const { macros } = useMacroCalculator();
  const { updateNutrition } = useNutrition();
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, meal: Meal) => {
    e.dataTransfer.setData('application/json', JSON.stringify(meal));
    e.dataTransfer.effectAllowed = 'move';
    
    const dragImage = document.createElement('div');
    dragImage.innerHTML = `<div style="padding: 8px; background: #81e6d9; color: #1a1f2c; border-radius: 4px;">${meal.name}</div>`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  return (
    <MealPlanContainer>
      <Header>
        <Title>Weekly Meal Plan</Title>
        <GenerateButton
          onClick={generateMealPlan}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="spin" /> Generating...
            </>
          ) : (
            'Generate Plan'
          )}
        </GenerateButton>
      </Header>

      {currentPlan?.meals.map((meal, index) => (
        <RecipeCard
          key={`${meal.name}-${index}`}
          meal={meal}
          onDragStart={handleDragStart}
          onClick={() => setSelectedMeal(meal)}
        />
      ))}

      {selectedMeal && (
        <RecipeModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      )}
    </MealPlanContainer>
  );
}; 