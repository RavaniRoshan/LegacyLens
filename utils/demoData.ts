import { Node, Edge } from 'reactflow';

export const DEMO_CONTEXT = `
// FILE: OrderController.java
public class OrderController {
  // God class implementation handling too many responsibilities
  private Logger logger = new Logger();
  private AuthService auth = new AuthService();

  public void processOrder(Order order) {
     if (!auth.check(order.userId)) return;

     // CRITICAL: Direct dependency instantiation
     LegacyPaymentGateway gw = new LegacyPaymentGateway();
     gw.charge(order.amount); 

     // Static coupling
     InventoryManager.update(order.items); 
     
     // CRITICAL: SQL Injection Vulnerability
     String sql = "INSERT INTO orders VALUES (" + order.id + ", " + order.amount + ")";
     DB_Connection_Pool.execute(sql);
     
     EmailService.send(order.userEmail);
  }
}

// FILE: LegacyPaymentGateway.java
public class LegacyPaymentGateway {
  // CRITICAL: Hardcoded API Credentials
  private String apiKey = "sk_live_8923748923748923"; 
  
  public void charge(double amount) {
     try {
       // DEPRECATED: Uses old SSLv3
       SSLContext ctx = SSLContext.getInstance("SSLv3"); 
     } catch (Exception e) {
       // CRITICAL: Swallows exceptions silently
       System.out.println("Payment error");
     }
  }
}

// FILE: DB_Connection_Pool.java
public class DB_Connection_Pool {
   private static List<Connection> pool = new ArrayList<>();
   
   // CRITICAL: Not thread safe, deadlock prone
   public static void execute(String sql) {
     Connection conn = pool.get(0);
     conn.run(sql);
   }
}

// FILE: InventoryManager.java
public class InventoryManager {
    public static void update(List<Item> items) {
        // Basic CRUD
    }
}
`;

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