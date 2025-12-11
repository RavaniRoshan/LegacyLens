import { Node, Edge } from 'reactflow';

export const DEMO_DATA: { nodes: Node[], edges: Edge[], summary: string } = {
  summary: "Legacy Java 7 Monolith. Analysis reveals a 'God Class' controller with high cyclomatic complexity and critical SQL injection vulnerabilities in the data access layer. High risk of cascading failures.",
  nodes: [
    {
      id: "OrderController.java",
      type: "fragileNode",
      position: { x: 0, y: 0 },
      data: { label: "OrderController.java", fragilityScore: 9, details: "God Class (4000+ lines). Handles Auth, Logging, and Business Logic directly. Zero tests.", risk: "Critical" }
    },
    {
      id: "LegacyPaymentGateway.java",
      type: "fragileNode",
      position: { x: 0, y: 0 },
      data: { label: "LegacyPaymentGateway.java", fragilityScore: 8, details: "Hardcoded API keys. Deprecated SSL implementation. Catches generic Exception.", risk: "Critical" }
    },
    {
      id: "InventoryManager.java",
      type: "safeNode",
      position: { x: 0, y: 0 },
      data: { label: "InventoryManager.java", fragilityScore: 4, details: "Standard CRUD operations. Reasonably isolated, though lacks error handling.", risk: "Low" }
    },
    {
      id: "UserSession.java",
      type: "safeNode",
      position: { x: 0, y: 0 },
      data: { label: "UserSession.java", fragilityScore: 5, details: "Stateful session bean. Moderate memory leak risk under load.", risk: "Moderate" }
    },
    {
      id: "DB_Connection_Pool.java",
      type: "fragileNode",
      position: { x: 0, y: 0 },
      data: { label: "DB_Connection_Pool.java", fragilityScore: 10, details: "Custom implementation of connection pooling. Deadlock prone. Concatenates raw SQL strings.", risk: "Critical" }
    },
    {
      id: "EmailService.java",
      type: "safeNode",
      position: { x: 0, y: 0 },
      data: { label: "EmailService.java", fragilityScore: 2, details: "Simple utility class. Low complexity.", risk: "Low" }
    }
  ],
  edges: [
    { id: "e1", source: "OrderController.java", target: "LegacyPaymentGateway.java", animated: true, style: { stroke: '#ef4444' } },
    { id: "e2", source: "OrderController.java", target: "InventoryManager.java", animated: true, style: { stroke: '#71717a' } },
    { id: "e3", source: "OrderController.java", target: "UserSession.java", animated: false, style: { stroke: '#71717a' } },
    { id: "e4", source: "OrderController.java", target: "DB_Connection_Pool.java", animated: true, style: { stroke: '#ef4444' } },
    { id: "e5", source: "LegacyPaymentGateway.java", target: "DB_Connection_Pool.java", animated: true, style: { stroke: '#ef4444' } },
    { id: "e6", source: "InventoryManager.java", target: "DB_Connection_Pool.java", animated: true, style: { stroke: '#71717a' } },
    { id: "e7", source: "OrderController.java", target: "EmailService.java", animated: false, style: { stroke: '#71717a' } }
  ]
};