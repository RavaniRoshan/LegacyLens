import React, { useState } from 'react';
import { DependencyMap } from './components/DependencyMap';
import { LandingPage } from './components/LandingPage';
import { ChatInterface } from './components/ChatInterface';
import { Github, ArrowLeft, Terminal, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Node, Edge } from 'reactflow';

interface GraphData {
  nodes: Node[];
  edges: Edge[];
  summary?: string;
  suggestions?: string[];
}

export default function App() {
  const [view, setView] = useState<'landing' | 'visualize'>('landing');
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [codeContext, setCodeContext] = useState<string>('');

  const handleVisualize = (data: { nodes: Node[], edges: Edge[], summary: string, suggestions?: string[] }, context: string) => {
    setGraphData(data);
    setCodeContext(context);
    setView('visualize');
  };

  const navigateToHome = () => {
    setView('landing');
    setCodeContext('');
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono selection:bg-green-500 selection:text-black flex flex-col relative overflow-hidden">
      
      {/* Grid Bg */}
      <div className="absolute inset-0 bg-grid z-0 opacity-40 pointer-events-none" />

      {/* Main Content */}
      <main className="flex-grow flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            {view === 'landing' ? (
                <motion.div 
                    key="landing-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                >
                    <LandingPage onVisualize={handleVisualize} />
                </motion.div>
            ) : (
                <motion.div 
                    key="visualize-view"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="w-full flex flex-col h-screen"
                >
                    {/* Map Header */}
                     <header className="border-b border-zinc-800 bg-black/90 backdrop-blur-sm z-50">
                        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={navigateToHome}>
                            <div className="w-8 h-8 bg-black flex items-center justify-center border border-zinc-700 group-hover:border-green-500 transition-colors">
                            <Terminal className="w-5 h-5 text-green-500" />
                            </div>
                            <span className="font-bold text-lg tracking-tight uppercase text-white">LegacyLens<span className="text-zinc-600 text-xs ml-1">_MAP</span></span>
                        </div>
                         <button 
                            onClick={navigateToHome}
                            className="flex items-center gap-2 text-zinc-500 hover:text-green-500 transition-colors uppercase font-bold text-xs tracking-widest"
                         >
                            <ArrowLeft size={16} />
                            Return to Terminal
                         </button>
                        </div>
                    </header>
                    
                    <div className="flex-grow bg-black relative">
                         <DependencyMap 
                            initialNodes={graphData.nodes} 
                            initialEdges={graphData.edges} 
                            summary={graphData.summary}
                        />
                        <ChatInterface context={codeContext} suggestions={graphData.suggestions} />
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
      </main>
    </div>
  );
}