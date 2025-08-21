const fs = require('fs');
const path = require('path');

class SimpleFileDatabase {
    constructor() {
        // Create data directory if it doesn't exist
        this.dataDir = path.join(__dirname, 'data');
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir);
        }
        
        // Define file paths
        this.files = {
            clients: path.join(this.dataDir, 'clients.json'),
            products: path.join(this.dataDir, 'products.json'),
            quotations: path.join(this.dataDir, 'quotations.json'),
            settings: path.join(this.dataDir, 'settings.json'),
            templates: path.join(this.dataDir, 'templates.json')
        };
        
        // Initialize files if they don't exist
        this.initializeFiles();
        console.log('Simple file database initialized successfully');
    }

    initializeFiles() {
        Object.keys(this.files).forEach(key => {
            if (!fs.existsSync(this.files[key])) {
                let initialData = [];
                if (key === 'settings') {
                    initialData = {
                        companyDetails: {
                            name: 'AL MADAEN CURTAINS',
                            address: 'P.O.Box:396 Manama, Bahrain',
                            phone: 'Tel:00973 17552522, WhatsApp:00973-66358595',
                            contactPerson: 'VIMAL'
                        },
                        defaultDiscountPercent: 0,
                        defaultTaxPercent: 10,
                        termsAndConditions: '1) Delivery within {delivery_estimate} from the date of advance.\n2) The quote is valid for 10 days from the quotation date.',
                        paymentTerms: '50% advance, 50% before delivery',
                        scopeOfWork: 'WAVE CURTAIN with Wave rail and CHIFFON with Easy Movable Track with quality fabric. All window stitching and installation.'
                    };
                }
                this.writeFile(this.files[key], initialData);
            }
        });
    }

    readFile(filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error reading file ${filePath}:`, error);
            return Array.isArray(this.getDefaultData(filePath)) ? [] : {};
        }
    }

    writeFile(filePath, data) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            return true;
        } catch (error) {
            console.error(`Error writing file ${filePath}:`, error);
            return false;
        }
    }

    getDefaultData(filePath) {
        if (filePath.includes('settings.json')) {
            return {};
        }
        return [];
    }

    // Client operations
    getAllClients() {
        return this.readFile(this.files.clients);
    }

    getClientById(id) {
        const clients = this.getAllClients();
        return clients.find(client => client.id === id);
    }

    insertClient(client) {
        const clients = this.getAllClients();
        clients.push({
            ...client,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        return this.writeFile(this.files.clients, clients);
    }

    updateClient(client) {
        const clients = this.getAllClients();
        const index = clients.findIndex(c => c.id === client.id);
        if (index !== -1) {
            clients[index] = {
                ...client,
                updated_at: new Date().toISOString()
            };
            return this.writeFile(this.files.clients, clients);
        }
        return false;
    }

    deleteClient(id) {
        const clients = this.getAllClients();
        const filtered = clients.filter(client => client.id !== id);
        return this.writeFile(this.files.clients, filtered);
    }

    // Product operations
    getAllProducts() {
        return this.readFile(this.files.products);
    }

    insertProduct(product) {
        const products = this.getAllProducts();
        products.push({
            ...product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        return this.writeFile(this.files.products, products);
    }

    updateProduct(product) {
        const products = this.getAllProducts();
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = {
                ...product,
                updated_at: new Date().toISOString()
            };
            return this.writeFile(this.files.products, products);
        }
        return false;
    }

    deleteProduct(id) {
        const products = this.getAllProducts();
        const filtered = products.filter(product => product.id !== id);
        return this.writeFile(this.files.products, filtered);
    }

    // Quotation operations
    getAllQuotations() {
        return this.readFile(this.files.quotations);
    }

    getQuotationById(id) {
        const quotations = this.getAllQuotations();
        return quotations.find(quotation => quotation.id === id);
    }

    insertQuotation(quotation) {
        const quotations = this.getAllQuotations();
        quotations.push({
            ...quotation,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        return this.writeFile(this.files.quotations, quotations);
    }

    updateQuotation(quotation) {
        const quotations = this.getAllQuotations();
        const index = quotations.findIndex(q => q.id === quotation.id);
        if (index !== -1) {
            quotations[index] = {
                ...quotation,
                updated_at: new Date().toISOString()
            };
            return this.writeFile(this.files.quotations, quotations);
        }
        return false;
    }

    deleteQuotation(id) {
        const quotations = this.getAllQuotations();
        const filtered = quotations.filter(quotation => quotation.id !== id);
        return this.writeFile(this.files.quotations, filtered);
    }

    // Settings operations
    getSettings() {
        return this.readFile(this.files.settings);
    }

    updateSettings(settings) {
        return this.writeFile(this.files.settings, {
            ...settings,
            updated_at: new Date().toISOString()
        });
    }

    // Templates operations
    getAllTemplates() {
        return this.readFile(this.files.templates);
    }

    insertTemplate(template) {
        const templates = this.getAllTemplates();
        templates.push({
            ...template,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
        return this.writeFile(this.files.templates, templates);
    }

    updateTemplate(template) {
        const templates = this.getAllTemplates();
        const index = templates.findIndex(t => t.id === template.id);
        if (index !== -1) {
            templates[index] = {
                ...template,
                updated_at: new Date().toISOString()
            };
            return this.writeFile(this.files.templates, templates);
        }
        return false;
    }

    deleteTemplate(id) {
        const templates = this.getAllTemplates();
        const filtered = templates.filter(template => template.id !== id);
        return this.writeFile(this.files.templates, filtered);
    }

    // Backup and restore
    exportData() {
        return {
            clients: this.getAllClients(),
            products: this.getAllProducts(),
            quotations: this.getAllQuotations(),
            templates: this.getAllTemplates(),
            settings: this.getSettings(),
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        try {
            if (data.clients) this.writeFile(this.files.clients, data.clients);
            if (data.products) this.writeFile(this.files.products, data.products);
            if (data.quotations) this.writeFile(this.files.quotations, data.quotations);
            if (data.templates) this.writeFile(this.files.templates, data.templates);
            if (data.settings) this.writeFile(this.files.settings, data.settings);
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Clean up method (for consistency)
    close() {
        console.log('Simple file database closed');
    }
}

module.exports = SimpleFileDatabase;
