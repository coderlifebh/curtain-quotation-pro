






import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { QuotationItem, TemplateOption, ProductOption, SavedQuotation, ClientDetails, CompanyDetails, AppSettings, AppDataBackup, SelectOption, DetailedCosts, Client, QuotationVersion, DeliveryEstimateTier, QuotationStatus, StatusHistoryEntry } from './types';
import { QuotationTable } from './components/QuotationTable';
import { Sidebar } from './components/Sidebar';
import { ProductsPage } from './components/ProductsPage';
import { TemplatesPage } from './components/TemplatesPage';
import { DashboardPage } from './components/DashboardPage';
import { SavedQuotationsPage } from './components/SavedQuotationsPage';
import { SettingsPage } from './components/SettingsPage';
import { ReportsPage } from './components/ReportsPage';
import { QuotationPreview } from './components/QuotationPreview';
import { ClientsPage } from './components/ClientsPage';
import { INITIAL_ROOM_OPTIONS, INITIAL_TEMPLATE_OPTIONS, INITIAL_PRODUCT_OPTIONS, INITIAL_COLUMN_WIDTHS } from './constants';

// Text casing utility functions
const toTitleCase = (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const toProperCase = (str: string): string => {
    // Handle names, addresses, and general text
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters except + at the start
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned;
};

const CurtainIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v16h2V4h16v16h2V4c0-1.1-.9-2-2-2zM4 6v14h4V6H4zm6 0v14h4V6h-4zm6 0v14h4V6h-4z"/>
    </svg>
);

const MenuIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

// A custom hook for managing state with localStorage persistence.
const usePersistentState = <T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedValue = window.localStorage.getItem(key);
            return storedValue ? JSON.parse(storedValue) : initialState;
        } catch (error) {
            console.error(`Error reading localStorage key “${key}”:`, error);
            return initialState;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};

interface QuotationControlsProps {
    quotationName: string;
    setQuotationName: (name: string) => void;
    quotationNumber: string;
    handleNewQuotation: () => void;
    handlePreview: () => void;
    handleSaveQuotation: () => void;
    currentQuotationId: string | null;
    clientDetails: ClientDetails;
    handleClientDetailsChange: (field: keyof ClientDetails, value: string) => void;
    clients: Client[];
    savedQuotations: SavedQuotation[];
    quotationDate: string;
    setQuotationDate: (date: string) => void;
}

