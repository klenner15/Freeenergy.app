import { 
  users, type User, type InsertUser,
  stores, type Store, type InsertStore,
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  orderStatusHistory, type OrderStatusHistory, type InsertOrderStatusHistory,
  cartItems, type CartItem, type InsertCartItem,
  UserRole
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // Session
  sessionStore: session.SessionStore;
  
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Stores
  getStore(id: number): Promise<Store | undefined>;
  getStoresByMerchant(merchantId: number): Promise<Store[]>;
  getNearbyStores(latitude: number, longitude: number, radius: number): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, storeData: Partial<Store>): Promise<Store | undefined>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByStore(storeId: number): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined>;
  
  // Orders
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  getOrdersByStore(storeId: number): Promise<Order[]>;
  getOrdersByDeliveryPerson(deliveryPersonId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Order Status History
  getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]>;
  createOrderStatusHistory(statusHistory: InsertOrderStatusHistory): Promise<OrderStatusHistory>;
  
  // Cart
  getCartItems(userId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stores: Map<number, Store>;
  private categories: Map<number, Category>;
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private orderStatusHistory: Map<number, OrderStatusHistory>;
  private cartItems: Map<number, CartItem>;
  
  sessionStore: session.SessionStore;
  
  private userCurrentId: number;
  private storeCurrentId: number;
  private categoryCurrentId: number;
  private productCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;
  private orderStatusHistoryCurrentId: number;
  private cartItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.stores = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.orderStatusHistory = new Map();
    this.cartItems = new Map();
    
    this.userCurrentId = 1;
    this.storeCurrentId = 1;
    this.categoryCurrentId = 1;
    this.productCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.orderStatusHistoryCurrentId = 1;
    this.cartItemCurrentId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with some categories
    this.initializeCategories();
  }
  
  private initializeCategories() {
    const defaultCategories: InsertCategory[] = [
      { name: "Mercearia", icon: "shopping-bag", color: "#FF6B00" },
      { name: "Padaria", icon: "cake", color: "#0069FF" },
      { name: "Feira", icon: "shopping-cart", color: "#16A34A" },
      { name: "Presentes", icon: "gift", color: "#F97316" },
      { name: "Farmácia", icon: "pill", color: "#ef4444" },
      { name: "Restaurante", icon: "utensils", color: "#f59e0b" },
      { name: "Bebidas", icon: "wine", color: "#8b5cf6" },
      { name: "Pet Shop", icon: "paw-print", color: "#10b981" }
    ];
    
    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
    
    // Adicionar lojas de demonstração
    const demoStores: InsertStore[] = [
      {
        name: "Supermercado Express",
        description: "Tudo que você precisa com entrega rápida",
        address: "Rua das Flores, 123",
        logoUrl: null,
        coverUrl: null,
        rating: "4.8",
        merchantId: 1,
        latitude: "-23.5505",
        longitude: "-46.6333",
        category: "Mercearia",
        deliveryTime: "15-30 min",
        tags: ["Mercearia", "Padaria", "Feira"]
      },
      {
        name: "Farmácia Popular",
        description: "Medicamentos e produtos de higiene",
        address: "Av. Paulista, 1000",
        logoUrl: null,
        coverUrl: null,
        rating: "4.5",
        merchantId: 2,
        latitude: "-23.5605",
        longitude: "-46.6433",
        category: "Farmácia",
        deliveryTime: "20-40 min",
        tags: ["Farmácia", "Saúde"]
      },
      {
        name: "Restaurante da Vila",
        description: "Comida caseira com sabor de família",
        address: "Rua Pequena, 78",
        logoUrl: null,
        coverUrl: null,
        rating: "4.7",
        merchantId: 3,
        latitude: "-23.5625",
        longitude: "-46.6500",
        category: "Restaurante",
        deliveryTime: "30-45 min",
        tags: ["Restaurante", "Comida Caseira"]
      }
    ];
    
    demoStores.forEach(store => {
      this.createStore(store);
    });
    
    // Adicionar produtos de demonstração
    const demoProducts: InsertProduct[] = [
      {
        name: "Arroz Integral",
        description: "Arroz integral premium, pacote 1kg",
        price: "12.90",
        storeId: 1,
        category: "Mercearia",
        imageUrl: null,
        featured: true,
        stock: 50,
        rating: null
      },
      {
        name: "Pão Francês",
        description: "Pão francês crocante, unidade",
        price: "0.75",
        storeId: 1,
        category: "Padaria",
        imageUrl: null,
        featured: true,
        stock: 100,
        rating: null
      },
      {
        name: "Dipirona",
        description: "Analgésico e antitérmico, 500mg",
        price: "5.50",
        storeId: 2,
        category: "Farmácia",
        imageUrl: null,
        featured: true,
        stock: 30,
        rating: null
      },
      {
        name: "Alface Crespa",
        description: "Alface fresca orgânica",
        price: "3.99",
        storeId: 1,
        category: "Feira",
        imageUrl: null,
        featured: true,
        stock: 20,
        rating: null
      }
    ];
    
    demoProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Stores
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }
  
  async getStoresByMerchant(merchantId: number): Promise<Store[]> {
    return Array.from(this.stores.values()).filter(
      (store) => store.merchantId === merchantId,
    );
  }
  
  async getNearbyStores(latitude: number, longitude: number, radius: number): Promise<Store[]> {
    // Simple implementation for demo purposes
    // In a real app, this would use proper geospatial calculations
    return Array.from(this.stores.values());
  }
  
  async createStore(store: InsertStore): Promise<Store> {
    const id = this.storeCurrentId++;
    const createdAt = new Date();
    const newStore: Store = { ...store, id, createdAt };
    this.stores.set(id, newStore);
    return newStore;
  }
  
  async updateStore(id: number, storeData: Partial<Store>): Promise<Store | undefined> {
    const store = await this.getStore(id);
    if (!store) return undefined;
    
    const updatedStore = { ...store, ...storeData };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }
  
  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const createdAt = new Date();
    const newCategory: Category = { ...category, id, createdAt };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Products
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByStore(storeId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.storeId === storeId,
    );
  }
  
  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.featured,
    );
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const createdAt = new Date();
    const newProduct: Product = { ...product, id, createdAt };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, productData: Partial<Product>): Promise<Product | undefined> {
    const product = await this.getProduct(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  // Orders
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }
  
  async getOrdersByUser(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    );
  }
  
  async getOrdersByStore(storeId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.storeId === storeId,
    );
  }
  
  async getOrdersByDeliveryPerson(deliveryPersonId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.deliveryPersonId === deliveryPersonId,
    );
  }
  
  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderCurrentId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newOrder: Order = { ...order, id, createdAt, updatedAt };
    this.orders.set(id, newOrder);
    return newOrder;
  }
  
  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status, 
      updatedAt: new Date() 
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  
  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }
  
  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemCurrentId++;
    const createdAt = new Date();
    const newOrderItem: OrderItem = { ...orderItem, id, createdAt };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }
  
  // Order Status History
  async getOrderStatusHistory(orderId: number): Promise<OrderStatusHistory[]> {
    return Array.from(this.orderStatusHistory.values())
      .filter((history) => history.orderId === orderId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createOrderStatusHistory(statusHistory: InsertOrderStatusHistory): Promise<OrderStatusHistory> {
    const id = this.orderStatusHistoryCurrentId++;
    const newStatusHistory: OrderStatusHistory = { ...statusHistory, id };
    this.orderStatusHistory.set(id, newStatusHistory);
    return newStatusHistory;
  }
  
  // Cart
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId,
    );
  }
  
  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists for this user and product
    const existingItems = await this.getCartItems(cartItem.userId);
    const existingItem = existingItems.find(item => item.productId === cartItem.productId);
    
    if (existingItem) {
      // Update quantity instead of adding new item
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.cartItemCurrentId++;
    const createdAt = new Date();
    const newCartItem: CartItem = { ...cartItem, id, createdAt };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }
  
  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return { ...cartItem, quantity: 0 };
    }
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }
  
  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = Array.from(this.cartItems.values())
      .filter(item => item.userId === userId);
      
    userCartItems.forEach(item => {
      this.cartItems.delete(item.id);
    });
    
    return true;
  }
}

export const storage = new MemStorage();
