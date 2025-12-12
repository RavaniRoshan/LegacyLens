import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Terminal, Sparkles, MinusCircle, Trash2, Image as ImageIcon, Lightbulb, ChevronRight, Check, Play, Cpu, Code2, AlertCircle } from 'lucide-react';
import { cn } from '../utils/cn';

interface ChatInterfaceProps {
    context: string;
    suggestions?: string[];
}

interface Message {
    role: 'user' | 'model';
    content: string;
    image?: string;
}

const STORAGE_KEY = 'legacylens_chat_history_v1';

// Helper: Parse Markdown for Code Blocks
type MessagePart = { type: 'text' | 'code' | 'diff'; content: string; language?: string };

const parseMessage = (content: string): MessagePart[] => {
    const regex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: MessagePart[] = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
        }
        const lang = match[1] || 'text';
        parts.push({ type: lang === 'diff' ? 'diff' : 'code', content: match[2], language: lang });
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < content.length) {
        parts.push({ type: 'text', content: content.slice(lastIndex) });
    }
    return parts;
};

// Component: Diff Viewer
const DiffViewer = ({ content }: { content: string }) => {
    const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected'>('pending');

    const handleAction = (action: 'accepted' | 'rejected') => {
        setStatus(action);
    };

    return (
        <div className="my-3 rounded-sm overflow-hidden border border-zinc-700 bg-zinc-900/50">
            <div className="flex items-center justify-between px-3 py-2 bg-zinc-900 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2">
                    <Code2 size={14} /> Suggested Change
                </span>
                {status === 'pending' ? (
                    <div className="flex gap-2">
                        <button onClick={() => handleAction('rejected')} className="text-[10px] uppercase font-bold text-red-500 hover:text-red-400 px-2 py-1 border border-red-900 hover:bg-red-900/20 transition-colors">
                            Reject
                        </button>
                        <button onClick={() => handleAction('accepted')} className="text-[10px] uppercase font-bold text-green-500 hover:text-green-400 px-2 py-1 border border-green-900 hover:bg-green-900/20 transition-colors flex items-center gap-1">
                            Accept Fix
                        </button>
                    </div>
                ) : (
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-1", status === 'accepted' ? "text-green-500" : "text-red-500")}>
                        {status === 'accepted' ? "Patch Applied" : "Rejected"}
                    </span>
                )}
            </div>
            <div className="p-3 font-mono text-xs overflow-x-auto">
                {content.split('\n').map((line, i) => {
                    const isAdd = line.startsWith('+');
                    const isRem = line.startsWith('-');
                    return (
                        <div key={i} className={cn(
                            "w-full px-1",
                            isAdd && "bg-green-500/10 text-green-400",
                            isRem && "bg-red-500/10 text-red-400",
                            !isAdd && !isRem && "text-zinc-400"
                        )}>
                            {line}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Component: Code Block
const CodeBlock = ({ content, language }: { content: string, language?: string }) => (
    <div className="my-2 rounded-sm overflow-hidden border border-zinc-800 bg-black">
        <div className="px-3 py-1 bg-zinc-900 text-[10px] font-bold text-zinc-500 uppercase border-b border-zinc-800 flex justify-between">
            <span>{language || 'TEXT'}</span>
            <button 
                onClick={() => navigator.clipboard.writeText(content)}
                className="hover:text-green-500 transition-colors"
            >
                COPY
            </button>
        </div>
        <pre className="p-3 text-xs text-zinc-300 font-mono overflow-x-auto">
            <code>{content}</code>
        </pre>
    </div>
);

// Component: Processing Animation
const ThinkingIndicator = () => (
    <div className="p-4 bg-zinc-900/30 border-l-2 border-green-500 mt-2 relative overflow-hidden group">
        <div className="absolute inset-0 bg-green-500/5 animate-pulse" />
        {/* Scanning Line */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-green-500/50 blur-[2px] animate-[slide_1s_ease-in-out_infinite]" />
        
        <div className="relative flex items-center gap-3">
             <div className="relative">
                <Cpu size={18} className="text-green-500 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-0 bg-green-500/30 blur-md animate-pulse" />
             </div>
             <div>
                <div className="text-xs font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                    Processing Query <span className="flex gap-0.5"><span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span></span>
                </div>
                <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    Gemini 3 Pro // Budget: 32k Tokens // Reasoning...
                </div>
             </div>
        </div>
    </div>
);


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ context, suggestions }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', content: "System Online. LegacyLens Neural Link Established.\n\nI have analyzed your repository. Accessing 1M+ token context window for deep reasoning. \n\nCommand me." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    // Load state from local storage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Handle legacy array format or new object format
                if (Array.isArray(parsed)) {
                    if (parsed.length > 0) setMessages(parsed);
                } else if (typeof parsed === 'object' && parsed !== null) {
                    if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
                        setMessages(parsed.messages);
                    }
                    if (typeof parsed.input === 'string') {
                        setInput(parsed.input);
                    }
                    if (typeof parsed.isOpen === 'boolean') {
                        setIsOpen(parsed.isOpen);
                    }
                }
            } catch (e) {
                console.warn("Failed to parse chat history");
            }
        }
    }, []);

    // Save state to local storage
    useEffect(() => {
        const stateToSave = {
            messages,
            input,
            isOpen
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    }, [messages, input, isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen, isStreaming]);

    const clearHistory = () => {
        const defaultMsg: Message = { role: 'model', content: "Memory Purged. System Online." };
        setMessages([defaultMsg]);
        setInput('');
        // We do not save immediately here because the useEffect will handle it
    };

    const handleSend = async (textInput: string = input) => {
        if (!textInput.trim() || isLoading) return;

        const userMsg: Message = { role: 'user', content: textInput };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setIsStreaming(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: messages,
                    context: context
                })
            });

            const contentType = response.headers.get("content-type");

            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                setIsStreaming(false);
                if (data.image) {
                    setMessages(prev => [...prev, { role: 'model', content: data.response || "Image generated.", image: data.image }]);
                } else if (data.response) {
                    setMessages(prev => [...prev, { role: 'model', content: data.response }]);
                } else if (data.error) {
                    setMessages(prev => [...prev, { role: 'model', content: `Error: ${data.error}` }]);
                }
            } 
            else if (response.body) {
                setMessages(prev => [...prev, { role: 'model', content: '' }]);
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedText = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        const lastMsg = newMessages[newMessages.length - 1];
                        if (lastMsg.role === 'model') {
                            lastMsg.content = accumulatedText;
                        }
                        return newMessages;
                    });
                }
            }

        } catch (e) {
             setMessages(prev => [...prev, { role: 'model', content: "Connection Protocol Failed: Network interruption." }]);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    return (
        <>
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-400 text-black border border-green-300 shadow-brutal flex items-center justify-center transition-all",
                    isOpen && "hidden"
                )}
            >
                <MessageSquare size={24} strokeWidth={2.5} />
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed top-16 bottom-0 right-0 z-40 w-full md:w-[450px] bg-black border-l-2 border-zinc-800 shadow-2xl flex flex-col font-mono"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
                            <div className="flex items-center gap-2">
                                <div className={cn("w-2 h-2 rounded-full", isStreaming ? "bg-green-400 animate-pulse" : "bg-green-600")} />
                                <div>
                                    <span className="text-green-500 font-bold uppercase text-xs tracking-widest block">
                                        LegacyLens AI
                                    </span>
                                    <span className="text-[10px] text-zinc-500 uppercase">Gemini 3 Pro + Nano Banana Pro</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={clearHistory} title="Purge Memory" className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-green-500 transition-colors"><MinusCircle size={18} /></button>
                            </div>
                        </div>

                        {messages.length === 1 && suggestions && suggestions.length > 0 && (
                            <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
                                <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase font-bold mb-3">
                                    <Lightbulb size={12} className="text-yellow-500" />
                                    <span>Suggested Inquiries</span>
                                </div>
                                <div className="space-y-2">
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSend(s)}
                                            className="w-full text-left px-3 py-2 bg-black border border-zinc-800 hover:border-green-500 text-zinc-300 text-xs hover:text-green-500 transition-all flex items-center justify-between group"
                                        >
                                            <span className="truncate">{s}</span>
                                            <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-6 bg-grid">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                                    <div className={cn(
                                        "w-8 h-8 flex-shrink-0 flex items-center justify-center border",
                                        msg.role === 'user' ? "bg-zinc-800 border-zinc-600" : "bg-green-900/20 border-green-500"
                                    )}>
                                        {msg.role === 'user' ? <User size={14} className="text-zinc-400" /> : <Terminal size={14} className="text-green-500" />}
                                    </div>
                                    <div className="max-w-[85%] space-y-2 w-full">
                                        <div className={cn(
                                            "p-3 text-sm border shadow-sm leading-relaxed whitespace-pre-wrap break-words",
                                            msg.role === 'user'
                                                ? "bg-zinc-900 border-zinc-700 text-zinc-300"
                                                : "bg-black border-green-500/50 text-green-500"
                                        )}>
                                            {parseMessage(msg.content).map((part, i) => {
                                                if (part.type === 'diff') return <DiffViewer key={i} content={part.content} />;
                                                if (part.type === 'code') return <CodeBlock key={i} content={part.content} language={part.language} />;
                                                return <span key={i}>{part.content}</span>;
                                            })}
                                        </div>
                                        {msg.image && (
                                            <div className="border border-green-500/30 p-1 bg-black">
                                                <img src={msg.image} alt="Generated Infographic" className="w-full h-auto" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isStreaming && <ThinkingIndicator />}
                        </div>

                        <div className="p-4 border-t border-zinc-800 bg-zinc-900">
                            <div className="flex gap-2">
                                <button className="p-2 text-zinc-500 hover:text-white border border-transparent hover:border-zinc-700 transition-colors">
                                    <ImageIcon size={18} />
                                </button>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Execute command..."
                                    disabled={isLoading}
                                    className="flex-grow bg-black border border-zinc-700 p-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500 transition-colors disabled:opacity-50"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading}
                                    className="bg-green-500 text-black p-2 border border-green-400 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slide {
                    0% { top: 0; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}} />
        </>
    );
};