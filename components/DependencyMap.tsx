import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, {
  Handle,
  Position,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  NodeProps,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import dagre from 'dagre';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, FileCode, ShieldAlert, Database, Braces, Info, CornerDownRight } from 'lucide-react';
import { cn } from '../utils/cn';

// --- Layout Utility ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 240;
const nodeHeight = 120;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 50 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};


// --- Custom Nodes ---

const FragileNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={cn(
      "w-[240px] bg-black border-2 transition-all duration-200",
      "border-red-500 shadow-brutal-red",
      selected && "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 z-50",
      "relative group font-mono"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-white !w-4 !h-4 !border-2 !border-black !rounded-none -mt-2" />
      
      <div className="bg-red-500 text-black px-3 py-1 flex justify-between items-center border-b-2 border-red-700">
        <div className="text-[10px] font-bold uppercase tracking-wider">Critical Unit</div>
        <AlertTriangle size={14} />
      </div>

      <div className="p-4">
        <span className="text-white font-bold text-sm truncate w-full block mb-2" title={data.label}>{data.label}</span>
        
        <div className="flex items-center justify-between mt-2">
            <span className="text-red-500 text-xs uppercase font-bold">Fragility</span>
            <span className="bg-red-500/20 text-red-500 text-xs px-2 py-0.5 border border-red-500 font-bold">{data.fragilityScore}/10</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-red-500 !w-4 !h-4 !border-2 !border-black !rounded-none -mb-2" />
    </div>
  );
};

const SafeNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={cn(
      "w-[240px] bg-zinc-900 border-2 transition-all duration-200",
      "border-green-500 hover:shadow-brutal",
      selected && "ring-2 ring-white ring-offset-2 ring-offset-black scale-105 z-50",
      "relative group font-mono"
    )}>
      <Handle type="target" position={Position.Top} className="!bg-zinc-500 !w-4 !h-4 !border-2 !border-black !rounded-none -mt-2" />
      
      <div className="bg-zinc-800 text-zinc-400 px-3 py-1 flex justify-between items-center border-b border-zinc-700">
        <div className="text-[10px] font-bold uppercase tracking-wider">Standard Unit</div>
        <CheckCircle size={14} className="text-green-500" />
      </div>

      <div className="p-4">
        <span className="text-zinc-200 font-bold text-sm truncate w-full block mb-2" title={data.label}>{data.label}</span>
        
        <div className="flex items-center justify-between mt-2">
            <span className="text-zinc-500 text-xs uppercase font-bold">Stability</span>
            <span className="text-green-500 text-xs font-bold">OK</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500 !w-4 !h-4 !border-2 !border-black !rounded-none -mb-2" />
    </div>
  );
};

// --- Main Component ---

interface DependencyMapProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  summary?: string;
}

