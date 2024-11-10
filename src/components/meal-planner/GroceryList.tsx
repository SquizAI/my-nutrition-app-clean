import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Loader, ChevronDown, ChevronUp, Trash2, Camera, DollarSign, Calendar } from 'lucide-react';
import { getNutritionAdvice } from '../../services/aiService';

interface GroceryItem {
  id: string;
  name: string;
  category: string;
  isChecked: boolean;
  quantity: number;
  unit: string;
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

const GroceryList: React.FC = () => {
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [newItem, setNewItem] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [onlineStores, setOnlineStores] = useState<OnlineStore[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<string[]>([]);

  useEffect(() => {
    generateGroceryList();
    loadOnlineStores();
    loadMealPlan();
  }, []);

  const generateGroceryList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const schema = {
        type: "object",
        properties: {
          categories: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                items: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      quantity: { type: "number" },
                      unit: { type: "string" }
                    },
                    required: ["name", "quantity", "unit"]
                  }
                }
              },
              required: ["name", "items"]
            }
          }
        },
        required: ["categories"]
      };
  
      const response = await getNutritionAdvice(
        "Generate a comprehensive grocery list for a week, based on a healthy, balanced diet. Include a variety of fruits, vegetables, proteins, grains, and other essentials. Categorize the items and include suggested quantities and units.",
        schema
      );
  
      const categorizedList = response.categories.map((category: any) => ({
        name: category.name,
        items: category.items.map((item: any) => ({
          id: `${category.name}-${item.name}-${Math.random().toString(36).substr(2, 9)}`,
          name: item.name,
          category: category.name,
          isChecked: false,
          quantity: item.quantity,
          unit: item.unit
        })),
        isExpanded: true
      }));
  
      setCategories(categorizedList);
    } catch (error) {
      console.error('Error generating grocery list:', error);
      setError('Failed to generate grocery list. Please try again.');
    } finally {
      setIsLoading(false);
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

  const loadMealPlan = () => {
    // In a real app, this would fetch the meal plan from another component or API
    setMealPlan([
      "Spaghetti Bolognese",
      "Grilled Chicken Salad",
      "Vegetable Stir Fry",
      "Salmon with Roasted Vegetables",
      "Lentil Soup"
    ]);
  };

  const generateListFromMealPlan = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const schema = {
        type: "object",
        properties: {
          ingredients: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                quantity: { type: "number" },
                unit: { type: "string" },
                category: { type: "string" }
              },
              required: ["name", "quantity", "unit", "category"]
            }
          }
        },
        required: ["ingredients"]
      };

      const response = await getNutritionAdvice(
        `Generate a grocery list for the following meals: ${mealPlan.join(", ")}. Include quantities, units, and categories for each ingredient.`,
        schema
      );

      const newItems = response.ingredients.map((item: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        category: item.category,
        isChecked: false,
        quantity: item.quantity,
        unit: item.unit
      }));

      setCategories(prevCategories => {
        const mergedCategories = [...prevCategories];
        newItems.forEach(newItem => {
          const categoryIndex = mergedCategories.findIndex(c => c.name.toLowerCase() === newItem.category.toLowerCase());
          if (categoryIndex !== -1) {
            mergedCategories[categoryIndex].items.push(newItem);
          } else {
            mergedCategories.push({
              name: newItem.category,
              items: [newItem],
              isExpanded: true
            });
          }
        });
        return mergedCategories;
      });
    } catch (error) {
      console.error('Error generating grocery list from meal plan:', error);
      setError('Failed to generate grocery list from meal plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <ShoppingCart className="mr-2" /> AI-Generated Comprehensive Grocery List
      </h3>
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader className="animate-spin text-blue-500" size={24} />
        </div>
      ) : error ? (
        <div className="text-red-500 p-4">{error}</div>
      ) : (
        <>
          <div className="mb-6">
            {categories.map((category, catIndex) => (
              <div key={category.name} className="mb-4">
                <div 
                  className="flex items-center justify-between bg-gray-100 p-2 rounded cursor-pointer"
                  onClick={() => toggleCategoryExpand(catIndex)}
                >
                  <h4 className="font-medium text-gray-800">{category.name}</h4>
                  {category.isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
                {category.isExpanded && (
                  <ul className="mt-2 space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <li key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input 
                            type="checkbox" 
                            checked={item.isChecked}
                            onChange={() => toggleItemCheck(catIndex, itemIndex)}
                            className="mr-2"
                          />
                          <span className={item.isChecked ? 'line-through text-gray-500' : ''}>
                            {item.name} - {item.quantity} {item.unit}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {comparePrice(item) && (
                            <span className="mr-2 text-green-600">${comparePrice(item)?.toFixed(2)}</span>
                          )}
                          <button
                            onClick={() => removeItem(catIndex, itemIndex)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:space-x-2 mb-4">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-grow mb-2 sm:mb-0 px-3 py-2 border rounded"
              placeholder="Add new item"
            />
            <input
              type="text"
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value)}
              className="flex-grow mb-2 sm:mb-0 px-3 py-2 border rounded"
              placeholder="Category"
            />
            <input
              type="number"
              value={newItemQuantity}
              onChange={(e) => setNewItemQuantity(parseInt(e.target.value))}
              className="w-20 mb-2 sm:mb-0 px-3 py-2 border rounded"
              placeholder="Qty"
            />
            <input
              type="text"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
              className="w-20 mb-2 sm:mb-0 px-3 py-2 border rounded"
              placeholder="Unit"
            />
            <button
              onClick={addItem}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 flex items-center justify-center"
            >
              <Plus size={20} className="mr-1" /> Add
            </button>
          </div>
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
              className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600 flex items-center"
            >
              <Camera size={20} className="mr-1" /> 
              {showBarcodeScanner ? 'Hide Scanner' : 'Scan Barcode'}
            </button>
            <select
              value={selectedStore || ''}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Compare Prices</option>
              {onlineStores.map(store => (
                <option key={store.name} value={store.name}>{store.name}</option>
              ))}
            </select>
            <button
              onClick={generateListFromMealPlan}
              className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex items-center"
            >
              <Calendar size={20} className="mr-1" /> Generate from Meal Plan
            </button>
          </div>
          {showBarcodeScanner && (
            <div className="mb-4 p-4 border rounded">
              <p>Barcode scanner simulation. In a real app, this would activate the device's camera.</p>
              <button
                onClick={() => handleBarcodeScanned('123456789')}
                className="mt-2 bg-gray-200 text-gray-800 px-3 py-2 rounded hover:bg-gray-300"
              >
                Simulate Scan
              </button>
            </div>
          )}
        </>
      )}
      <button
        onClick={generateGroceryList}
        className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
      >
        Regenerate Comprehensive List
      </button>
    </div>
  );
};

export default GroceryList;