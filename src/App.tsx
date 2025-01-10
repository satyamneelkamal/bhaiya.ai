import React, { useState, useRef, useEffect, ComponentPropsWithoutRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Search, PenSquare, SidebarClose, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BrowserRouter } from 'react-router-dom';
import { Skeleton } from "./components/ui/skeleton";
import { ShadowContainer } from "./components/ui/shadow-container";
import { BackgroundGradient } from "./components/ui/background-gradient";
import { cn } from "@/lib/utils";
import { systemPrompts, generationConfig } from '@/lib/prompts';

interface Message {
  content: string | React.ReactElement;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string | React.ReactElement;
  messages: Message[];
  timestamp: Date;
}

interface Part {
  text: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: Part[];
}

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY available:', !!GEMINI_API_KEY);

type CodeProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  node?: any;
};

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);

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
    if (!genAI || !input.trim()) return;

    const currentConv = conversations.find(c => c.id === currentConversation);
    const chatHistory: ChatMessage[] = currentConv?.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content as string }]
    })) || [];

    const systemPrompt = systemPrompts.conversational;

    setConversations(prev => prev.map(conv => {
      if (conv.id === currentConversation) {
        return {
          ...conv,
          title: conv.title,
          messages: [...conv.messages, {
            content: input,
            sender: 'user',
            timestamp: new Date()
          }, {
            content: <Skeleton className="min-h-[120px] w-full" />,
            sender: 'bot',
            timestamp: new Date()
          }]
        };
      }
      return conv;
    }));

    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      let newTitle: string | React.ReactElement = currentConv?.title || 'New Chat';
      if (currentConv?.messages.length === 0) {
        try {
          const titleResult = await model.generateContent({
            contents: [{
              role: 'user',
              parts: [{ text: `Generate a very brief title (4-5 words max) summarizing this message: "${input}"` }]
            }]
          });
          const titleText = titleResult.response.text().trim();
          newTitle = titleText || `Chat about ${input.slice(0, 20)}...`;
        } catch (error) {
          console.error('Error generating title:', error);
          newTitle = `Chat about ${input.slice(0, 20)}...`;
        }
      }

      const chat = model.startChat({
        history: [systemPrompt, ...chatHistory],
        generationConfig: generationConfig.default
      });

      const result = await chat.sendMessage([
        {
          text: input
        }
      ]);
      
      const response = await result.response;
      const text = response.text();

      setConversations(prev => prev.map(conv => {
        if (conv.id === currentConversation) {
          return {
            ...conv,
            title: newTitle,
            messages: conv.messages
              .filter(msg => !React.isValidElement(msg.content))
              .concat({
                content: text,
                sender: 'bot',
                timestamp: new Date(),
              }),
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
      
      let newSuggestions = text
        .split('\n')
        .map(s => s.trim())
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
              className="h-[72px] w-full rounded-lg"
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

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversationToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!conversationToDelete) return;
    
    setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));
    
    if (currentConversation === conversationToDelete) {
      const remainingConvs = conversations.filter(conv => conv.id !== conversationToDelete);
      if (remainingConvs.length > 0) {
        setCurrentConversation(remainingConvs[0].id);
      } else {
        startNewConversation();
      }
    }
    
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
  };

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
                  className={`group w-full px-3 py-3 text-left text-white/90 hover:bg-[#2A2B32] flex items-center gap-3 ${
                    currentConversation === conv.id ? 'bg-[#343541]' : ''
                  }`}
                >
                  <MessageSquare className="w-4 h-4 shrink-0" />
                  <div className="flex-1 truncate text-sm">
                    {conv.title}
                  </div>
                  <button
                    onClick={(e) => initiateDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all duration-200"
                    aria-label="Delete conversation"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-white/70 hover:text-white"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
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
                    <div className={cn(
                      "min-h-[20px] flex flex-col flex-1",
                      message.sender === 'bot' && 
                      !React.isValidElement(message.content) && 
                      message.timestamp > new Date(Date.now() - 1000) &&
                        "animate-text-reveal [&_p]:animate-text-reveal [&_p]:opacity-0",
                      "[&_p:nth-child(1)]:animation-delay-[0ms]",
                      "[&_p:nth-child(2)]:animation-delay-[100ms]",
                      "[&_p:nth-child(3)]:animation-delay-[200ms]",
                      "[&_p:nth-child(4)]:animation-delay-[300ms]",
                      "[&_p:nth-child(n+5)]:animation-delay-[400ms]"
                    )}>
                      {React.isValidElement(message.content) ? (
                        message.content
                      ) : (
                        <div className="prose prose-invert prose-pre:bg-[#2A2B32] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg max-w-none">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
                              ),
                              h1: ({ children }) => (
                                <h1 className="text-xl font-semibold mb-3">{children}</h1>
                              ),
                              h2: ({ children }) => (
                                <h2 className="text-lg font-semibold mb-2">{children}</h2>
                              ),
                              h3: ({ children }) => (
                                <h3 className="text-base font-semibold mb-2">{children}</h3>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>
                              ),
                              li: ({ children }) => (
                                <li className="mb-1">{children}</li>
                              ),
                              code: function Code({ inline, className, children, ...props }: CodeProps) {
                                if (inline) {
                                  return (
                                    <code className="bg-[#2A2B32] px-1.5 py-0.5 rounded text-sm" {...props}>
                                      {children}
                                    </code>
                                  );
                                }
                                return (
                                  <pre className="p-4 overflow-x-auto">
                                    <code className="text-sm" {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                );
                              }
                            }}
                          >
                            {message.content as string}
                          </ReactMarkdown>
                        </div>
                      )}
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

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <BackgroundGradient containerClassName="w-full max-w-sm mx-4">
            <ShadowContainer 
              variant="aceternity"
              className="bg-[#1c1c1c]/80 rounded-xl p-6 w-full border border-white/[0.08] 
                backdrop-blur-sm relative overflow-visible isolate
                hover:shadow-2xl transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Delete Conversation</h2>
              <p className="text-white/90 mb-6">
                Are you sure you want to delete this conversation? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <ShadowContainer variant="colored">
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </ShadowContainer>
              </div>
            </ShadowContainer>
          </BackgroundGradient>
        </div>
      )}
    </BrowserRouter>
  );
}

export default App;