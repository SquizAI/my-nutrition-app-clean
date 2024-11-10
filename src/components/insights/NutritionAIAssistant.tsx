import React, { useState, useEffect, useRef } from 'react';
import { getNutritionAdvice } from '../../services/aiService';
import { MessageSquare, Send, User, Bot, Loader } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const NutritionAIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
      const fullPrompt = `${context}\nUser: ${input}\nAssistant:`;
      const response = await getNutritionAdvice(fullPrompt);
      
      const aiMessage: Message = { role: 'assistant', content: response };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: "I'm sorry, I encountered an error. Please try again." 
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-[600px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <MessageSquare className="mr-2 text-blue-500" /> Nutrition AI Assistant
      </h3>
      
      <div className="flex-grow overflow-y-auto mb-4 p-4 bg-gray-100 rounded">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'
            }`}>
              <div className="flex items-center mb-1">
                {message.role === 'user' ? (
                  <User className="mr-2" size={16} />
                ) : (
                  <Bot className="mr-2" size={16} />
                )}
                <span className="font-semibold">{message.role === 'user' ? 'You' : 'AI Assistant'}</span>
              </div>
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Ask about nutrition..."
          className="flex-grow mr-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? <Loader className="animate-spin" size={24} /> : <Send size={24} />}
        </button>
      </div>
    </div>
  );
};

export default NutritionAIAssistant;