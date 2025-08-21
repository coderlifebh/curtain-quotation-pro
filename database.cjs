const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class DatabaseService {
    constructor() {
        // Create data directory if it doesn't exist
        const dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
        
        // Initialize database
        const dbPath = path.join(dataDir, 'curtain_quotation.db');
        this.db = new Database(dbPath);
        this.initializeTables();
    }

    initializeTables() {
        // Create tables if they don't exist
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS clients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                phone TEXT UNIQUE NOT NULL,
                address TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                unit TEXT NOT NULL,
                price REAL NOT NULL,
                discount_price REAL,
                fabric_width REAL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS templates (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                fullness_front REAL NOT NULL,
                fullness_back REAL NOT NULL,
                default_fabric_id TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS quotations (
                id TEXT PRIMARY KEY,
                name TEXT,
                quotation_number TEXT NOT NULL,
                quotation_date TEXT NOT NULL,
                client_name TEXT NOT NULL,
                client_phone TEXT NOT NULL,
                client_address TEXT,
                discount_percent REAL DEFAULT 0,
                tax_percent REAL DEFAULT 0,
                grand_total REAL NOT NULL,
                status TEXT DEFAULT 'Draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS quotation_items (
                id TEXT PRIMARY KEY,
                quotation_id TEXT NOT NULL,
                room TEXT,
                template_id TEXT,
                width REAL NOT NULL,
                height REAL NOT NULL,
                fullness_front REAL NOT NULL,
                fullness_back REAL NOT NULL,
                fabric_id TEXT,
                sheer_id TEXT,
                lining_id TEXT,
                front_motor_id TEXT,
                back_motor_id TEXT,
                quantity INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (quotation_id) REFERENCES quotations (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS app_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                company_name TEXT,
                company_address TEXT,
                company_phone TEXT,
                contact_person TEXT,
                default_discount_percent REAL DEFAULT 0,
                default_tax_percent REAL DEFAULT 10,
                terms_and_conditions TEXT,
                payment_terms TEXT,
                scope_of_work TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
            CREATE INDEX IF NOT EXISTS idx_quotations_client_phone ON quotations(client_phone);
            CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date);
            CREATE INDEX IF NOT EXISTS idx_quotation_items_quotation_id ON quotation_items(quotation_id);
        `);

        console.log('Database tables initialized successfully');
    }

    // Client operations
    getAllClients() {
        return this.db.prepare('SELECT * FROM clients ORDER BY name').all();
    }

    getClientById(id) {
        return this.db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
    }

    insertClient(client) {
        const stmt = this.db.prepare(`
            INSERT INTO clients (id, name, phone, address)
            VALUES (?, ?, ?, ?)
        `);
        return stmt.run(client.id, client.name, client.phone, client.address);
    }

    updateClient(client) {
        const stmt = this.db.prepare(`
            UPDATE clients 
            SET name = ?, phone = ?, address = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(client.name, client.phone, client.address, client.id);
    }

    deleteClient(id) {
        return this.db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    }

    // Product operations
    getAllProducts() {
        return this.db.prepare('SELECT * FROM products ORDER BY category, name').all();
    }

    insertProduct(product) {
        const stmt = this.db.prepare(`
            INSERT INTO products (id, name, category, unit, price, discount_price, fabric_width)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        return stmt.run(
            product.id, product.name, product.category, product.unit,
            product.price, product.discountPrice, product.fabricWidth
        );
    }

    updateProduct(product) {
        const stmt = this.db.prepare(`
            UPDATE products 
            SET name = ?, category = ?, unit = ?, price = ?, discount_price = ?, fabric_width = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        return stmt.run(
            product.name, product.category, product.unit, product.price,
            product.discountPrice, product.fabricWidth, product.id
        );
    }

    deleteProduct(id) {
        return this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
    }

    // Quotation operations
    getAllQuotations() {
        return this.db.prepare('SELECT * FROM quotations ORDER BY created_at DESC').all();
    }

    getQuotationById(id) {
        const quotation = this.db.prepare('SELECT * FROM quotations WHERE id = ?').get(id);
        if (quotation) {
            const items = this.db.prepare('SELECT * FROM quotation_items WHERE quotation_id = ?').all(id);
            quotation.items = items;
        }
        return quotation;
    }

    insertQuotation(quotation) {
        const transaction = this.db.transaction(() => {
            // Insert quotation
            const quotationStmt = this.db.prepare(`
                INSERT INTO quotations (
                    id, name, quotation_number, quotation_date, client_name, client_phone, client_address,
                    discount_percent, tax_percent, grand_total, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            
            quotationStmt.run(
                quotation.id, quotation.name, quotation.quotationNumber, quotation.quotationDate,
                quotation.clientDetails.name, quotation.clientDetails.phone, quotation.clientDetails.address,
                quotation.discountPercent, quotation.taxPercent, quotation.grandTotal, quotation.status
            );

            // Insert quotation items
            const itemStmt = this.db.prepare(`
                INSERT INTO quotation_items (
                    id, quotation_id, room, template_id, width, height, fullness_front, fullness_back,
                    fabric_id, sheer_id, lining_id, front_motor_id, back_motor_id, quantity
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            quotation.items.forEach(item => {
                itemStmt.run(
                    item.id, quotation.id, item.room, item.templateId, item.width, item.height,
                    item.fullnessFront, item.fullnessBack, item.fabricId, item.sheerId, item.liningId,
                    item.frontMotorId, item.backMotorId, item.quantity
                );
            });
        });

        return transaction();
    }

    updateQuotation(quotation) {
        const transaction = this.db.transaction(() => {
            // Update quotation
            const quotationStmt = this.db.prepare(`
                UPDATE quotations 
                SET name = ?, quotation_date = ?, client_name = ?, client_phone = ?, client_address = ?,
                    discount_percent = ?, tax_percent = ?, grand_total = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `);
            
            quotationStmt.run(
                quotation.name, quotation.quotationDate, quotation.clientDetails.name,
                quotation.clientDetails.phone, quotation.clientDetails.address, quotation.discountPercent,
                quotation.taxPercent, quotation.grandTotal, quotation.status, quotation.id
            );

            // Delete existing items and insert new ones
            this.db.prepare('DELETE FROM quotation_items WHERE quotation_id = ?').run(quotation.id);

            const itemStmt = this.db.prepare(`
                INSERT INTO quotation_items (
                    id, quotation_id, room, template_id, width, height, fullness_front, fullness_back,
                    fabric_id, sheer_id, lining_id, front_motor_id, back_motor_id, quantity
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);

            quotation.items.forEach(item => {
                itemStmt.run(
                    item.id, quotation.id, item.room, item.templateId, item.width, item.height,
                    item.fullnessFront, item.fullnessBack, item.fabricId, item.sheerId, item.liningId,
                    item.frontMotorId, item.backMotorId, item.quantity
                );
            });
        });

        return transaction();
    }

    deleteQuotation(id) {
        // Items will be deleted automatically due to CASCADE
        return this.db.prepare('DELETE FROM quotations WHERE id = ?').run(id);
    }

    // Settings operations
    getSettings() {
        return this.db.prepare('SELECT * FROM app_settings WHERE id = 1').get();
    }

    updateSettings(settings) {
        const stmt = this.db.prepare(`
            INSERT OR REPLACE INTO app_settings (
                id, company_name, company_address, company_phone, contact_person,
                default_discount_percent, default_tax_percent, terms_and_conditions,
                payment_terms, scope_of_work, updated_at
            ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `);
        
        return stmt.run(
            settings.companyDetails.name, settings.companyDetails.address,
            settings.companyDetails.phone, settings.companyDetails.contactPerson,
            settings.defaultDiscountPercent, settings.defaultTaxPercent,
            settings.termsAndConditions, settings.paymentTerms, settings.scopeOfWork
        );
    }

    // Backup and restore
    exportData() {
        return {
            clients: this.getAllClients(),
            products: this.getAllProducts(),
            quotations: this.getAllQuotations().map(q => this.getQuotationById(q.id)),
            settings: this.getSettings()
        };
    }

    importData(data) {
        const transaction = this.db.transaction(() => {
            // Clear existing data
            this.db.exec(`
                DELETE FROM quotation_items;
                DELETE FROM quotations;
                DELETE FROM clients;
                DELETE FROM products;
                DELETE FROM app_settings;
            `);

            // Import clients
            if (data.clients) {
                data.clients.forEach(client => this.insertClient(client));
            }

            // Import products
            if (data.products) {
                data.products.forEach(product => this.insertProduct(product));
            }

            // Import quotations
            if (data.quotations) {
                data.quotations.forEach(quotation => this.insertQuotation(quotation));
            }

            // Import settings
            if (data.settings) {
                this.updateSettings(data.settings);
            }
        });

        return transaction();
    }

    close() {
        this.db.close();
    }
}

module.exports = DatabaseService;
