import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { insertProductSchema, insertStoreSchema, insertOrderSchema, insertCartItemSchema, UserRole } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      // Handle incoming messages if needed
      console.log('received: %s', message);
    });
    
    ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Já Comprei WebSocket server' }));
  });
  
  const broadcastToAll = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // API Routes
  
  // Categories
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });
  
  // Stores
  app.get("/api/stores", async (req, res, next) => {
    try {
      // Get location parameters or use defaults
      const lat = parseFloat(req.query.lat as string) || 0;
      const lng = parseFloat(req.query.lng as string) || 0;
      const radius = parseFloat(req.query.radius as string) || 10; // km
      
      const stores = await storage.getNearbyStores(lat, lng, radius);
      res.json(stores);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/stores/:id", async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.id);
      const store = await storage.getStore(storeId);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      res.json(store);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/stores", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user is a merchant
      if (req.user.role !== UserRole.MERCHANT) {
        return res.status(403).json({ message: "Only merchants can create stores" });
      }
      
      const validationResult = insertStoreSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.format() 
        });
      }
      
      const storeData = validationResult.data;
      
      // Ensure merchantId is set to current user
      storeData.merchantId = req.user.id;
      
      const store = await storage.createStore(storeData);
      res.status(201).json(store);
    } catch (error) {
      next(error);
    }
  });
  
  // Products
  app.get("/api/products/featured", async (req, res, next) => {
    try {
      const featuredProducts = await storage.getFeaturedProducts();
      res.json(featuredProducts);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/stores/:storeId/products", async (req, res, next) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const products = await storage.getProductsByStore(storeId);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/products", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user is a merchant
      if (req.user.role !== 'merchant') {
        return res.status(403).json({ message: "Only merchants can create products" });
      }
      
      const validationResult = insertProductSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.format() 
        });
      }
      
      const productData = validationResult.data;
      
      // Verify store belongs to merchant
      const store = await storage.getStore(productData.storeId);
      
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      
      if (store.merchantId !== req.user.id) {
        return res.status(403).json({ message: "You don't own this store" });
      }
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });
  
  // Cart
  app.get("/api/cart", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cartItems = await storage.getCartItems(req.user.id);
      
      // For each cart item, get the product details
      const cartWithDetails = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product,
          };
        })
      );
      
      res.json(cartWithDetails);
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/cart", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const validationResult = insertCartItemSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.format() 
        });
      }
      
      const cartItemData = validationResult.data;
      
      // Ensure userId is set to current user
      cartItemData.userId = req.user.id;
      
      // Verify product exists
      const product = await storage.getProduct(cartItemData.productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      const cartItem = await storage.addCartItem(cartItemData);
      
      // Get product details to return with cart item
      const itemWithProduct = {
        ...cartItem,
        product,
      };
      
      res.status(201).json(itemWithProduct);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/cart/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (typeof quantity !== 'number' || quantity < 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Get product details to return with cart item
      const product = await storage.getProduct(updatedCartItem.productId);
      const itemWithProduct = {
        ...updatedCartItem,
        product,
      };
      
      res.json(itemWithProduct);
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/cart/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cartItemId = parseInt(req.params.id);
      const success = await storage.removeCartItem(cartItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.sendStatus(204); // No content
    } catch (error) {
      next(error);
    }
  });
  
  app.delete("/api/cart", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      await storage.clearCart(req.user.id);
      res.sendStatus(204); // No content
    } catch (error) {
      next(error);
    }
  });
  
  // Orders
  app.get("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      let orders;
      
      // Return orders based on user role
      switch(req.user.role) {
        case 'consumer':
          orders = await storage.getOrdersByUser(req.user.id);
          break;
        case 'merchant':
          // Get all stores owned by merchant
          const stores = await storage.getStoresByMerchant(req.user.id);
          
          // Get orders for each store
          const storeOrders = await Promise.all(
            stores.map(store => storage.getOrdersByStore(store.id))
          );
          
          // Flatten array of arrays
          orders = storeOrders.flat();
          break;
        case 'delivery':
          orders = await storage.getOrdersByDeliveryPerson(req.user.id);
          break;
        default:
          orders = [];
      }
      
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });
  
  app.get("/api/orders/:id", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permission to view this order
      let hasPermission = false;
      
      switch(req.user.role) {
        case 'consumer':
          hasPermission = order.userId === req.user.id;
          break;
        case 'merchant':
          // Get all stores owned by merchant
          const stores = await storage.getStoresByMerchant(req.user.id);
          hasPermission = stores.some(store => store.id === order.storeId);
          break;
        case 'delivery':
          hasPermission = order.deliveryPersonId === req.user.id;
          break;
      }
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to view this order" });
      }
      
      // Get order items
      const items = await storage.getOrderItems(orderId);
      
      // Get order status history
      const statusHistory = await storage.getOrderStatusHistory(orderId);
      
      res.json({
        ...order,
        items,
        statusHistory,
      });
    } catch (error) {
      next(error);
    }
  });
  
  app.post("/api/orders", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Ensure user is a consumer
      if (req.user.role !== 'consumer') {
        return res.status(403).json({ message: "Only consumers can create orders" });
      }
      
      const validationResult = insertOrderSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: validationResult.error.format() 
        });
      }
      
      const orderData = validationResult.data;
      
      // Ensure userId is set to current user
      orderData.userId = req.user.id;
      
      // Create order
      const order = await storage.createOrder(orderData);
      
      // Create initial status history entry
      await storage.createOrderStatusHistory({
        orderId: order.id,
        status: "pending",
        timestamp: new Date(),
        description: "Order created and pending confirmation",
      });
      
      // Clear cart after successful order
      await storage.clearCart(req.user.id);
      
      // Notify via WebSocket about new order
      broadcastToAll({
        type: 'new_order',
        orderId: order.id,
        storeId: order.storeId,
        status: order.status,
      });
      
      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  });
  
  app.put("/api/orders/:id/status", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const orderId = parseInt(req.params.id);
      const { status, description } = req.body;
      
      // Validate status
      const validStatuses = ["pending", "confirmed", "preparing", "ready", "delivering", "delivered", "cancelled"];
      
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      // Get order
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check permission to update order status
      let hasPermission = false;
      
      switch(req.user.role) {
        case 'merchant':
          // Merchants can update to confirmed, preparing, ready, or cancelled
          if (["confirmed", "preparing", "ready", "cancelled"].includes(status)) {
            // Get all stores owned by merchant
            const stores = await storage.getStoresByMerchant(req.user.id);
            hasPermission = stores.some(store => store.id === order.storeId);
          }
          break;
        case 'delivery':
          // Delivery person can update to delivering or delivered
          if (["delivering", "delivered"].includes(status)) {
            hasPermission = order.deliveryPersonId === req.user.id;
          }
          break;
        case 'consumer':
          // Consumers can only cancel their own orders
          if (status === "cancelled") {
            hasPermission = order.userId === req.user.id;
          }
          break;
      }
      
      if (!hasPermission) {
        return res.status(403).json({ message: "You don't have permission to update this order status" });
      }
      
      // Update order status
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Failed to update order status" });
      }
      
      // Add entry to status history
      await storage.createOrderStatusHistory({
        orderId,
        status,
        timestamp: new Date(),
        description: description || `Order status updated to ${status}`,
      });
      
      // Notify via WebSocket about order status change
      broadcastToAll({
        type: 'order_status_updated',
        orderId,
        status,
        timestamp: new Date(),
      });
      
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });
  
  // Assign delivery person to order
  app.put("/api/orders/:id/assign", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Only delivery person can assign themselves
      if (req.user.role !== 'delivery') {
        return res.status(403).json({ message: "Only delivery personnel can accept orders" });
      }
      
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if order is in a status where it can be assigned
      if (order.status !== "ready") {
        return res.status(400).json({ message: "Order is not ready for delivery" });
      }
      
      // Check if order already has a delivery person
      if (order.deliveryPersonId) {
        return res.status(400).json({ message: "Order already has a delivery person assigned" });
      }
      
      // Update order with delivery person
      const updatedOrder = await storage.updateUser(orderId, { 
        deliveryPersonId: req.user.id,
        status: "delivering"
      });
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Failed to assign delivery person" });
      }
      
      // Add entry to status history
      await storage.createOrderStatusHistory({
        orderId,
        status: "delivering",
        timestamp: new Date(),
        description: `Order assigned to delivery person and out for delivery`,
      });
      
      // Notify via WebSocket about delivery assignment
      broadcastToAll({
        type: 'order_assigned_delivery',
        orderId,
        deliveryPersonId: req.user.id,
        status: "delivering",
      });
      
      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
