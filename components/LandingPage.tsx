import React from 'react';
import { motion, useScroll, useTransform, Variants } from 'framer-motion';
import { Github, Terminal, Activity, FileArchive, Cpu, Map, ShieldAlert, Trophy } from 'lucide-react';
import { CodeUploader } from './CodeUploader';
import { Node, Edge } from 'reactflow';
import { DEMO_DATA, DEMO_CONTEXT } from '../utils/demoData';

interface LandingPageProps {
  onVisualize: (data: { nodes: Node[], edges: Edge[], summary: string, suggestions?: string[] }, context: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: "spring",
      stiffness: 70,
      damping: 15
    }
  }
};

export const LandingPage: React.FC<LandingPageProps> = ({ onVisualize }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <div className="min-h-screen bg-black text-zinc-300 font-mono selection:bg-green-500 selection:text-black flex flex-col relative overflow-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Static Grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        
        {/* Scanning Line */}
        <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-green-500/50 to-transparent shadow-[0_0_20px_rgba(34,197,94,0.4)]"
        />

        {/* Floating Blobs */}
        <motion.div 
            style={{ y: y1, x: -100 }}
            className="absolute top-20 left-10 w-96 h-96 bg-green-500/10 rounded-full blur-[100px]" 
        />
        <motion.div 
            style={{ y: y2, x: 100 }}
            className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Navbar */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 bg-green-500 flex items-center justify-center border border-green-400 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold text-lg tracking-tighter text-white uppercase">LegacyLens<span className="text-green-500">_v1.0</span></span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-900/20 border border-blue-500/50 text-blue-400 text-xs font-bold uppercase tracking-widest rounded-full">
                <Trophy size={14} />
                Kaggle Competition Project
             </div>
             <a 
                href="https://github.com/RavaniRoshan/LegacyLens" 
                target="_blank" 
                rel="noreferrer" 
                className="text-zinc-500 hover:text-green-500 transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-widest group"
            >
                <Github className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                Source
            </a>
            <button
                onClick={() => onVisualize(DEMO_DATA, DEMO_CONTEXT)}
                className="bg-green-500 text-black px-5 py-2 text-xs font-bold uppercase tracking-widest border border-green-400 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
                Launch App
            </button>
          </motion.div>
        </div>
      </nav>

      <main className="flex-grow relative z-10">
        
        {/* HERO SECTION */}
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 flex flex-col items-center text-center relative"
        >
            
            {/* System Status Badge */}
            <motion.div variants={itemVariants} className="mb-8">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-green-900/50 text-green-500 text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                    <Activity className="w-3 h-3 animate-pulse" />
                    <span>System Status: Online</span>
                </div>
            </motion.div>

            {/* H1 Headline */}
            <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-8 max-w-5xl leading-[0.9] z-20"
            >
                Tame Your Terrifying <br />
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-300 to-green-500 pb-2">
                    Legacy Monolith.
                    <motion.span 
                        className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-300 to-green-500 opacity-20 blur-xl"
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    />
                </span>
            </motion.h1>

            {/* H2 Subheadline */}
            <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-zinc-500 max-w-3xl mb-12 leading-relaxed font-medium"
            >
                Instant dependency mapping and fragility analysis for 10-year-old codebases (PHP, COBOL, Java). 
                <span className="text-zinc-300 block mt-2">Powered by Gemini 3 Pro’s 1M+ token context window.</span>
            </motion.p>

            {/* THE BIG BOX (Input Mechanism) */}
            <motion.div 
                variants={itemVariants}
                className="w-full mb-16 relative z-30"
            >
                <div className="absolute inset-0 bg-green-500/5 blur-3xl rounded-full -z-10" />
                <CodeUploader onVisualize={onVisualize} />
            </motion.div>

            {/* Tech Stack Badges */}
            <motion.div 
                variants={itemVariants}
                className="flex flex-wrap justify-center items-center gap-4 md:gap-6 text-zinc-600 text-xs font-bold uppercase tracking-widest"
            >
                <span className="text-zinc-500">Supports:</span>
                {["Legacy PHP", "Java 6-8", "COBOL", "Perl", "Python 2.7"].map((tech, i) => (
                    <motion.span 
                        key={tech}
                        whileHover={{ scale: 1.05, borderColor: '#22c55e', color: '#22c55e' }}
                        className="px-3 py-2 border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm cursor-default transition-colors"
                    >
                        {tech}
                    </motion.span>
                ))}
            </motion.div>
        </motion.div>

        {/* VALUE PROP SECTION */}
        <div className="border-t border-zinc-800 bg-zinc-900/30 backdrop-blur-sm py-24 relative overflow-hidden">
             
             {/* Section Label */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4 py-1 border border-zinc-800 text-green-500 text-xs font-bold uppercase tracking-widest z-20">
                System Architecture
             </div>

             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                
                {/* How It Works */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
                    {[
                        {
                            icon: <FileArchive className="w-8 h-8 text-white" />,
                            step: "01. Ingest",
                            text: "We load your entire architecture into Gemini's 1M+ context window—no chunking, no lost context."
                        },
                        {
                            icon: <Cpu className="w-8 h-8 text-green-500" />,
                            step: "02. Analyze",
                            text: "The AI reconstructs the dependency graph across all files and languages simultaneously."
                        },
                        {
                            icon: <Map className="w-8 h-8 text-white" />,
                            step: "03. Visualize",
                            text: "Get an interactive map highlighting critical 'blast radius' zones before you deploy."
                        }
                    ].map((item, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="flex flex-col items-center text-center group"
                        >
                            <div className="w-20 h-20 bg-black border border-zinc-800 flex items-center justify-center mb-6 group-hover:border-green-500 transition-colors shadow-brutal hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]">
                                {item.icon}
                            </div>
                            <div className="text-green-500 font-bold uppercase tracking-widest mb-2 text-sm">{item.step}</div>
                            <p className="text-zinc-400 leading-relaxed max-w-xs text-sm">{item.text}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Fragility Heatmapping Feature */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border border-zinc-800 bg-black p-8 md:p-12 shadow-brutal relative overflow-hidden"
                >
                    {/* Background Glitch Effect for Box */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-20" />

                    <div className="relative z-10">
                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/10 border border-red-900/30 text-red-500 text-xs font-bold uppercase tracking-widest mb-6">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Risk Detection</span>
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
                            Fragility <span className="text-red-500">Heatmapping</span>
                        </h3>
                        <p className="text-zinc-400 leading-relaxed mb-6 font-medium">
                            Identify the load-bearing code. See which functions will break the most systems if modified. We calculate a fragility score (0-10) based on coupling, complexity, and downstream impact.
                        </p>
                        <ul className="space-y-4">
                            {['Cyclomatic Complexity Analysis', 'Cross-Service Dependency Tracing', 'Deprecated Syntax Highlighting'].map((item, i) => (
                                <motion.li 
                                    key={item}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 + (i * 0.1) }}
                                    className="flex items-center gap-3 text-sm text-zinc-300 font-mono"
                                >
                                    <div className="w-1.5 h-1.5 bg-green-500 shadow-[0_0_5px_#22c55e]" />
                                    {item}
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Visual Graphic Representation */}
                    <div className="relative h-72 bg-zinc-900/50 border border-zinc-800 flex items-center justify-center overflow-hidden group">
                        <div className="absolute inset-0 bg-grid opacity-20 group-hover:opacity-30 transition-opacity" />
                        
                        {/* Mock Graph Nodes */}
                        <div className="relative z-10 w-full h-full">
                            {/* Central Red Node */}
                            <motion.div 
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-red-500/10 border-2 border-red-500 flex items-center justify-center shadow-[0_0_40px_rgba(239,68,68,0.2)]"
                            >
                                <div className="text-center">
                                    <div className="text-red-500 font-bold text-xs uppercase tracking-widest mb-1">Core.php</div>
                                    <div className="text-white font-black text-3xl">9.8</div>
                                </div>
                            </motion.div>
                            
                            {/* Connecting Lines & Satellites */}
                            {[0, 72, 144, 216, 288].map((deg, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, rotate: deg }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="absolute top-1/2 left-1/2 w-0.5 h-32 bg-zinc-800 origin-top"
                                    style={{ transform: `translate(-50%, 0) rotate(${deg}deg)` }}
                                >
                                    <motion.div 
                                        animate={{ y: [0, 10, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
                                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-700 border border-zinc-500" 
                                    />
                                </motion.div>
                            ))}
                        </div>
                        
                        <div className="absolute bottom-4 right-4 bg-black border border-red-500 px-3 py-1 text-red-500 text-xs font-bold uppercase tracking-widest z-20">
                            Critical Failure Point
                        </div>
                    </div>
                </motion.div>

             </div>
        </div>

      </main>

      <footer className="border-t border-zinc-800 py-12 bg-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-zinc-600 text-xs uppercase tracking-widest">
            <span>&copy; 2024 LegacyLens Inc. // All systems operational</span>
            <div className="flex gap-8 mt-4 md:mt-0">
                <a href="#" className="hover:text-green-500 hover:underline decoration-green-500 underline-offset-4">Privacy_Protocol</a>
                <a href="#" className="hover:text-green-500 hover:underline decoration-green-500 underline-offset-4">Terms_of_Use</a>
            </div>
        </div>
      </footer>
    </div>
  );
};