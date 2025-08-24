


export type ProductCategory = 'Fabric' | 'Sheer' | 'Blackout' | 'Motor' | 'Blinds' | 'Accessory';
export type ProductUnit = 'per-meter' | 'per-sq-meter' | 'per-item';

export interface CompanyDetails {
    name: string;
    address: string;
    phone: string;
    contactPerson: string;
}

export interface ClientDetails {
    name: string;
    address: string;
    phone: string;
}

export interface Client {
    id: string;
    name: string;
    address: string;
    phone: string;
}

export interface QuotationItem {
  id: string;
  room: string;
  templateId: string;
  width: number; // in cm
  height: number; // in cm
  fullnessFront: number;
  fullnessBack: number;
  fabricId: string; // id from ProductOption (Fabric or Blinds)
  sheerId: string; // id from ProductOption (Sheer)
  liningId: string; // id from ProductOption (Blackout)
  frontMotorId: string;
  backMotorId: string;
  quantity: number;
}

export interface SelectOption {
    id: string;
    name: string;
}

export interface TemplateOption extends SelectOption {
    fullnessFront: number; // Fabric multiplier for front layer (fabric/blinds)
    fullnessBack: number; // Fabric multiplier for back layer (sheer/lining)
    calculationType: 'running-meter' | 'square-meter';
    defaultFabricId?: string;
    defaultSheerId?: string;
    defaultLiningId?: string;
    defaultFrontMotorId?: string;
    defaultBackMotorId?: string;
    defaultFrontAccessoryIds?: string[];
    defaultBackAccessoryIds?: string[];
    stitchingPricePerPanelFabric?: number;
    stitchingPricePerPanelSheer?: number;
    stitchingPricePerPanelLining?: number;
    fixingPricePerSqM?: number;
}

export interface ProductOption extends SelectOption {
    price: number;
    discountPrice?: number;
    category: ProductCategory;
    unit: ProductUnit;
    fabricWidth?: number; // in meters
}

export interface QuotationVersion {
    savedAt: string;
    grandTotal: number;
    // Full snapshot for restoration
    items: QuotationItem[];
    clientDetails: ClientDetails;
    discountPercent: number;
    discountAmount?: number; // Fixed discount amount - new field
    discountType?: 'percentage' | 'fixed'; // Type of discount - new field
    taxPercent: number;
    quotationDate: string;
    expirationDate?: string; // ISO string date - new field
    name: string; 
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Completed' | 'Rejected';

export interface StatusHistoryEntry {
    status: QuotationStatus;
    date: string; // ISO string
    notes?: string;
}

export interface SavedQuotation {
    id: string;
    name: string;
    savedAt: string; // ISO string date
    quotationNumber: string;
    quotationDate: string;
    expirationDate?: string; // ISO string date - new field
    items: QuotationItem[];
    companyDetails: CompanyDetails;
    clientDetails: ClientDetails;
    discountPercent: number;
    discountAmount?: number; // Fixed discount amount - new field
    discountType?: 'percentage' | 'fixed'; // Type of discount - new field
    taxPercent: number;
    grandTotal: number;
    history?: QuotationVersion[];
    deletedAt?: string | null;
    status: QuotationStatus;
    statusHistory?: StatusHistoryEntry[];
}

export interface DeliveryEstimateTier {
    id: string;
    minWindows: number;
    maxWindows: number;
    timeframe: string;
}

export interface AppSettings {
    companyDetails: CompanyDetails;
    defaultDiscountPercent: number;
    defaultTaxPercent: number;
    defaultExpirationDays: number; // Days from quotation date when it expires
    termsAndConditions: string;
    paymentTerms: string;
    scopeOfWork: string;
    lastQuotationNumber: number;
    quotationYear: number;
    autoSaveColumnWidths: boolean;
    quotationTableColumnWidths: number[];
    deliveryEstimateTiers: DeliveryEstimateTier[];
    // New customizable defaults
    defaultItemWidth: number;
    defaultItemHeight: number;
    defaultItemQuantity: number;
    defaultTemplateFullnessFront: number;
    defaultTemplateFullnessBack: number;
    roomOptions: SelectOption[];
}

export interface AppDataBackup {
    products: ProductOption[];
    templates: TemplateOption[];
    savedQuotations: SavedQuotation[];
    settings: AppSettings;
    clients: Client[];
    jobCards: JobCard[];
    deliveryNotes: DeliveryNote[];
}

export interface DetailedCosts {
    fabric: number;
    sheer: number;
    lining: number;
    frontMotor: number;
    backMotor: number;
    accessories: number;
    stitching: number;
    fixing: number;
    total: number;
}

export type JobCardStatus = 'Created' | 'In Progress' | 'Measurement Taken' | 'Production' | 'Ready for Installation' | 'Installed' | 'Completed';

export interface JobCard {
    id: string;
    jobNumber: string;
    quotationId: string;
    quotationNumber: string;
    clientDetails: ClientDetails;
    items: QuotationItem[];
    status: JobCardStatus;
    createdAt: string;
    updatedAt: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
    notes: string;
    measurements?: JobCardMeasurement[];
    productionNotes?: string;
    installationNotes?: string;
    assignedTo?: string;
    priority: 'Low' | 'Medium' | 'High';
}

export interface JobCardMeasurement {
    itemId: string;
    actualWidth: number;
    actualHeight: number;
    measuredBy: string;
    measuredAt: string;
    notes?: string;
}

export interface DeliveryNoteItem {
    itemId: string;
    room: string;
    description: string;
    quantity: number;
    delivered: number;
    pending: number;
    notes?: string;
}

export interface DeliveryNote {
    id: string;
    deliveryNumber: string;
    jobCardId: string;
    jobNumber: string;
    clientDetails: ClientDetails;
    items: DeliveryNoteItem[];
    deliveryDate: string;
    deliveredBy: string;
    receivedBy?: string;
    status: 'Prepared' | 'In Transit' | 'Delivered' | 'Received';
    notes: string;
    createdAt: string;
    updatedAt: string;
    vehicleNumber?: string;
    driverContact?: string;
    estimatedDeliveryTime?: string;
    actualDeliveryTime?: string;
}