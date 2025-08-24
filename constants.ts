import type { SelectOption, TemplateOption, ProductOption, ProductCategory, ProductUnit } from './types';

export const INITIAL_ROOM_OPTIONS: SelectOption[] = [
    { id: 'living-room', name: 'Living Room' },
    { id: 'master-bedroom', name: 'Master Bedroom' },
    { id: 'guest-bedroom', name: 'Guest Bedroom' },
    { id: 'dining-room', name: 'Dining Room' },
    { id: 'study-room', name: 'Study Room' },
    { id: 'kitchen', name: 'Kitchen' },
];

export const INITIAL_TEMPLATE_OPTIONS: TemplateOption[] = [
    { id: 'none', name: 'None', fullnessFront: 0, fullnessBack: 0, calculationType: 'running-meter' },
    { id: 'eyelet', name: 'Eyelet', fullnessFront: 1.8, fullnessBack: 2.0, calculationType: 'running-meter' },
    { id: 'french-pleat', name: 'French Pleat', fullnessFront: 2.5, fullnessBack: 2.5, calculationType: 'running-meter' },
    { id: 'goblet-pleat', name: 'Goblet Pleat', fullnessFront: 2.2, fullnessBack: 2.2, calculationType: 'running-meter' },
    { id: 'rod-pocket', name: 'Rod Pocket', fullnessFront: 2.0, fullnessBack: 2.0, calculationType: 'running-meter' },
    { id: 'roman-blind', name: 'Roman Blind', fullnessFront: 1.1, fullnessBack: 1.1, calculationType: 'square-meter' },
];

export const PRODUCT_CATEGORIES: ProductCategory[] = ['Fabric', 'Sheer', 'Blackout', 'Motor', 'Blinds', 'Accessory'];
export const PRODUCT_UNITS: ProductUnit[] = ['per-meter', 'per-sq-meter', 'per-item'];


export const INITIAL_PRODUCT_OPTIONS: ProductOption[] = [
    { id: 'none', name: 'None', price: 0, category: 'Fabric', unit: 'per-meter' },
    
    // Fabrics
    { id: 'cotton-plain', name: 'Cotton - Plain', price: 10.5, category: 'Fabric', unit: 'per-meter', fabricWidth: 1.4 },
    { id: 'cotton-printed', name: 'Cotton - Printed', price: 14.0, category: 'Fabric', unit: 'per-meter', fabricWidth: 1.4 },
    { id: 'linen-blend', name: 'Linen Blend', price: 21.0, category: 'Fabric', unit: 'per-meter', fabricWidth: 1.4 },
    { id: 'velvet', name: 'Velvet', price: 28.0, category: 'Fabric', unit: 'per-meter', fabricWidth: 2.8 },
    
    // Sheers & Blackouts (Linings)
    { id: 'sheer-voile', name: 'Sheer Voile', price: 8.5, category: 'Sheer', unit: 'per-meter', fabricWidth: 2.8 },
    { id: 'dimout-lining', name: 'Dimout Lining', price: 11.0, category: 'Blackout', unit: 'per-meter', fabricWidth: 1.4 },
    { id: 'blackout-lining', name: 'Blackout Lining', price: 17.0, category: 'Blackout', unit: 'per-meter', fabricWidth: 1.4 },

    // Blinds
    { id: 'roller-blind-standard', name: 'Roller Blind - Standard', price: 35.0, category: 'Blinds', unit: 'per-sq-meter'},
    { id: 'venetian-blind-wood', name: 'Venetian Blind - Wood', price: 75.0, category: 'Blinds', unit: 'per-sq-meter'},

    // Motors
    { id: 'somfy-motor-s1', name: 'Somfy Motor S1', price: 150.0, category: 'Motor', unit: 'per-item' },
    { id: 'smart-curtain-motor-z1', name: 'Smart Curtain Motor Z1', price: 220.0, category: 'Motor', unit: 'per-item' },

    // Accessories
    { id: 'standard-rod-2m', name: 'Standard Curtain Rod (2m)', price: 25.0, category: 'Accessory', unit: 'per-item' },
    { id: 'tie-back-tassel', name: 'Tie-Back Tassel (Pair)', price: 12.0, category: 'Accessory', unit: 'per-item' },
    { id: 'acc-wave-tape', name: 'Wave Tape', price: 2.0, category: 'Accessory', unit: 'per-meter' },
];

export const INITIAL_COLUMN_WIDTHS: number[] = [
    60, 150, 96, 96, 180, 96, 96, 180, 150, 150, 150, 150, 80, 144, 80
];
