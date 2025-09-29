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

    // Create transaction_items table for detailed transaction records
    db.execSync(`
      CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        productName TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        FOREIGN KEY (transactionId) REFERENCES transactions (id),
        FOREIGN KEY (productId) REFERENCES products (id)
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
      sortBy = 'updatedAt',
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

// Customer interface
export interface Customer {
  id: number;
  name: string;
  phoneNumber?: string;
  outstandingBalance: number;
  createdAt: number;
  updatedAt: number;
}

// Transaction interface
export interface Transaction {
  id: number;
  timestamp: number;
  totalAmount: number;
  isCreditSale: number; // 0 for cash, 1 for credit
  customerId?: number;
  createdAt: number;
  updatedAt: number;
}

// TransactionItem interface for transaction details
export interface TransactionItem {
  id: number;
  transactionId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
}

// Get all customers with outstanding balances
export async function getCustomersWithBalance(): Promise<Customer[]> {
  try {
    const customers = db.getAllSync(
      'SELECT * FROM customers WHERE outstandingBalance > 0 ORDER BY updatedAt DESC'
    ) as Customer[];
    return customers;
  } catch (error) {
    console.error('Error getting customers with balance:', error);
    throw new Error('Failed to fetch customers from database');
  }
}

// Get all customers
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const customers = db.getAllSync(
      'SELECT * FROM customers ORDER BY name ASC'
    ) as Customer[];
    return customers;
  } catch (error) {
    console.error('Error getting all customers:', error);
    throw new Error('Failed to fetch customers from database');
  }
}

// Add or update customer
export async function upsertCustomer(name: string, phoneNumber?: string): Promise<number> {
  try {
    const now = Math.floor(Date.now() / 1000);
    
    // Check if customer already exists
    const existingCustomer = db.getFirstSync(
      'SELECT * FROM customers WHERE name = ?',
      [name]
    ) as Customer | null;

    if (existingCustomer) {
      // Update existing customer
      const statement = db.prepareSync(
        'UPDATE customers SET phoneNumber = ?, updatedAt = ? WHERE id = ?'
      );
      statement.executeSync([phoneNumber || existingCustomer.phoneNumber || null, now, existingCustomer.id]);
      statement.finalizeSync();
      return existingCustomer.id;
    } else {
      // Create new customer
      const statement = db.prepareSync(
        'INSERT INTO customers (name, phoneNumber, outstandingBalance, createdAt, updatedAt) VALUES (?, ?, 0, ?, ?)'
      );
      const result = statement.executeSync([name, phoneNumber || null, now, now]);
      statement.finalizeSync();
      return result.lastInsertRowId as number;
    }
  } catch (error) {
    console.error('Error upserting customer:', error);
    throw new Error('Failed to save customer to database');
  }
}

// Update customer balance
export async function updateCustomerBalance(customerId: number, amount: number): Promise<void> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const statement = db.prepareSync(
      'UPDATE customers SET outstandingBalance = outstandingBalance + ?, updatedAt = ? WHERE id = ?'
    );
    statement.executeSync([amount, now, customerId]);
    statement.finalizeSync();
  } catch (error) {
    console.error('Error updating customer balance:', error);
    throw new Error('Failed to update customer balance');
  }
}

// Create transaction
export async function createTransaction(
  totalAmount: number,
  isCreditSale: boolean,
  customerId?: number
): Promise<number> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const timestamp = now;
    const creditFlag = isCreditSale ? 1 : 0;
    
    const statement = db.prepareSync(
      'INSERT INTO transactions (timestamp, totalAmount, isCreditSale, customerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = statement.executeSync([timestamp, totalAmount, creditFlag, customerId || null, now, now]);
    statement.finalizeSync();
    
    // If it's a credit sale, update customer balance
    if (isCreditSale && customerId) {
      await updateCustomerBalance(customerId, totalAmount);
    }
    
    return result.lastInsertRowId as number;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
}

// Get transactions
export async function getTransactions(limit = 50): Promise<Transaction[]> {
  try {
    const transactions = db.getAllSync(
      'SELECT * FROM transactions ORDER BY timestamp DESC LIMIT ?',
      [limit]
    ) as Transaction[];
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw new Error('Failed to fetch transactions from database');
  }
}

// Get transaction by ID
export async function getTransactionById(id: number): Promise<Transaction | null> {
  try {
    const statement = db.prepareSync('SELECT * FROM transactions WHERE id = ?');
    const result = statement.executeSync([id]);
    const transaction = result.getFirstSync() as Transaction | null;
    statement.finalizeSync();
    return transaction;
  } catch (error) {
    console.error('Error getting transaction by ID:', error);
    throw new Error('Failed to get transaction from database');
  }
}

// Delete transaction
export async function deleteTransaction(id: number): Promise<void> {
  try {
    // Get the transaction to check if we need to update customer balance
    const transaction = await getTransactionById(id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If it was a credit sale, subtract the amount from customer balance
    if (transaction.isCreditSale && transaction.customerId) {
      await updateCustomerBalance(transaction.customerId, -transaction.totalAmount);
    }

    const statement = db.prepareSync('DELETE FROM transactions WHERE id = ?');
    statement.executeSync([id]);
    statement.finalizeSync();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction from database');
  }
}

// Data backup function - export all data as JSON
export async function exportDataToJSON(): Promise<string> {
  try {
    const products = await getProducts();
    const customers = await getAllCustomers();
    const transactions = await getTransactions(1000); // Get more transactions for backup

    const data = {
      products,
      customers,
      transactions,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}

// Data import function - import from JSON
export async function importDataFromJSON(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData);
    
    if (!data.products || !data.customers || !data.transactions) {
      throw new Error('Invalid data format');
    }

    // Clear existing data (optional - could be made configurable)
    db.execSync('DELETE FROM transactions');
    db.execSync('DELETE FROM customers');  
    db.execSync('DELETE FROM products');

    // Reset auto-increment counters
    db.execSync('DELETE FROM sqlite_sequence WHERE name IN ("products", "customers", "transactions")');

    // Import products
    for (const product of data.products) {
      const statement = db.prepareSync(
        'INSERT INTO products (name, salePrice, quantity, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
      );
      statement.executeSync([
        product.name,
        product.salePrice,
        product.quantity,
        product.createdAt || Math.floor(Date.now() / 1000),
        product.updatedAt || Math.floor(Date.now() / 1000)
      ]);
      statement.finalizeSync();
    }

    // Import customers
    for (const customer of data.customers) {
      const statement = db.prepareSync(
        'INSERT INTO customers (name, phoneNumber, outstandingBalance, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)'
      );
      statement.executeSync([
        customer.name,
        customer.phoneNumber,
        customer.outstandingBalance || 0,
        customer.createdAt || Math.floor(Date.now() / 1000),
        customer.updatedAt || Math.floor(Date.now() / 1000)
      ]);
      statement.finalizeSync();
    }

    // Import transactions
    for (const transaction of data.transactions) {
      const statement = db.prepareSync(
        'INSERT INTO transactions (timestamp, totalAmount, isCreditSale, customerId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)'
      );
      statement.executeSync([
        transaction.timestamp,
        transaction.totalAmount,
        transaction.isCreditSale,
        transaction.customerId,
        transaction.createdAt || Math.floor(Date.now() / 1000),
        transaction.updatedAt || Math.floor(Date.now() / 1000)
      ]);
      statement.finalizeSync();
    }

    console.log('Data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    throw new Error('Failed to import data');
  }
}

// Danger operation: clear all application data (products, customers, transactions)
// NOTE: This intentionally preserves schema and autoincrement resets.
export async function clearAllData(): Promise<void> {
  try {
    db.execSync('DELETE FROM transactions');
    db.execSync('DELETE FROM customers');
    db.execSync('DELETE FROM products');
    db.execSync('DELETE FROM sqlite_sequence WHERE name IN ("products","customers","transactions")');
    console.log('All data cleared successfully');
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw new Error('Failed to clear all data');
  }
}