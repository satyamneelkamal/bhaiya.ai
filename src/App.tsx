import React, { useState, useRef, useEffect } from 'react';

import { Send, Bot, User, Search, PenSquare, SidebarClose, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BrowserRouter } from 'react-router-dom';
import { Skeleton } from "./components/ui/skeleton";

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY available:', !!GEMINI_API_KEY);

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      title: 'New Chat',
      messages: [],
      timestamp: new Date(),
    },
  ]);
  const [currentConversation, setCurrentConversation] = useState<string>('1');
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Loading suggestions...",
    "Loading suggestions...",
    "Loading suggestions...",
    "Loading suggestions..."
  ]);
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    if (!import.meta.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return;
    }
    
    setGenAI(new GoogleGenerativeAI(import.meta.env.GEMINI_API_KEY));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genAI) {
      console.error('Gemini AI not initialized');
      return;
    }
    if (!input.trim()) return;

    const userMessage: Message = {
      content: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversation) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
        };
      }
      return conv;
    }));

    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      

      const result = await model.generateContent(input);
      const response = await result.response;
      const text = response.text();

      const botMessage: Message = {
        content: text,
        sender: 'bot',
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversation) {
          return {
            ...conv,
            messages: [...conv.messages, botMessage],
          };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage: Message = {
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversation) {
          return {
            ...conv,
            messages: [...conv.messages, errorMessage],
          };
        }
        return conv;
      }));
    }
  };

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      timestamp: new Date(),
    };
    setConversations(prev => [...prev, newConversation]);
    setCurrentConversation(newConversation.id);
  };

  const getCurrentConversation = () => {
    return conversations.find(conv => conv.id === currentConversation);
  };

  const generateSuggestions = async () => {
    if (!genAI) {
      console.error('Gemini AI not initialized');
      return;
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      setSuggestions(["Loading suggestions...", "Loading suggestions...", "Loading suggestions...", "Loading suggestions..."]);
      
      const prompt = `Generate 4 questions about technology, creativity, knowledge, and lifestyle. Format each question on a new line without any markdown or prefixes. Example format:
What's the future of quantum computing?
How can AI enhance creative writing?
What are the latest discoveries in neuroscience?
What are effective ways to improve work-life balance?`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('API Response:', text);
      
      // Clean and process the suggestions
      let newSuggestions = text
        .split('\n')
        .map(s => s.trim())
        // Remove markdown formatting and prefixes
        .map(s => s.replace(/^\*\*[^:]+:\*\*\s*/, ''))
        .filter(s => s && s.length > 0);

      console.log('Processed suggestions:', newSuggestions);

      if (newSuggestions.length === 0) {
        console.error('No suggestions received from API');
        setSuggestions([
          "What emerging technologies will shape our future?",
          "How can AI enhance human creativity?",
          "Explain a fascinating scientific concept",
          "Share tips for personal development"
        ]);
        return;
      }

      // Ensure we have exactly 4 suggestions
      while (newSuggestions.length < 4) {
        newSuggestions.push(
          "What emerging technologies will shape our future?",
          "How can AI enhance human creativity?",
          "Explain a fascinating scientific concept",
          "Share tips for personal development"
        );
      }

      setSuggestions(newSuggestions.slice(0, 4));
    } catch (error) {
      console.error('Error generating suggestions:', error);
      setSuggestions([
        "What emerging technologies will shape our future?",
        "How can AI enhance human creativity?",
        "Explain a fascinating scientific concept",
        "Share tips for personal development"
      ]);
    }
  };

  useEffect(() => {
    if (genAI) {
      generateSuggestions();
    }
  }, [genAI]);

  const EmptyState = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-[#10A37F] rounded-full flex items-center justify-center mb-6">
        <Bot className="w-8 h-8 text-white" />
      </div>
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-4xl font-bold text-white">How can I help you today?</h1>
        <button
          onClick={generateSuggestions}
          className="p-2 hover:bg-[#2A2B32] rounded-full transition-colors"
          title="Refresh suggestions"
        >
          <svg 
            className="w-6 h-6 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl w-full">
        {suggestions.map((suggestion, index) => (
          suggestion === "Loading suggestions..." ? (
            <Skeleton 
              key={index}
              className="h-[60px] w-full rounded-lg"
            />
          ) : (
            <button
              key={index}
              onClick={() => {
                setInput(suggestion);
                document.querySelector('input')?.focus();
              }}
              className="p-4 bg-[#40414F] rounded-lg text-white text-left hover:bg-[#2A2B32] transition-colors"
            >
              {suggestion}
            </button>
          )
        ))}
      </div>
    </div>
  );

  return (
    <BrowserRouter>
      <div className="h-screen flex bg-[#343541]">
        {/* Sidebar */}
        {isSidebarOpen && (
          <div className="w-80 bg-[#202123] flex flex-col">
            {/* Top Icons */}
            <div className="p-2 flex items-center justify-between">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-white/5 rounded-md transition-colors"
              >
                <SidebarClose className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-white/5 rounded-md transition-colors"
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={startNewConversation}
                  className="p-2 hover:bg-white/5 rounded-md transition-colors"
                >
                  <PenSquare className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv.id)}
                  className={`w-full px-3 py-3 text-left text-white/90 hover:bg-[#2A2B32] flex items-center gap-3 ${
                    currentConversation === conv.id ? 'bg-[#343541]' : ''
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate text-sm">
                    {conv.title}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar */}
          {!isSidebarOpen && (
            <div className="border-b border-white/20 p-2">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-white/5 rounded-md transition-colors"
              >
                <SidebarClose className="w-5 h-5 text-white transform rotate-180" />
              </button>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto">
            {getCurrentConversation()?.messages.length === 0 ? (
              <EmptyState />
            ) : (
              getCurrentConversation()?.messages.map((message, index) => (
                <div
                  key={index}
                  className={`border-b border-black/10 ${
                    message.sender === 'bot' ? 'bg-[#444654]' : ''
                  }`}
                >
                  <div className="max-w-3xl mx-auto px-4 py-6 flex gap-4 text-white">
                    <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0">
                      {message.sender === 'user' ? (
                        <div className="bg-[#5436DA] w-full h-full rounded-sm flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="bg-[#10A37F] w-full h-full rounded-sm flex items-center justify-center">
                          <Bot className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="min-h-[20px] flex flex-col flex-1">
                      <div className="prose prose-invert flex-1">
                        <p>{message.content}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/20 bg-[#343541] p-4">
            <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Bhaiya AI..."
                  className="w-full bg-[#40414F] text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#10A37F]"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors p-1"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;