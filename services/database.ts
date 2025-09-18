import { openDatabaseSync } from 'expo-sqlite';

// Initialize and export a synchronous database connection for 'hisab.db'
export const db = openDatabaseSync('hisab.db');

// Create and export an async function named initializeDatabase
export async function initializeDatabase() {
  try {
    // Create products table with timestamps
    db.execSync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        salePrice REAL NOT NULL,
        quantity INTEGER NOT NULL,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Create customers table with timestamps
    db.execSync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phoneNumber TEXT,
        outstandingBalance REAL DEFAULT 0,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Create transactions table with timestamps
    db.execSync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        isCreditSale INTEGER NOT NULL,
        customerId INTEGER,
        createdAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
        updatedAt INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Add createdAt and updatedAt columns to existing tables if they don't exist
    try {
      db.execSync(`ALTER TABLE products ADD COLUMN createdAt INTEGER DEFAULT (strftime('%s', 'now'))`);
      db.execSync(`ALTER TABLE products ADD COLUMN updatedAt INTEGER DEFAULT (strftime('%s', 'now'))`);
    } catch {
      // Columns already exist, ignore error
    }

    try {
      db.execSync(`ALTER TABLE customers ADD COLUMN createdAt INTEGER DEFAULT (strftime('%s', 'now'))`);
      db.execSync(`ALTER TABLE customers ADD COLUMN updatedAt INTEGER DEFAULT (strftime('%s', 'now'))`);
    } catch {
      // Columns already exist, ignore error
    }

    try {
      db.execSync(`ALTER TABLE transactions ADD COLUMN createdAt INTEGER DEFAULT (strftime('%s', 'now'))`);
      db.execSync(`ALTER TABLE transactions ADD COLUMN updatedAt INTEGER DEFAULT (strftime('%s', 'now'))`);
    } catch {
      // Columns already exist, ignore error
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw new Error('Failed to initialize database');
  }
}

// Test database connection
export function testDatabase(): boolean {
  try {
    // Simple test query
    const result = db.getAllSync('SELECT name FROM sqlite_master WHERE type="table"');
    console.log('Database tables:', result);
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
}

// Product interface
export interface Product {
  id: number;
  name: string;
  salePrice: number;
  quantity: number;
  createdAt: number;
  updatedAt: number;
}

// Product filter options
export interface ProductFilters {
  searchText?: string;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

// Enhanced getProducts function with filtering and sorting
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  try {
    const {
      searchText,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filters;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params: any[] = [];

    // Search by name
    if (searchText) {
      query += ' AND name LIKE ?';
      params.push(`%${searchText}%`);
    }

    // Price range filters
    if (minPrice !== undefined) {
      query += ' AND salePrice >= ?';
      params.push(minPrice);
    }
    if (maxPrice !== undefined) {
      query += ' AND salePrice <= ?';
      params.push(maxPrice);
    }

    // Stock range filters
    if (minStock !== undefined) {
      query += ' AND quantity >= ?';
      params.push(minStock);
    }
    if (maxStock !== undefined) {
      query += ' AND quantity <= ?';
      params.push(maxStock);
    }

    // Add sorting
    query += ` ORDER BY ${sortBy} ${sortOrder}`;

    console.log('Executing query:', query, 'with params:', params);
    
    // Use prepared statements for better performance and safety
    if (params.length > 0) {
      const statement = db.prepareSync(query);
      const products = statement.executeSync(params).getAllSync() as Product[];
      statement.finalizeSync();
      return products;
    } else {
      const products = db.getAllSync(query) as Product[];
      return products;
    }
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw new Error('Failed to fetch products from database');
  }
}

// Add a new product
export async function addProduct(name: string, salePrice: number, quantity: number): Promise<number> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const statement = db.prepareSync(
      'INSERT INTO products (name, salePrice, quantity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
    );
    const result = statement.executeSync([name, salePrice, quantity, now, now]);
    statement.finalizeSync();
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Error adding product:', error);
    throw new Error('Failed to add product to database');
  }
}

// Update an existing product
export async function updateProduct(id: number, name: string, salePrice: number, quantity: number): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const statement = db.prepareSync(
      'UPDATE products SET name = ?, salePrice = ?, quantity = ?, updatedAt = ? WHERE id = ?'
    );
    statement.executeSync([name, salePrice, quantity, now, id]);
    statement.finalizeSync();
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product in database');
  }
}

// Delete a product
export async function deleteProduct(id: number): Promise<void> {
  try {
    const statement = db.prepareSync('DELETE FROM products WHERE id = ?');
    statement.executeSync([id]);
    statement.finalizeSync();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product from database');
  }
}

// Get a single product by ID
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const statement = db.prepareSync('SELECT * FROM products WHERE id = ?');
    const result = statement.executeSync([id]);
    const product = result.getFirstSync() as Product | null;
    statement.finalizeSync();
    return product;
  } catch (error) {
    console.error('Error getting product by ID:', error);
    throw new Error('Failed to get product from database');
  }
}