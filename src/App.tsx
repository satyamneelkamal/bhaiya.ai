import React, { useState, useRef, useEffect, ComponentPropsWithoutRef, forwardRef, useImperativeHandle } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Search, PenSquare, SidebarClose, MessageSquare } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BrowserRouter } from 'react-router-dom';
import { Skeleton } from "./components/ui/skeleton";
import { cn } from "@/lib/utils";
import { systemPrompts, generationConfig } from '@/lib/prompts';
import { GlassDialog } from "./components/ui/glass-dialog";
import { HomeButton, HomeButtonRef } from './components/elements/home-button';
// Temporarily comment out unused import
// import { Background3D } from "./components/ui/background-3d";

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

interface EmptyStateRef {
  triggerLogoAnimation: () => void;
}

const GEMINI_API_KEY = import.meta.env.GEMINI_API_KEY;
console.log('GEMINI_API_KEY available:', !!GEMINI_API_KEY);

type CodeProps = ComponentPropsWithoutRef<'code'> & {
  inline?: boolean;
  node?: any;
};

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string>('');
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
  const [isMounted, setIsMounted] = useState(false);
  const homeButtonRef = useRef<HomeButtonRef>(null);
  const emptyStateRef = useRef<EmptyStateRef>(null);

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

    let activeConversation;

    // If we're on home page or there are no conversations, create a new one
    if (!currentConversation || conversations.length === 0) {
      const newId = Date.now().toString();
      const newConversation: Conversation = {
        id: newId,
        title: 'New Chat',
        messages: [], // Start with empty messages
        timestamp: new Date(),
      };
      setConversations(prev => [...prev, newConversation]);
      setCurrentConversation(newId);
      activeConversation = newConversation;
    } else {
      activeConversation = conversations.find(c => c.id === currentConversation) || conversations[0];
    }

    // Add the user's message and loading state for bot response
    setConversations(prev => prev.map(conv => {
      if (conv.id === activeConversation.id) {
        return {
          ...conv,
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

    const chatHistory: ChatMessage[] = activeConversation.messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content as string }]
    }));

    setInput('');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      let newTitle: string | React.ReactElement = activeConversation?.title || 'New Chat';
      if (activeConversation?.messages.length === 0) {
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
        history: [systemPrompts.conversational, ...chatHistory],
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
        if (conv.id === activeConversation.id) {
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
    homeButtonRef.current?.triggerAnimation();
    emptyStateRef.current?.triggerLogoAnimation();
    setCurrentConversation('');
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

  const EmptyState = forwardRef<EmptyStateRef>((_, ref) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useImperativeHandle(ref, () => ({
      triggerLogoAnimation: () => {
        setIsAnimating(true);
        setTimeout(() => {
          setIsAnimating(false);
        }, 700); // Slightly longer duration for logo animation
      }
    }));

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[calc(100vh-8rem)]">
        {/* Clickable Logo Section */}
        <button
          onClick={generateSuggestions}
          className={cn(
            "relative mb-8 group hover:scale-110 transition-all duration-700",
            isAnimating && "animate-bounce-subtle"
          )}
          title="Refresh suggestions"
          onMouseEnter={(e) => {
            const target = e.currentTarget.querySelector('.logo-container') as HTMLDivElement;
            if (target) {
              target.classList.remove('animate-spin-once');
              void target.offsetWidth;
              target.classList.add('animate-spin-once');
            }
          }}
        >
          {/* Logo container with contained glow effects */}
          <div className="logo-container relative w-20 h-20 bg-gradient-premium from-[#10A37F] to-[#0D8A6F] 
            rounded-2xl rotate-12 transform-gpu
            flex items-center justify-center
            shadow-md shadow-[#10A37F]/10 group-hover:shadow-[#10A37F]/20
            overflow-hidden animate-spin-once
            hover:animate-bounce-subtle"
          >
            {/* Internal glowing rings */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
              <div className="absolute inset-[-50%] bg-gradient-conic from-[#10A37F]/30 via-transparent to-[#10A37F]/30 
                rounded-full blur-md animate-spin-slow" />
              <div className="absolute inset-[-50%] bg-gradient-conic from-[#10A37F]/20 via-transparent to-[#10A37F]/20 
                rounded-full blur-md animate-spin-slow-reverse" />
              <div className="absolute inset-[-25%] bg-gradient-radial from-[#10A37F]/10 to-transparent 
                rounded-full blur-sm animate-pulse-fast" />
            </div>

            {/* Shine effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent 
              pointer-events-none group-hover:opacity-0 transition-opacity duration-700" />
            
            {/* Border effect */}
            <div className="absolute inset-0 ring-1 ring-white/10 group-hover:ring-white/20 
              rounded-2xl transition-all duration-700" />
            
            {/* Animated gradient borders */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 
              transition-opacity duration-700 overflow-hidden"
            >
              <div className="absolute inset-[-50%] bg-gradient-conic from-[#10A37F]/30 via-transparent to-[#10A37F]/30 
                animate-spin-slow" />
              <div className="absolute inset-[-25%] bg-gradient-radial from-[#10A37F]/20 to-transparent 
                animate-pulse-fast" />
            </div>
            
            {/* Icon with enhanced effects */}
            <Bot className="w-10 h-10 text-white group-hover:scale-110 transition-all duration-700
              drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] relative z-10
              group-hover:animate-wiggle" />
          </div>
        </button>

        {/* Title Section */}
        <div className="relative flex flex-col items-center gap-3 mb-12">
          <div className="relative group">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text 
              bg-gradient-to-r from-white via-white to-white/80
              tracking-tight py-4 px-2 leading-[1.2]"
            >
              How can I help you today?
            </h1>
            
            <div className="absolute bottom-0 left-0 right-0 h-[1px] 
              bg-gradient-to-r from-transparent via-[#10A37F]/20 to-transparent
              group-hover:via-[#10A37F]/30 transition-all duration-700" 
            />
          </div>
        </div>

        {/* Rest of the suggestions grid */}
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
                className="p-4 rounded-lg text-left transition-all duration-300
                  bg-gradient-premium from-[#40414F]/80 to-[#343541]/80
                  hover:from-[#40414F] hover:to-[#343541]
                  border border-white/[0.05] hover:border-white/[0.08]
                  group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-premium from-white/[0.03] to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="relative z-10 text-white/90 group-hover:text-white transition-colors">
                  {suggestion}
                </p>
              </button>
            )
          ))}
        </div>
      </div>
    );
  });

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

  // Replace the existing useEffects for localStorage with this fixed version
  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    const savedCurrentConversation = localStorage.getItem('currentConversation');
    
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations).map((conv: Conversation) => ({
          ...conv,
          timestamp: new Date(conv.timestamp),
          messages: conv.messages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        
        if (parsed.length > 0) {
          setConversations(parsed);
          if (savedCurrentConversation && parsed.some((conv: Conversation) => conv.id === savedCurrentConversation)) {
            setCurrentConversation(savedCurrentConversation);
          } else {
            setCurrentConversation(parsed[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading saved conversations:', error);
        // Initialize with empty state if there's an error
        setConversations([]);
        setCurrentConversation('');
      }
    }
  }, []); // Only run on mount

  // Separate useEffect for saving - add a check for mounted state
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // Skip initial render

    if (conversations.length > 0) {
      try {
        // Clean the conversations before saving
        const cleanConversations = conversations.map(conv => ({
          ...conv,
          messages: conv.messages.map(msg => ({
            ...msg,
            // Convert React elements to string placeholder
            content: React.isValidElement(msg.content) ? 'Loading...' : msg.content,
            timestamp: msg.timestamp
          }))
        }));
        
        localStorage.setItem('conversations', JSON.stringify(cleanConversations));
        localStorage.setItem('currentConversation', currentConversation);
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  }, [conversations, currentConversation, isMounted]);

  const handleHomeClick = () => {
    homeButtonRef.current?.triggerAnimation();
    emptyStateRef.current?.triggerLogoAnimation();
    setCurrentConversation('');
  };

  return (
    <BrowserRouter>
      <div className="h-screen flex bg-[#343541] text-white relative overflow-hidden">
        {/* Background3D implementation (currently disabled) */}
        {/*
        <Background3D 
          intensity="subtle" 
          className="absolute inset-0 pointer-events-none"
          interactive={true}
        />
        */}

        {/* Sidebar */}
        {isSidebarOpen && conversations.length > 0 && (
          <div className="w-80 bg-[#202123] border-r border-white/20 flex flex-col relative">
            {/* Top Icons */}
            <div className="p-2 flex items-center justify-between border-b border-white/[0.05]">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-white/5 rounded-md transition-all duration-300 hover:scale-105"
              >
                <SidebarClose className="w-5 h-5 text-white/80 hover:text-white" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 hover:bg-white/5 rounded-md transition-all duration-300 hover:scale-105"
                >
                  <Search className="w-5 h-5 text-white/80 hover:text-white" />
                </button>
                <button
                  onClick={startNewConversation}
                  className="p-2 hover:bg-white/5 rounded-md transition-all duration-300 hover:scale-105"
                >
                  <PenSquare className="w-5 h-5 text-white/80 hover:text-white" />
                </button>
              </div>
            </div>
            
            {/* HomeButton wrapper */}
            <div className="px-2 py-1">
              <HomeButton 
                ref={homeButtonRef}
                onNewChat={handleHomeClick}
              />
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {conversations
                .slice() // Create a copy to avoid mutating original array
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Sort by timestamp, newest first
                .map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversation(conv.id)}
                  className={cn(
                    "group w-full px-3 py-3 text-left text-white/90",
                    "hover:bg-gradient-to-r hover:from-[#2A2B32] hover:to-[#2A2B32]/80",
                    "transition-all duration-500 flex items-center gap-3 relative",
                    currentConversation === conv.id && "bg-gradient-to-r from-[#343541] to-[#343541]/90"
                  )}
                >
                  {/* Active indicator */}
                  {currentConversation === conv.id && (
                    <div className="absolute left-0 top-0 h-full w-[2px] bg-[#10A37F]" />
                  )}
                  
                  <MessageSquare className={`w-4 h-4 shrink-0 transition-colors duration-300
                    ${currentConversation === conv.id ? 'text-[#10A37F]' : 'text-white/70'}`} />
                  
                  <div className="flex-1 truncate text-sm font-medium">
                    {conv.title}
                  </div>
                  
                  <button
                    onClick={(e) => initiateDelete(conv.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 
                      rounded-full transition-all duration-200 hover:scale-105"
                    aria-label="Delete conversation"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="text-white/60 hover:text-white/90 transition-colors"
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
        <div className="flex-1 flex flex-col relative">
          {/* Top Bar */}
          {!isSidebarOpen && conversations.length > 0 && (
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
            {(!currentConversation || getCurrentConversation()?.messages.length === 0) ? (
              <EmptyState ref={emptyStateRef} />
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
                      "animate-content-reveal [&_p]:animate-content-reveal",
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
              <div className="relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Bhaiya AI..."
                  className="w-full bg-gradient-premium from-[#40414F]/90 to-[#343541]/90 
                    text-white rounded-lg pl-4 pr-12 py-3 
                    border border-white/[0.05] group-hover:border-white/[0.08]
                    focus:outline-none focus:ring-2 focus:ring-[#10A37F]/50
                    transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 
                    text-white/50 hover:text-white transition-colors p-1
                    hover:animate-hover-glow"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        <GlassDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Conversation"
          description="Are you sure you want to delete this conversation? This action cannot be undone."
          icon={<MessageSquare className="w-5 h-5 text-white/90" />}
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          variant="danger"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;