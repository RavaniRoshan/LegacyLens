import { Node, Edge } from 'reactflow';

// Matches the API schema
interface APINode {
  id: string;
  type: 'fragile' | 'standard';
  data: {
    label: string;
    fragilityScore: number;
    details: string;
  };
  position: { x: number; y: number };
}

interface APIEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

interface APIResponse {
  summary: string;
  suggestions?: string[];
  nodes: APINode[];
  edges: APIEdge[];
}

export const analyzeCodebase = async (fullContext: string, signal?: AbortSignal): Promise<{ nodes: Node[], edges: Edge[], summary: string, suggestions?: string[] }> => {
  try {
    const response = await fetch('/api/analyze-codebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullContext }),
        signal
    });

    if (!response.ok) {
        // Handle 413 Payload Too Large specifically
        if (response.status === 413) {
            throw new Error("Repository is too large for analysis. Please try a smaller subset.");
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Analysis failed (${response.status})`);
    }

    const data: APIResponse = await response.json();

    // Map API nodes to React Flow nodes
    // Note: Position is set to 0,0 here, layout is handled by Dagre in the component
    const nodes: Node[] = (data.nodes || []).map((node) => ({
      id: node.id,
      type: node.type === 'fragile' ? 'fragileNode' : 'safeNode', // Map 'standard' to 'safeNode'
      position: { x: 0, y: 0 },
      data: {
        label: node.data.label,
        fragilityScore: node.data.fragilityScore,
        details: node.data.details,
        // Calculate derived risk label for UI compatibility
        risk: node.data.fragilityScore >= 8 ? 'Critical' : node.data.fragilityScore >= 5 ? 'Moderate' : 'Low',
      },
    }));

    const edges: Edge[] = (data.edges || []).map((edge) => ({
      id: edge.id || `e-${edge.source}-${edge.target}`,
      source: edge.source,
      target: edge.target,
      animated: edge.animated !== false,
      style: { stroke: '#71717a' },
    }));

    // Fallback for empty graph
    if (nodes.length === 0) {
        return {
            nodes: [
                { id: 'root', position: { x: 0, y: 0 }, data: { label: 'Empty Graph', fragilityScore: 0, details: 'No dependencies found or parsing failed.' }, type: 'safeNode' }
            ],
            edges: [],
            summary: data.summary || "Analysis completed but no graph structure could be determined.",
            suggestions: data.suggestions || []
        };
    }

    return { nodes, edges, summary: data.summary, suggestions: data.suggestions };

  } catch (error: any) {
    if (error.name === 'AbortError') {
        throw new Error("Analysis timed out (90s limit). The codebase may be too large.");
    }
    console.error("AI Analysis Failed:", error);
    throw error;
  }
};