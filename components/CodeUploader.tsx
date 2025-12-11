import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileArchive, CheckCircle2, AlertTriangle, Loader2, Network, BrainCircuit, Terminal, ArrowUp, Play, Zap } from 'lucide-react';
import { cn } from '../utils/cn';
import { ProgressBar } from './ProgressBar';
import { processCodebase } from '../utils/fileProcessor';
import { analyzeCodebase } from '../utils/gemini';
import { Node, Edge } from 'reactflow';
import { DEMO_DATA } from '../utils/demoData';

type UploadStatus = 'idle' | 'dragging' | 'processing' | 'complete' | 'analyzing' | 'error';

interface CodeUploaderProps {
  onVisualize: (data: { nodes: Node[], edges: Edge[], summary: string }) => void;
}

const LOADING_MESSAGES = [
  "Initializing Gemini 3 Pro Environment...",
  "Reading 45,000 lines of code...",
  "Parsing AST for COBOL/Java bridge...",
  "Filling 1M Token Context Window...",
  "Tracing cross-language dependencies...",
  "Calculating Fragility Scores...",
  "Generating Knowledge Graph..."
];

export const CodeUploader: React.FC<CodeUploaderProps> = ({ onVisualize }) => {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<{ charCount: number } | null>(null);
  const [extractedContext, setExtractedContext] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<string>(LOADING_MESSAGES[0]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetUploader = () => {
    setStatus('idle');
    setProgress(0);
    setFileName(null);
    setErrorMessage(null);
    setStats(null);
    setExtractedContext('');
    setLoadingMessage(LOADING_MESSAGES[0]);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // Simulate the "Crunch" for the demo to show off the UI
  const handleDemo = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setStatus('processing');
    setFileName("Legacy_Checkout_System.zip (Demo)");
    setProgress(0);

    // Fake processing steps
    for (let i = 0; i < LOADING_MESSAGES.length; i++) {
        setLoadingMessage(LOADING_MESSAGES[i]);
        // Progress moves from 0 to 100 based on steps
        const stepProgress = ((i + 1) / LOADING_MESSAGES.length) * 100;
        setProgress(stepProgress);
        
        // Variable delay to feel "real"
        const delay = 800 + Math.random() * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    setStatus('complete');
    setStats({ charCount: 452000 }); // Fake char count
    
    // Auto-analyze for demo after short delay
    setTimeout(() => {
        onVisualize(DEMO_DATA);
    }, 800);
  };

  const handleProcessing = async (file: File) => {
    setStatus('processing');
    setFileName(file.name);
    setErrorMessage(null);
    setProgress(0);
    setLoadingMessage("Extracting Archive Payload...");

    try {
        const fullContext = await processCodebase(file, (percent) => {
            setProgress(percent);
            if (percent < 30) setLoadingMessage("Decompressing Stream...");
            else if (percent < 60) setLoadingMessage("Reading Source Files...");
            else if (percent < 90) setLoadingMessage("Filtering Binary Assets...");
            else setLoadingMessage("Finalizing Payload...");
        });

        console.log('--- Processing Complete ---');
        setStats({ charCount: fullContext.length });
        setExtractedContext(fullContext);
        setStatus('complete');
    } catch (error: any) {
        console.error("Processing failed:", error);
        setErrorMessage(error.message || "Failed to process the zip file.");
        setStatus('error');
    }
  };

  const handleAnalysis = async () => {
    if (!extractedContext) return;
    setStatus('analyzing');
    setProgress(0);
    
    // Simulate progress for analysis phase since API doesn't stream progress
    let msgIdx = 3; // Start from "Filling 1M Token..."
    const interval = setInterval(() => {
        if (msgIdx < LOADING_MESSAGES.length) {
            setLoadingMessage(LOADING_MESSAGES[msgIdx]);
            msgIdx++;
        }
    }, 2000);

    try {
      const graphData = await analyzeCodebase(extractedContext);
      clearInterval(interval);
      onVisualize(graphData);
    } catch (error: any) {
      clearInterval(interval);
      console.error("Analysis failed:", error);
      setErrorMessage(error.message || "AI Analysis failed. Check your API key.");
      setStatus('error');
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.zip') && file.type !== 'application/zip' && file.type !== 'application/x-zip-compressed') {
      setStatus('error');
      setErrorMessage('INVALID FILE FORMAT. REQUIRED: .ZIP');
      return;
    }
    handleProcessing(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (status !== 'processing' && status !== 'complete' && status !== 'analyzing') {
      setStatus('dragging');
    }
  }, [status]);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (status === 'dragging') {
      setStatus('idle');
    }
  }, [status]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (status === 'processing' || status === 'complete' || status === 'analyzing') return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [status]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleClick = () => {
    if (status !== 'processing' && status !== 'complete' && status !== 'analyzing') {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-mono">
      <motion.div
        layout
        onClick={handleClick}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative group cursor-pointer overflow-hidden border-4 border-dashed transition-all duration-200 ease-out",
          "min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-black",
          status === 'idle' && "border-zinc-800 hover:border-green-500 hover:bg-zinc-900/30",
          status === 'dragging' && "border-green-500 bg-green-900/10 scale-[1.01] shadow-brutal",
          (status === 'processing' || status === 'analyzing') && "border-green-500 border-solid cursor-default bg-black",
          status === 'complete' && "border-green-500 border-solid cursor-default bg-zinc-900/20",
          status === 'error' && "border-red-500 border-solid bg-red-900/10"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={onFileSelect}
        />
        
        {/* Decorative Corner Brackets for Technical Feel */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-transparent group-hover:border-green-500 transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-transparent group-hover:border-green-500 transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-transparent group-hover:border-green-500 transition-colors duration-300" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-transparent group-hover:border-green-500 transition-colors duration-300" />

        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center w-full z-10"
            >
              <div className="mb-6 p-6 border-2 border-zinc-800 bg-zinc-900 group-hover:border-green-500 group-hover:bg-black transition-all duration-300 shadow-none group-hover:shadow-brutal">
                <UploadCloud className="w-16 h-16 text-zinc-500 group-hover:text-green-500 transition-colors" />
              </div>
              
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">
                Drag & Drop <span className="text-green-500">Repository.zip</span>
              </h3>
              <p className="text-lg text-zinc-500 mb-8 max-w-md">
                or paste massive concatenated file.
                <br />
                <span className="text-xs uppercase tracking-widest text-zinc-600 mt-2 block">[ MAX SIZE: 500MB ]</span>
              </p>

              {/* No-Code Escape Hatch */}
              <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                 <div className="w-full h-px bg-zinc-800 flex items-center justify-center">
                    <span className="bg-black px-2 text-zinc-700 text-xs uppercase tracking-widest">OR</span>
                 </div>
                 
                 <button 
                    onClick={handleDemo}
                    className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-green-500 text-zinc-300 hover:text-green-500 font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-3 group/btn"
                 >
                    <Play className="w-4 h-4 fill-current group-hover/btn:text-green-500" />
                    Try Live Demo (Checkout System)
                 </button>
              </div>
            </motion.div>
          )}

          {status === 'dragging' && (
            <motion.div
              key="dragging"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center space-y-4 z-10"
            >
               <div className="p-8 border-4 border-green-500 bg-black shadow-brutal">
                 <ArrowUp className="w-20 h-20 text-green-500 animate-bounce" />
               </div>
              <h3 className="text-3xl font-black text-green-500 uppercase tracking-tighter animate-pulse">
                &gt;&gt; INJECT CODEBASE &lt;&lt;
              </h3>
            </motion.div>
          )}

          {(status === 'processing' || status === 'analyzing') && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl flex flex-col items-center space-y-10 z-10"
            >
              <div className="relative">
                 <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse-slow" />
                 <Terminal className="w-24 h-24 text-green-500 relative z-10" />
              </div>
              
              <div className="text-center w-full space-y-6">
                 <div>
                    <p className="text-2xl font-black text-white mb-2 uppercase tracking-tight">{fileName}</p>
                    <div className="flex items-center justify-center gap-2 text-green-500 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <p className="text-sm font-bold uppercase tracking-widest">{loadingMessage}</p>
                    </div>
                 </div>
                 
                 <ProgressBar progress={progress} className="w-full" label="System Protocol" />
                 
                 <div className="grid grid-cols-3 gap-2 text-xs text-zinc-600 font-mono uppercase text-left w-full mt-4">
                    <div className="border border-zinc-800 p-2">Memory: <span className="text-zinc-400">Allocating...</span></div>
                    <div className="border border-zinc-800 p-2">Threads: <span className="text-zinc-400">12 Active</span></div>
                    <div className="border border-zinc-800 p-2">Net: <span className="text-green-900">Encrypted</span></div>
                 </div>
              </div>
            </motion.div>
          )}

          {status === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-8 z-10 w-full"
            >
              <div className="p-6 border-2 border-green-500 bg-green-500/10 shadow-brutal">
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Payload Secure</h3>
                <p className="text-green-500 text-sm mt-2 font-mono border border-green-900/50 bg-green-900/10 px-4 py-1 inline-block">
                    {fileName}
                </p>
                {stats && (
                    <div className="mt-4 flex justify-center gap-4">
                         <div className="px-4 py-2 bg-zinc-900 border border-zinc-800">
                             <span className="text-zinc-500 text-xs uppercase block">Size</span>
                             <span className="text-white font-bold">{(stats.charCount / 1024).toFixed(0)} KB</span>
                         </div>
                         <div className="px-4 py-2 bg-zinc-900 border border-zinc-800">
                             <span className="text-zinc-500 text-xs uppercase block">Status</span>
                             <span className="text-green-500 font-bold">Ready</span>
                         </div>
                    </div>
                )}
              </div>
              
              <div className="flex gap-4 w-full max-w-md">
                  <button 
                    onClick={(e) => { e.stopPropagation(); resetUploader(); }}
                    className="flex-1 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 transition-colors"
                  >
                    Reset
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleAnalysis(); }}
                    className="flex-[2] py-4 bg-green-600 hover:bg-green-500 text-black font-black uppercase tracking-widest border border-green-500 shadow-brutal hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center justify-center gap-2"
                  >
                    <Network size={18} />
                    Run_Analysis
                  </button>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center space-y-6 z-10"
            >
              <div className="p-6 border-2 border-red-500 bg-red-500/10 shadow-brutal-red">
                <AlertTriangle className="w-20 h-20 text-red-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-red-500 uppercase tracking-tighter">System Malfunction</h3>
                <p className="text-zinc-400 text-sm mt-4 max-w-lg border border-red-900/50 bg-red-900/10 p-4 font-mono text-left">
                    <span className="text-red-500 mr-2">Error:</span>
                    {errorMessage}
                </p>
              </div>
               <button 
                onClick={(e) => { e.stopPropagation(); resetUploader(); }}
                className="mt-6 px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-white font-bold uppercase tracking-widest border border-zinc-700 transition-colors"
              >
                Retry Operation
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};