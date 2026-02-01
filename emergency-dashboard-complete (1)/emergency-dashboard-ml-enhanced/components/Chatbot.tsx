import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, AlertCircle, Phone, Shield } from 'lucide-react';
import { chatbotService } from '../services/chatbotService';
import { DisasterType } from '../types';

interface ChatbotProps {
  currentDisasterType?: DisasterType;
}

export const Chatbot: React.FC<ChatbotProps> = ({ currentDisasterType }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string; role: 'user' | 'assistant'; content: string}>>([]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = chatbotService.getResponse('hello', currentDisasterType);
      setMessages([{ id: '1', role: 'assistant', content: welcome.message }]);
      if (welcome.suggestions) setSuggestions(welcome.suggestions);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (message?: string) => {
    const messageToSend = message || input.trim();
    if (!messageToSend) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: messageToSend }]);
    setInput('');

    setTimeout(() => {
      const response = chatbotService.getResponse(messageToSend, currentDisasterType);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: response.message }]);
      if (response.suggestions) setSuggestions(response.suggestions);
      else setSuggestions([]);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full p-4 shadow-2xl transition-all transform hover:scale-110 flex items-center gap-2 group"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap font-bold">
          Emergency Assistant
        </span>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
          !
        </span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col border-2 border-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">Emergency Assistant</h3>
            <p className="text-xs text-blue-100">AI-powered guidance • Always available</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="hover:bg-blue-800 rounded-full p-2 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Banner */}
      {currentDisasterType && (
        <div className="bg-red-50 border-b-2 border-red-200 p-3 flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-xs">
            <div className="font-bold">{currentDisasterType} Emergency Mode</div>
            <div>Specialized guidance active</div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-800'
              }`}
            >
              <div className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500 mb-2 font-semibold">Quick actions:</div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(sug)}
                className="text-xs bg-white hover:bg-blue-50 border-2 border-blue-200 hover:border-blue-400 text-blue-700 px-3 py-1.5 rounded-full transition-all font-medium"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t-2 border-slate-200 bg-white rounded-b-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for emergency help..."
            className="flex-1 px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl px-4 py-2.5 transition-all flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        {/* Quick Emergency Buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => handleSend('Emergency contacts')}
            className="flex-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg px-2 py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <Phone className="w-3 h-3" />
            Contacts
          </button>
          <button
            onClick={() => handleSend('First aid')}
            className="flex-1 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-lg px-2 py-1.5 text-xs font-bold transition-all flex items-center justify-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            First Aid
          </button>
        </div>
      </div>
    </div>
  );
};