const QuotationControls: React.FC<QuotationControlsProps> = ({
    quotationName, setQuotationName, quotationNumber, handleNewQuotation,
    handlePreview, handleSaveQuotation, currentQuotationId, clientDetails,
    handleClientDetailsChange, clients, savedQuotations, quotationDate, setQuotationDate
}) => (
    <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div className='flex-grow'>
                <label htmlFor="quotationName" className="block text-sm font-medium text-slate-300 mb-1">Quotation Name (Optional)</label>
                <input 
                    id="quotationName" 
                    type="text" 
                    value={quotationName} 
                    onChange={e => setQuotationName(toTitleCase(e.target.value))} 
                    onBlur={e => setQuotationName(toTitleCase(e.target.value))}
                    placeholder={`e.g., Quotation ${quotationNumber}`} 
                    className="w-full max-w-md bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex flex-wrap gap-2">
                <button onClick={handleNewQuotation} className="px-4 py-2 text-sm bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700">New Quotation</button>
                <button onClick={handlePreview} className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700">Preview</button>
                <button onClick={handleSaveQuotation} className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">{currentQuotationId ? 'Update Quotation' : 'Save Quotation'}</button>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700 pt-6">
            <div>
                 <label htmlFor="clientName" className="block text-sm font-medium text-slate-300 mb-1">Client Name</label>
                 <input 
                    id="clientName" 
                    list="client-names" 
                    type="text" 
                    value={clientDetails.name} 
                    onChange={e => handleClientDetailsChange('name', e.target.value)}
                    onPaste={e => {
                        setTimeout(() => {
                            const pastedValue = e.currentTarget.value;
                            handleClientDetailsChange('name', pastedValue);
                        }, 0);
                    }}
                    onFocus={e => e.target.select()}
                    autoComplete="name"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter client name" />
                 <datalist id="client-names">
                    {clients.map(c => <option key={c.id} value={c.name} />)}
                 </datalist>
            </div>
            <div>
                <label htmlFor="clientPhone" className="block text-sm font-medium text-slate-300 mb-1">Phone</label>
                <input 
                    id="clientPhone" 
                    type="tel" 
                    value={clientDetails.phone} 
                    onChange={e => handleClientDetailsChange('phone', e.target.value)}
                    onPaste={e => {
                        setTimeout(() => {
                            const pastedValue = e.currentTarget.value;
                            handleClientDetailsChange('phone', pastedValue);
                        }, 0);
                    }}
                    onFocus={e => e.target.select()}
                    autoComplete="tel"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter phone number" />
            </div>
            <div>
                <label htmlFor="quotationNumberDisplay" className="block text-sm font-medium text-slate-300 mb-1">Quotation #</label>
                <input id="quotationNumberDisplay" type="text" value={currentQuotationId ? savedQuotations.find(q=>q.id===currentQuotationId)?.quotationNumber : quotationNumber} readOnly className="w-full bg-slate-700/80 border border-slate-600 rounded-md px-3 py-2 text-slate-300 cursor-not-allowed" />
            </div>
             <div>
                <label htmlFor="quotationDate" className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                <input id="quotationDate" type="date" value={quotationDate} onChange={e => setQuotationDate(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white" />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="clientAddress" className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                <input 
                    id="clientAddress" 
                    type="text" 
                    value={clientDetails.address} 
                    onChange={e => handleClientDetailsChange('address', e.target.value)}
                    onPaste={e => {
                        setTimeout(() => {
                            const pastedValue = e.currentTarget.value;
                            handleClientDetailsChange('address', pastedValue);
                        }, 0);
                    }}
                    onFocus={e => e.target.select()}
                    autoComplete="address-line1"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Enter address" />
            </div>
        </div>
    </div>
);

interface QuotationTotalsProps {
    handleAddNewItem: () => void;
    subtotal: number;
    discountPercent: number;
    setDiscountPercent: (value: number) => void;
    discountAmount: number;
    taxPercent: number;
    setTaxPercent: (value: number) => void;
    grandTotal: number;
}
    
const QuotationTotals: React.FC<QuotationTotalsProps> = ({
    handleAddNewItem, subtotal, discountPercent, setDiscountPercent,
    discountAmount, taxPercent, setTaxPercent, grandTotal
}) => (
     <div className="flex justify-between items-start gap-4">
        <button onClick={handleAddNewItem} className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Add Item
        </button>
        <div className="w-full max-w-sm bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
                <span className="text-slate-400">Subtotal:</span>
                <span className="font-medium text-white">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</span>
            </div>
            <div className="flex justify-between items-center">
                 <label htmlFor="discountPercent" className="text-slate-400">Discount (%):</label>
                 <input id="discountPercent" type="number" value={discountPercent} onChange={e => setDiscountPercent(Number(e.target.value) || 0)} className="w-20 bg-slate-700/50 border border-slate-600 rounded-md px-2 py-1 text-white text-right" />
            </div>
             <div className="flex justify-between">
                <span className="text-slate-400">Taxable Amount:</span>
                <span className="font-medium text-white">{(subtotal - discountAmount).toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</span>
            </div>
            <div className="flex justify-between items-center">
                 <label htmlFor="taxPercent" className="text-slate-400">Tax (%):</label>
                 <input id="taxPercent" type="number" value={taxPercent} onChange={e => setTaxPercent(Number(e.target.value) || 0)} className="w-20 bg-slate-700/50 border border-slate-600 rounded-md px-2 py-1 text-white text-right" />
            </div>
            <div className="!mt-4 pt-2 border-t border-slate-700 flex justify-between font-bold text-lg text-blue-400">
                <span>Grand Total:</span>
                <span>{grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</span>
            </div>
        </div>
    </div>
 );

export const App: React.FC = () => {
    // --- STATE MANAGEMENT --- //
    const [activePage, setActivePage] = useState('dashboard');
    const [isSidebarMobileOpen, setSidebarMobileOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = usePersistentState('sidebarCollapsed', false);
    const [isPreviewing, setPreviewing] = useState(false);
    const [previewData, setPreviewData] = useState<SavedQuotation | null>(null);
    const [clientFilter, setClientFilter] = useState<string | null>(null);

    // Data states
    const [settings, setSettings] = usePersistentState<AppSettings>('appSettings', {
        companyDetails: { 
            name: 'AL MADAEN CURTAINS', 
            address: 'P.O.Box:396 Manama, Bahrain', 
            phone: 'Tel:00973 17552522, WhatsApp:00973-66358595',
            contactPerson: 'VIMAL',
        },
        defaultDiscountPercent: 0,
        defaultTaxPercent: 10,
        termsAndConditions: '1) Delivery within {delivery_estimate} from the date of advance.\n2) The quote is valid for 10 days from the quotation date.',
        paymentTerms: '50% advance, 50% before delivery',
        scopeOfWork: 'WAVE CURTAIN with Wave rail and CHIFFON with Easy Movable Track with quality fabric. All window stitching and installation.',
        lastQuotationNumber: 0,
        quotationYear: new Date().getFullYear(),
        autoSaveColumnWidths: true,
        quotationTableColumnWidths: INITIAL_COLUMN_WIDTHS,
        deliveryEstimateTiers: [
            { id: 'tier-1', minWindows: 1, maxWindows: 2, timeframe: '3 - 4 weeks' },
            { id: 'tier-2', minWindows: 3, maxWindows: 5, timeframe: '4 - 5 weeks' },
            { id: 'tier-3', minWindows: 6, maxWindows: 10, timeframe: '5 - 6 weeks' },
            { id: 'tier-4', minWindows: 11, maxWindows: 999, timeframe: '6 - 7 weeks' },
        ],
        defaultItemWidth: 150,
        defaultItemHeight: 220,
        defaultItemQuantity: 1,
        defaultTemplateFullnessFront: 2.5,
        defaultTemplateFullnessBack: 2.5,
        roomOptions: INITIAL_ROOM_OPTIONS,
    });
    const [productOptions, setProductOptions] = usePersistentState<ProductOption[]>('productOptions', INITIAL_PRODUCT_OPTIONS);
    const [templateOptions, setTemplateOptions] = usePersistentState<TemplateOption[]>('templateOptions', INITIAL_TEMPLATE_OPTIONS);
    const [clients, setClients] = usePersistentState<Client[]>('clients', []);
    const [savedQuotations, setSavedQuotations] = usePersistentState<SavedQuotation[]>('savedQuotations', []);
    
    // Current Quotation state
    const [items, setItems] = usePersistentState<QuotationItem[]>('currentQuotationItems', []);
    const [clientDetails, setClientDetails] = usePersistentState<ClientDetails>('currentClient', { name: '', address: '', phone: '' });
    const [discountPercent, setDiscountPercent] = usePersistentState('currentDiscount', settings.defaultDiscountPercent);
    const [taxPercent, setTaxPercent] = usePersistentState('currentTax', settings.defaultTaxPercent);
    const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
    const [quotationName, setQuotationName] = usePersistentState('currentQuotationName', '');
    const [currentQuotationId, setCurrentQuotationId] = usePersistentState<string | null>('currentQuotationId', null);
    
    // Helper to create a new blank item as per user request
    const createNewBlankItem = useCallback((): QuotationItem => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        room: '',
        templateId: 'none',
        width: settings.defaultItemWidth,
        height: settings.defaultItemHeight,
        fullnessFront: 0,
        fullnessBack: 0,
        fabricId: 'none',
        sheerId: 'none',
        liningId: 'none',
        frontMotorId: 'none',
        backMotorId: 'none',
        quantity: settings.defaultItemQuantity,
    }), [settings.defaultItemWidth, settings.defaultItemHeight, settings.defaultItemQuantity]);

    // Ensure there's always at least one row in the quotation table
    useEffect(() => {
        if (items.length === 0) {
            setItems([createNewBlankItem()]);
        }
    }, [items.length, createNewBlankItem, setItems]);
    
    const quotationNumber = useMemo(() => {
        const currentYear = new Date().getFullYear();
        if (settings.quotationYear !== currentYear) {
            // Reset for the new year
            setSettings(s => ({ ...s, quotationYear: currentYear, lastQuotationNumber: 0 }));
        }
        const nextNumber = settings.lastQuotationNumber + 1;
        return `Q-${settings.quotationYear}-${String(nextNumber).padStart(4, '0')}`;
    }, [settings.lastQuotationNumber, settings.quotationYear, setSettings]);
    

    const calculateDetailedAmount = useCallback((item: QuotationItem): DetailedCosts => {
        const template = templateOptions.find(t => t.id === item.templateId);
        if (!template) return { fabric: 0, sheer: 0, lining: 0, frontMotor: 0, backMotor: 0, accessories: 0, stitching: 0, fixing: 0, total: 0 };
        
        const costs: Omit<DetailedCosts, 'total'> = { fabric: 0, sheer: 0, lining: 0, frontMotor: 0, backMotor: 0, accessories: 0, stitching: 0, fixing: 0 };

        const widthM = item.width / 100;
        const heightM = item.height / 100;
        const areaSqM = widthM * heightM;

        const getProduct = (id: string) => productOptions.find(p => p.id === id && p.id !== 'none');
        const getPrice = (product?: ProductOption) => product?.discountPrice || product?.price || 0;

        // --- Material Costs ---
        const fabricProd = getProduct(item.fabricId);
        if (fabricProd) {
            if (template.calculationType === 'square-meter' || fabricProd.category === 'Blinds') {
                costs.fabric = areaSqM * getPrice(fabricProd);
            } else {
                const fabricWidthM = fabricProd.fabricWidth || 1.4;
                const panels = Math.ceil((widthM * item.fullnessFront) / fabricWidthM);
                costs.fabric = panels * (heightM + 0.25) * getPrice(fabricProd); // 25cm allowance
                if(template.stitchingPricePerPanelFabric) costs.stitching += panels * template.stitchingPricePerPanelFabric;
            }
        }

        const sheerProd = getProduct(item.sheerId);
        if (sheerProd) {
            const fabricWidthM = sheerProd.fabricWidth || 2.8;
            const panels = Math.ceil((widthM * item.fullnessBack) / fabricWidthM);
            costs.sheer = panels * (heightM + 0.25) * getPrice(sheerProd);
             if(template.stitchingPricePerPanelSheer) costs.stitching += panels * template.stitchingPricePerPanelSheer;
        }
        
        const liningProd = getProduct(item.liningId);
        if (liningProd) {
            const fabricWidthM = liningProd.fabricWidth || 1.4;
            // Lining usually follows the front layer's fullness
            const panels = Math.ceil((widthM * item.fullnessFront) / fabricWidthM);
            costs.lining = panels * (heightM + 0.25) * getPrice(liningProd);
            if(template.stitchingPricePerPanelLining) costs.stitching += panels * template.stitchingPricePerPanelLining;
        }

        // --- Motor Costs ---
        const frontMotorProd = getProduct(item.frontMotorId);
        if (frontMotorProd) costs.frontMotor = getPrice(frontMotorProd);
        
        const backMotorProd = getProduct(item.backMotorId);
        if (backMotorProd) costs.backMotor = getPrice(backMotorProd);

        // --- Accessory Costs from Template ---
        const accessoryIds = [...(template.defaultFrontAccessoryIds || []), ...(template.defaultBackAccessoryIds || [])];
        accessoryIds.forEach(accId => {
            const accProd = getProduct(accId);
            if (accProd) {
                if (accProd.unit === 'per-meter') {
                    costs.accessories += getPrice(accProd) * widthM;
                } else {
                    costs.accessories += getPrice(accProd);
                }
            }
        });

        // --- Fixing Costs ---
        if(template.fixingPricePerSqM) costs.fixing = areaSqM * template.fixingPricePerSqM;

        const total = (Object.values(costs).reduce((a, b) => a + b, 0)) * item.quantity;
        return { ...costs, total };
    }, [productOptions, templateOptions]);

    const calculateAmount = useCallback((item: QuotationItem): number => {
        return calculateDetailedAmount(item).total;
    }, [calculateDetailedAmount]);
    
    const { subtotal, discountAmount, taxAmount, grandTotal } = useMemo(() => {
        const sub = items.reduce((acc, item) => acc + calculateAmount(item), 0);
        const discount = (sub * discountPercent) / 100;
        const subAfterDiscount = sub - discount;
        const tax = (subAfterDiscount * taxPercent) / 100;
        const grand = subAfterDiscount + tax;
        return { subtotal: sub, discountAmount: discount, taxAmount: tax, grandTotal: grand };
    }, [items, discountPercent, taxPercent, calculateAmount]);

    const handleSaveQuotation = () => {
        const validItems = items.filter(item => item.templateId !== 'none' && (item.fabricId !== 'none' || item.sheerId !== 'none'));
        if (validItems.length === 0) {
            alert('Cannot save an empty quotation. Please add and configure at least one item.');
            return;
        }

        if (clientDetails.name.trim() && clientDetails.phone.trim()) {
            setClients(prevClients => {
                const trimmedPhone = clientDetails.phone.trim();
                const existingClientIndex = prevClients.findIndex(c => c.phone === trimmedPhone);

                if (existingClientIndex > -1) {
                    const existingClient = prevClients[existingClientIndex];
                    if (existingClient.name !== clientDetails.name.trim() || existingClient.address !== clientDetails.address.trim()) {
                        const updatedClients = [...prevClients];
                        updatedClients[existingClientIndex] = { ...existingClient, name: clientDetails.name.trim(), address: clientDetails.address.trim() };
                        return updatedClients;
                    }
                    return prevClients;
                } else {
                    const newClient: Client = { id: `client-${Date.now()}`, name: clientDetails.name.trim(), phone: trimmedPhone, address: clientDetails.address.trim() };
                    return [...prevClients, newClient];
                }
            });
        }

        if (currentQuotationId) { // UPDATE existing quotation
            const existingQuote = savedQuotations.find(q => q.id === currentQuotationId);
            if (!existingQuote) return;

            // Create a full snapshot of the *previous* state for version history
            const previousVersion: QuotationVersion = {
                savedAt: existingQuote.savedAt,
                grandTotal: existingQuote.grandTotal,
                items: existingQuote.items,
                clientDetails: existingQuote.clientDetails,
                discountPercent: existingQuote.discountPercent,
                taxPercent: existingQuote.taxPercent,
                quotationDate: existingQuote.quotationDate,
                name: existingQuote.name,
            };
            const newHistory = [...(existingQuote.history || []), previousVersion];

            const updatedQuotation: SavedQuotation = {
                ...existingQuote,
                name: quotationName.trim() || existingQuote.name,
                savedAt: new Date().toISOString(),
                quotationDate, items: validItems, companyDetails: settings.companyDetails, clientDetails, discountPercent, taxPercent, grandTotal,
                history: newHistory,
            };

            setSavedQuotations(prev => prev.map(q => q.id === currentQuotationId ? updatedQuotation : q));
            alert(`Quotation "${updatedQuotation.name}" updated successfully!`);
        } else { // SAVE new quotation
            const newStatus: QuotationStatus = 'Draft';
            const newStatusHistoryEntry: StatusHistoryEntry = {
                status: newStatus,
                date: new Date().toISOString(),
                notes: 'Quotation created.',
            };
            const newQuotation: SavedQuotation = {
                id: `quotation-${Date.now()}`,
                name: quotationName.trim() || `Quotation ${quotationNumber}`,
                savedAt: new Date().toISOString(),
                quotationNumber: quotationNumber,
                quotationDate, items: validItems, companyDetails: settings.companyDetails, clientDetails, discountPercent, taxPercent, grandTotal,
                status: newStatus,
                statusHistory: [newStatusHistoryEntry],
            };

            setSavedQuotations(prev => [newQuotation, ...prev]);
            setSettings(prev => ({...prev, lastQuotationNumber: prev.lastQuotationNumber + 1}));
            setCurrentQuotationId(newQuotation.id);
            alert(`Quotation "${newQuotation.name}" saved successfully!`);
        }
    };
    
    const handleNewQuotation = () => {
        setItems([createNewBlankItem()]);
        setClientDetails({ name: '', address: '', phone: '' });
        setDiscountPercent(settings.defaultDiscountPercent);
        setTaxPercent(settings.defaultTaxPercent);
        setQuotationName('');
        setCurrentQuotationId(null);
        setQuotationDate(new Date().toISOString().split('T')[0]);
    };

    const handleAddNewItem = () => {
        setItems(prev => [...prev, createNewBlankItem()]);
    };

    const onItemChange = useCallback((id: string, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id !== id) return item;

            let updatedItem = { ...item, [field]: value };

            if (field === 'templateId') {
                const template = templateOptions.find(t => t.id === value);
                if (template) {
                    updatedItem.fullnessFront = template.fullnessFront;
                    updatedItem.fullnessBack = template.fullnessBack;
                    if(template.defaultFabricId) updatedItem.fabricId = template.defaultFabricId;
                    if(template.defaultSheerId) updatedItem.sheerId = template.defaultSheerId;
                    if(template.defaultLiningId) updatedItem.liningId = template.defaultLiningId;
                    if(template.defaultFrontMotorId) updatedItem.frontMotorId = template.defaultFrontMotorId;
                    if(template.defaultBackMotorId) updatedItem.backMotorId = template.defaultBackMotorId;
                }
            }

            if (field === 'fabricId') {
                const product = productOptions.find(p => p.id === value);
                if (product && product.category === 'Blinds') {
                    const currentTemplate = templateOptions.find(t => t.id === updatedItem.templateId);
                    if (!currentTemplate || !currentTemplate.name.toLowerCase().includes('blind')) {
                         const blindTemplate = templateOptions.find(t => t.name.toLowerCase().includes('blind'));
                         if (blindTemplate) {
                            updatedItem.templateId = blindTemplate.id;
                            updatedItem.fullnessFront = blindTemplate.fullnessFront;
                            updatedItem.fullnessBack = blindTemplate.fullnessBack;
                         }
                    }
                    updatedItem.sheerId = 'none';
                    updatedItem.liningId = 'none';
                }
            }
            return updatedItem;
        }));
    }, [setItems, templateOptions, productOptions]);

    const onRemoveItem = (id: string) => setItems(prev => prev.filter(item => item.id !== id));
    
    const onCopyItem = (id: string) => {
      const itemToCopy = items.find(item => item.id === id);
      if(itemToCopy) {
        const index = items.findIndex(item => item.id === id);
        const newItem = {...itemToCopy, id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`};
        setItems(prev => [...prev.slice(0, index + 1), newItem, ...prev.slice(index + 1)]);
      }
    };
    
    const onReorderItems = (dragIndex: number, hoverIndex: number) => {
        setItems(prev => {
            const newItems = [...prev];
            const [draggedItem] = newItems.splice(dragIndex, 1);
            newItems.splice(hoverIndex, 0, draggedItem);
            return newItems;
        });
    };
    
    const onAddRoomOption = (newRoomName: string) => {
        if (!settings.roomOptions.some(r => r.name.toLowerCase() === newRoomName.toLowerCase())) {
            const newRoom: SelectOption = { id: newRoomName.toLowerCase().replace(/\s+/g, '-'), name: newRoomName };
            setSettings(prev => ({
                ...prev,
                roomOptions: [...prev.roomOptions, newRoom]
            }));
        }
    };

    const onSettingsChange = (newSettings: AppSettings) => setSettings(newSettings);

    const onExport = () => {
        const backup: AppDataBackup = { products: productOptions, templates: templateOptions, savedQuotations, settings, clients };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quotation-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const onImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data: AppDataBackup = JSON.parse(text);
                if(window.confirm("Are you sure you want to import data? This will overwrite all existing products, templates, quotations, and settings.")){
                    setProductOptions(data.products || []);
                    setTemplateOptions(data.templates || []);
                    setSavedQuotations(data.savedQuotations || []);
                    setSettings(data.settings || settings);
                    setClients(data.clients || []);
                    alert("Data imported successfully!");
                }
            } catch (error) {
                alert("Error importing data. The file might be corrupted.");
                console.error(error);
            } finally {
                event.target.value = ''; // Reset file input
            }
        };
        reader.readAsText(file);
    };

    const onReset = () => {
        if(window.confirm("ARE YOU SURE you want to reset all application data? This action is irreversible and will delete everything.")) {
            localStorage.clear();
            window.location.reload();
        }
    };
    
    const onResetColumnWidths = () => {
        setSettings(prev => ({...prev, quotationTableColumnWidths: INITIAL_COLUMN_WIDTHS}));
        alert("Column widths have been reset.");
    };
    
    const onLoadQuotation = (id: string) => {
        const quote = savedQuotations.find(q => q.id === id);
        if (quote) {
            setItems(quote.items);
            setClientDetails(quote.clientDetails);
            setDiscountPercent(quote.discountPercent);
            setTaxPercent(quote.taxPercent);
            setQuotationName(quote.name);
            setCurrentQuotationId(quote.id);
            setQuotationDate(quote.quotationDate);
            setActivePage('quotation');
        }
    };
    
    const onDeleteQuotation = (id: string) => {
        if(window.confirm("Are you sure you want to move this quotation to the trash?")) {
            setSavedQuotations(prev => prev.map(q => 
                q.id === id ? { ...q, deletedAt: new Date().toISOString() } : q
            ));
        }
    };

    const onRestoreQuotation = (id: string) => {
        setSavedQuotations(prev => prev.map(q => 
            q.id === id ? { ...q, deletedAt: null } : q
        ));
    };

    const onDeletePermanently = (id: string) => {
        if(window.confirm("This action is irreversible. Are you sure you want to permanently delete this quotation?")) {
            setSavedQuotations(prev => prev.filter(q => q.id !== id));
        }
    };
    
    const onCopyQuotation = (id: string) => {
        const quote = savedQuotations.find(q => q.id === id && !q.deletedAt);
        if (quote) {
            handleNewQuotation(); // Resets current ID, ready for a new save
            setTimeout(() => {
                setItems(quote.items);
                setClientDetails(quote.clientDetails);
                setDiscountPercent(quote.discountPercent);
                setTaxPercent(quote.taxPercent);
                setQuotationName(`${quote.name} (Copy)`);
                setActivePage('quotation');
            }, 0);
        }
    };

    const onPreviewQuotation = (id: string) => {
        const quote = savedQuotations.find(q => q.id === id);
        if (quote) {
            setPreviewData(quote);
            setPreviewing(true);
        }
    };

    const handleStatusUpdate = (id: string, newStatus: QuotationStatus, notes?: string) => {
        setSavedQuotations(prev => prev.map(q => {
            if (q.id !== id) return q;
    
            const newHistoryEntry: StatusHistoryEntry = {
                status: newStatus,
                date: new Date().toISOString(),
                notes: notes?.trim() || undefined,
            };
    
            return {
                ...q,
                status: newStatus,
                statusHistory: [...(q.statusHistory || []), newHistoryEntry],
            };
        }));
    };

    const handlePreviewVersion = (quoteId: string, version: QuotationVersion | 'current') => {
        const quote = savedQuotations.find(q => q.id === quoteId);
        if (!quote) return;

        let dataToPreview: SavedQuotation;

        if (version === 'current') {
            dataToPreview = quote;
        } else {
            dataToPreview = {
                ...quote, // Base details like id, company details
                name: version.name,
                savedAt: version.savedAt,
                quotationDate: version.quotationDate,
                items: version.items,
                clientDetails: version.clientDetails,
                discountPercent: version.discountPercent,
                taxPercent: version.taxPercent,
                grandTotal: version.grandTotal,
            };
        }
        setPreviewData(dataToPreview);
        setPreviewing(true);
    };

    const handleRestoreVersion = (quoteId: string, versionSavedAt: string) => {
        const quote = savedQuotations.find(q => q.id === quoteId);
        const version = quote?.history?.find(h => h.savedAt === versionSavedAt);

        if (version) {
            setItems(version.items);
            setClientDetails(version.clientDetails);
            setDiscountPercent(version.discountPercent);
            setTaxPercent(version.taxPercent);
            setQuotationName(`${version.name} (Restored)`);
            setQuotationDate(version.quotationDate);
            setCurrentQuotationId(null); // Treat as a new draft
            setActivePage('quotation');
            alert(`Version from ${new Date(version.savedAt).toLocaleString()} loaded as a new draft.`);
        } else {
            alert('Error: Could not find the selected version to restore.');
        }
    };


    const onViewClientQuotations = (clientName: string) => {
        setClientFilter(clientName);
        setActivePage('saved-quotations');
    };

    const handleClientDetailsChange = (field: keyof ClientDetails, value: string) => {
        let formattedValue = value;
        
        // Apply proper casing based on field type
        if (field === 'name') {
            formattedValue = toProperCase(value);
            const selectedClient = clients.find(c => c.name === formattedValue);
            if (selectedClient) {
                setClientDetails({ name: selectedClient.name, phone: selectedClient.phone, address: selectedClient.address });
            } else {
                setClientDetails(c => ({ ...c, name: formattedValue }));
            }
        } else if (field === 'phone') {
            formattedValue = formatPhoneNumber(value);
            setClientDetails(c => ({ ...c, phone: formattedValue }));
        } else if (field === 'address') {
            formattedValue = toProperCase(value);
            setClientDetails(c => ({ ...c, address: formattedValue }));
        } else {
            setClientDetails(c => ({ ...c, [field]: formattedValue }));
        }
    };
    
    const handlePreview = () => {
        const currentStatus = currentQuotationId 
            ? savedQuotations.find(q => q.id === currentQuotationId)?.status || 'Draft'
            : 'Draft';
        setPreviewData({
           id: currentQuotationId || 'temp-preview', name: quotationName || `Quotation ${quotationNumber}`, savedAt: new Date().toISOString(), quotationNumber, quotationDate, items, companyDetails: settings.companyDetails, clientDetails, discountPercent, taxPercent, grandTotal,
           status: currentStatus
        });
        setPreviewing(true);
    };

    const renderPage = () => {
        switch (activePage) {
            case 'dashboard': return <DashboardPage savedQuotations={savedQuotations.filter(q => !q.deletedAt)} clients={clients} setActivePage={setActivePage} />;
            case 'products': return <ProductsPage productOptions={productOptions} setProductOptions={setProductOptions} />;
            case 'templates': return <TemplatesPage templateOptions={templateOptions} setTemplateOptions={setTemplateOptions} productOptions={productOptions} settings={settings} />;
            case 'saved-quotations': return <SavedQuotationsPage quotations={savedQuotations} onLoad={onLoadQuotation} onDelete={onDeleteQuotation} onCopy={onCopyQuotation} onPreview={onPreviewQuotation} onRestore={onRestoreQuotation} onDeletePermanently={onDeletePermanently} onRestoreVersion={handleRestoreVersion} onPreviewVersion={handlePreviewVersion} clientFilter={clientFilter} onClearFilter={() => setClientFilter(null)} onStatusUpdate={handleStatusUpdate} />;
            case 'settings': return <SettingsPage settings={settings} onSettingsChange={onSettingsChange} onExport={onExport} onImport={onImport} onReset={onReset} onResetColumnWidths={onResetColumnWidths} />;
            case 'reports': return <ReportsPage savedQuotations={savedQuotations.filter(q => !q.deletedAt)} productOptions={productOptions} templateOptions={templateOptions} calculateDetailedAmount={calculateDetailedAmount} />;
            case 'clients': return <ClientsPage clients={clients} setClients={setClients} savedQuotations={savedQuotations} onViewQuotations={onViewClientQuotations} />;
            case 'quotation':
            default:
                return (
                    <div className="space-y-6">
                       <QuotationControls
                            quotationName={quotationName}
                            setQuotationName={setQuotationName}
                            quotationNumber={quotationNumber}
                            handleNewQuotation={handleNewQuotation}
                            handlePreview={handlePreview}
                            handleSaveQuotation={handleSaveQuotation}
                            currentQuotationId={currentQuotationId}
                            clientDetails={clientDetails}
                            handleClientDetailsChange={handleClientDetailsChange}
                            clients={clients}
                            savedQuotations={savedQuotations}
                            quotationDate={quotationDate}
                            setQuotationDate={setQuotationDate}
                       />
                       <QuotationTable 
                            items={items}
                            onItemChange={onItemChange}
                            onRemoveItem={onRemoveItem}
                            onCopyItem={onCopyItem}
                            onReorderItems={onReorderItems}
                            calculateAmount={calculateAmount}
                            templateOptions={templateOptions}
                            productOptions={productOptions}
                            setActivePage={setActivePage}
                            roomOptions={settings.roomOptions}
                            onAddRoomOption={onAddRoomOption}
                            columnWidths={settings.quotationTableColumnWidths}
                            onColumnWidthsChange={(newWidths) => {
                                if (settings.autoSaveColumnWidths) {
                                    setSettings(prev => ({...prev, quotationTableColumnWidths: newWidths}));
                                }
                            }}
                        />
                        <QuotationTotals
                            handleAddNewItem={handleAddNewItem}
                            subtotal={subtotal}
                            discountPercent={discountPercent}
                            setDiscountPercent={setDiscountPercent}
                            discountAmount={discountAmount}
                            taxPercent={taxPercent}
                            setTaxPercent={setTaxPercent}
                            grandTotal={grandTotal}
                        />
                    </div>
                );
        }
    };
    
    return (
        <div className={`bg-slate-900 text-slate-100 min-h-screen font-sans transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
            <Sidebar activePage={activePage} setActivePage={setActivePage} isMobileOpen={isSidebarMobileOpen} isCollapsed={isSidebarCollapsed} setCollapsed={setSidebarCollapsed} />
            
            <header className="sticky top-0 z-30 bg-slate-900/70 backdrop-blur-sm border-b border-slate-700/50 lg:hidden">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2"><CurtainIcon className="w-7 h-7 text-blue-400" /><span className="font-bold text-lg">Quotation Pro</span></div>
                        <button onClick={() => setSidebarMobileOpen(!isSidebarMobileOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-expanded={isSidebarMobileOpen}><span className="sr-only">Open main menu</span><MenuIcon className="h-6 w-6" /></button>
                    </div>
                </div>
            </header>

            <main className="p-4 sm:p-6 lg:p-8">
                {renderPage()}
            </main>
            
            {isPreviewing && previewData && (
                <QuotationPreview
                    quotation={previewData}
                    calculateAmount={calculateAmount}
                    productOptions={productOptions}
                    templateOptions={templateOptions}
                    settings={settings}
                    onClose={() => { setPreviewing(false); setPreviewData(null); }}
                />
            )}
        </div>
    );
};