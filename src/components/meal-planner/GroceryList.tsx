import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Loader, ChevronDown, ChevronUp, Trash2, Camera, DollarSign, Calendar } from 'lucide-react';
import { getNutritionAdvice } from '../../services/aiService';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { ShoppingBag, Check, X, Edit2 } from 'lucide-react';
import { useMealPlan } from '../../services/mealPlanContext';
import { useToast } from '../shared/Toast';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const AddItemForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.typography.fontSizes.md};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const IconButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.button.background};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }
`;

const ItemsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface ItemProps {
  isChecked?: boolean;
}

const Item = styled(motion.div)<ItemProps>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background.main};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  color: ${({ theme, isChecked }) => 
    isChecked ? theme.colors.text.secondary : theme.colors.text.primary};
  text-decoration: ${({ isChecked }) => isChecked ? 'line-through' : 'none'};
`;

const Checkbox = styled.button`
  width: 20px;
  height: 20px;
  border: 2px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  cursor: pointer;
  padding: 0;
  color: ${({ theme }) => theme.colors.primary};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ItemText = styled.span`
  flex: 1;
`;

const ItemActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

interface GroceryItem {
  id: string;
  name: string;
  isChecked: boolean;
  quantity?: number;
  unit?: string;
  category?: string;
}

interface GroceryCategory {
  name: string;
  items: GroceryItem[];
  isExpanded: boolean;
}

interface OnlineStore {
  name: string;
  items: { [key: string]: number }; // item name to price mapping
}

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Button = styled.button`
  background: ${({ theme }) => theme.colors.button.background};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.button.hover};
    border-color: ${({ theme }) => theme.colors.border.hover};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface MealType {
  name: string;
  nutritionalInfo: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  recipe?: string;
}

interface DayMeals {
  [meal: string]: MealType;
}

interface MealPlanType {
  [day: string]: DayMeals;
}

const GroceryList: React.FC = () => {
  const { mealPlan } = useMealPlan();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [newItem, setNewItem] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [onlineStores, setOnlineStores] = useState<OnlineStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  useEffect(() => {
    generateGroceryList();
    loadOnlineStores();
  }, []);

  const generateGroceryList = async () => {
    if (!mealPlan || Object.keys(mealPlan).length === 0) {
      addToast({
        type: 'warning',
        message: 'Please generate a meal plan first',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const typedMealPlan = mealPlan as MealPlanType;
      const meals = Object.values(typedMealPlan).flatMap(dayMeals => 
        Object.values(dayMeals).map(meal => meal.name)
      );

      const response = await getNutritionAdvice(
        `Generate a grocery list for the following meals: ${meals.join(", ")}. Include quantities and units for each ingredient.`,
        {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  quantity: { type: "number" },
                  unit: { type: "string" }
                },
                required: ["name"]
              }
            }
          },
          required: ["items"]
        }
      );

      const newItems = response.items.map((item: any) => ({
        id: Date.now().toString() + Math.random(),
        name: `${item.quantity ? item.quantity : ''} ${item.unit ? item.unit + ' ' : ''}${item.name}`.trim(),
        isChecked: false
      }));

      setItems(newItems);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      addToast({
        type: 'error',
        message: 'Failed to generate grocery list. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const addItem = () => {
    if (newItem.trim() !== '' && newItemCategory.trim() !== '') {
      const newGroceryItem: GroceryItem = {
        id: Math.random().toString(36).substr(2, 9),
        name: newItem.trim(),
        category: newItemCategory.trim(),
        isChecked: false,
        quantity: newItemQuantity,
        unit: newItemUnit.trim()
      };

      const categoryIndex = categories.findIndex(cat => cat.name.toLowerCase() === newItemCategory.toLowerCase());
      if (categoryIndex !== -1) {
        const updatedCategories = [...categories];
        updatedCategories[categoryIndex].items.push(newGroceryItem);
        setCategories(updatedCategories);
      } else {
        setCategories([...categories, {
          name: newItemCategory,
          items: [newGroceryItem],
          isExpanded: true
        }]);
      }
      setNewItem('');
      setNewItemCategory('');
      setNewItemQuantity(1);
      setNewItemUnit('');
    }
  };

  const toggleItemCheck = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items[itemIndex].isChecked = !updatedCategories[categoryIndex].items[itemIndex].isChecked;
    setCategories(updatedCategories);
  };

  const toggleCategoryExpand = (categoryIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].isExpanded = !updatedCategories[categoryIndex].isExpanded;
    setCategories(updatedCategories);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex].items.splice(itemIndex, 1);
    if (updatedCategories[categoryIndex].items.length === 0) {
      updatedCategories.splice(categoryIndex, 1);
    }
    setCategories(updatedCategories);
  };

  const handleBarcodeScanned = (barcode: string) => {
    // In a real app, this would query a product database
    console.log(`Scanned barcode: ${barcode}`);
    setNewItem(`Product (${barcode})`);
    setShowBarcodeScanner(false);
  };

  const loadOnlineStores = () => {
    // In a real app, this would fetch data from an API
    setOnlineStores([
      { 
        name: "BigMart", 
        items: { "Apples": 2.99, "Bread": 3.49, "Milk": 2.79 }
      },
      { 
        name: "FreshGrocer", 
        items: { "Apples": 3.29, "Bread": 3.29, "Milk": 2.99 }
      }
    ]);
  };

  const comparePrice = (item: GroceryItem) => {
    if (selectedStore) {
      const store = onlineStores.find(s => s.name === selectedStore);
      if (store && store.items[item.name]) {
        return store.items[item.name];
      }
    }
    return null;
  };

  const handleAddItem = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    setItems(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newItem.trim(),
        isChecked: false,
      }
    ]);
    setNewItem('');
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const startEdit = (item: GroceryItem) => {
    setEditingId(item.id);
    setEditText(item.name);
  };

  const saveEdit = () => {
    if (!editText.trim() || !editingId) return;

    setItems(prev => prev.map(item => 
      item.id === editingId ? { ...item, name: editText.trim() } : item
    ));
    setEditingId(null);
    setEditText('');
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  return (
    <Container>
      <Title>
        <ShoppingBag size={24} />
        Grocery List
      </Title>

      {!mealPlan || Object.keys(mealPlan).length === 0 ? (
        <EmptyState>
          Please generate a meal plan first to create your grocery list
        </EmptyState>
      ) : (
        <>
          <Button
            onClick={generateGroceryList}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Grocery List'}
          </Button>

          <AddItemForm onSubmit={handleAddItem}>
            <Input
              type="text"
              placeholder="Add new item..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
            />
            <IconButton
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!newItem.trim()}
            >
              <Plus size={20} />
            </IconButton>
          </AddItemForm>

          <ItemsList>
            {items.map(item => (
              <Item
                key={item.id}
                isChecked={item.isChecked}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Checkbox onClick={() => toggleItem(item.id)}>
                  {item.isChecked && <Check size={14} />}
                </Checkbox>
                
                {editingId === item.id ? (
                  <Input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                    autoFocus
                  />
                ) : (
                  <ItemText>{item.name}</ItemText>
                )}

                <ItemActions>
                  {editingId === item.id ? (
                    <>
                      <IconButton
                        onClick={saveEdit}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Check size={14} />
                      </IconButton>
                      <IconButton
                        onClick={() => setEditingId(null)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={14} />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <IconButton
                        onClick={() => startEdit(item)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Edit2 size={14} />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteItem(item.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X size={14} />
                      </IconButton>
                    </>
                  )}
                </ItemActions>
              </Item>
            ))}
          </ItemsList>
        </>
      )}
    </Container>
  );
};

export default GroceryList;