const DependencyMapContent: React.FC<DependencyMapProps> = ({ initialNodes = [], initialEdges = [], summary }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const { fitView } = useReactFlow();

  const nodeTypes = useMemo(() => ({ fragileNode: FragileNode, safeNode: SafeNode }), []);

  useEffect(() => {
    if (initialNodes.length > 0) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            initialNodes,
            initialEdges
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
        setTimeout(() => {
            fitView();
        }, 100);
    }
  }, [initialNodes, initialEdges, setNodes, setEdges, fitView]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const closeSidebar = () => setSelectedNode(null);

  const getDependencies = (nodeId: string) => {
    return edges
      .filter(edge => edge.source === nodeId)
      .map(edge => {
        const targetNode = nodes.find(n => n.id === edge.target);
        return targetNode ? targetNode.data.label : 'Unknown';
      });
  };
  
  const getDependents = (nodeId: string) => {
    return edges
      .filter(edge => edge.target === nodeId)
      .map(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        return sourceNode ? sourceNode.data.label : 'Unknown';
      });
  };

  return (
    <div className="w-full h-[750px] border-2 border-zinc-800 bg-black relative overflow-hidden group font-mono">
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 backdrop-blur-sm border-b border-zinc-800 p-3 flex justify-between items-center">
            <h3 className="text-sm font-bold text-green-500 uppercase tracking-widest flex items-center gap-2">
                <Braces size={16} /> 
                Dependency_Graph.sys
            </h3>
            <span className="text-[10px] text-zinc-500 uppercase">Interactive Mode: Active</span>
        </div>
        
        {/* Summary Overlay */}
        {summary && (
            <div className="absolute bottom-6 left-6 z-10 max-w-lg bg-black border-2 border-green-500 p-4 text-xs text-zinc-300 shadow-brutal pointer-events-none">
                <span className="bg-green-500 text-black font-bold px-2 py-0.5 uppercase tracking-wider mb-2 inline-block">Executive Summary</span>
                <p className="leading-relaxed font-medium">{summary}</p>
            </div>
        )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-grid"
        minZoom={0.1}
      >
        <Background color="#27272a" gap={40} size={1} />
        <Controls className="!bg-black !border-2 !border-zinc-700 !fill-white !rounded-none [&>button]:!border-b-zinc-700 [&>button]:!rounded-none hover:[&>button]:!bg-zinc-800" />
      </ReactFlow>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {selectedNode && (
          <>
             <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeSidebar}
                className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-20"
             />
             
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "tween", ease: "circOut", duration: 0.3 }}
              className="absolute right-0 top-0 bottom-0 w-[450px] bg-black border-l-2 border-green-500 z-30 p-0 shadow-2xl overflow-y-auto"
            >
              {/* Sidebar Header */}
              <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-3 border-2 shadow-sm",
                      selectedNode.type === 'fragileNode' 
                        ? "bg-red-500 text-black border-red-700" 
                        : "bg-green-500 text-black border-green-700"
                    )}>
                      <FileCode size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Target Identifier</span>
                        <h2 className="text-lg font-black text-white break-all leading-tight">{selectedNode.data.label}</h2>
                    </div>
                  </div>
                  <button 
                    onClick={closeSidebar}
                    className="p-2 border border-zinc-700 hover:bg-red-500 hover:text-black hover:border-red-500 text-zinc-400 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                
                {/* Score Panel */}
                <div className={cn(
                    "p-5 border-2 relative",
                    selectedNode.type === 'fragileNode' 
                        ? "border-red-500 bg-red-950/10" 
                        : "border-green-500 bg-green-950/10"
                )}>
                    <div className={cn("absolute -top-3 left-4 px-2 text-xs font-bold uppercase tracking-widest bg-black", selectedNode.type === 'fragileNode' ? "text-red-500" : "text-green-500")}>
                        System Health
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <div className="text-4xl font-black text-white">{selectedNode.data.fragilityScore}<span className="text-lg text-zinc-500">/10</span></div>
                            <div className="text-xs text-zinc-500 mt-1 uppercase">Calculated Risk Index</div>
                        </div>
                         {selectedNode.type === 'fragileNode' 
                            ? <AlertTriangle size={40} className="text-red-500" /> 
                            : <CheckCircle size={40} className="text-green-500" />
                        }
                    </div>
                </div>

                {/* Analysis Block */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-green-500 font-bold uppercase tracking-widest">
                    <Info size={14} />
                    Diagnostic Report
                  </div>
                  <div className="p-4 bg-zinc-900 border-l-2 border-zinc-700 text-sm text-zinc-300 leading-relaxed font-medium">
                    {selectedNode.data.details || "No specific diagnostics available for this unit."}
                  </div>
                </div>

                {/* Dependencies Lists */}
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">
                            Dependencies (Out) <span className="text-white ml-1">[{getDependencies(selectedNode.id).length}]</span>
                        </div>
                        <div className="space-y-2">
                            {getDependencies(selectedNode.id).map((depName, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400 font-medium hover:text-green-500 transition-colors">
                                    <CornerDownRight size={12} className="text-zinc-600" />
                                    <span className="truncate">{depName}</span>
                                </div>
                            ))}
                            {getDependencies(selectedNode.id).length === 0 && (
                                <span className="text-xs text-zinc-700 font-mono">// NULL SET</span>
                            )}
                        </div>
                    </div>
                    
                    <div>
                        <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">
                            Dependents (In) <span className="text-white ml-1">[{getDependents(selectedNode.id).length}]</span>
                        </div>
                         <div className="space-y-2">
                            {getDependents(selectedNode.id).map((depName, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-zinc-400 font-medium hover:text-green-500 transition-colors">
                                    <CornerDownRight size={12} className="text-zinc-600" />
                                    <span className="truncate">{depName}</span>
                                </div>
                            ))}
                            {getDependents(selectedNode.id).length === 0 && (
                                <span className="text-xs text-zinc-700 font-mono">// NULL SET</span>
                            )}
                        </div>
                    </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DependencyMap: React.FC<DependencyMapProps> = (props) => (
  <ReactFlowProvider>
    <DependencyMapContent {...props} />
  </ReactFlowProvider>
);