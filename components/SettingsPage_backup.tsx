import React, { useState, useEffect } from 'react';
import type { AppSettings, DeliveryEstimateTier, SelectOption } from '../types';
import { useUpdater } from '../hooks/useUpdater';

// Text casing utility functions
const toProperCase = (str: string): string => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const toTitleCase = (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatPhoneNumber = (str: string): string => {
    // Remove any non-digit characters except spaces, commas, and basic formatting
    return str.replace(/[^\d\s,+()-]/g, '').trim();
};

const toUpperCase = (str: string): string => {
    return str.toUpperCase();
};

const sharedInputClass = "w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

// --- Icons --- //
const UploadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);
const DownloadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
const RefreshIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h5v5M20 20h-5v-5" />
    </svg>
);
const PlusIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{className?: string}> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const UpdateIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);


interface SettingsPageProps {
    settings: AppSettings;
    onSettingsChange: (newSettings: AppSettings) => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onReset: () => void;
    onResetColumnWidths: () => void;
}

const TABS = [
    { id: 'general', name: 'General' },
    { id: 'defaults', name: 'Defaults & Options' },
    { id: 'document', name: 'Quotation Document' },
    { id: 'application', name: 'Application' },
    { id: 'updates', name: 'Updates' },
];

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSettingsChange, onExport, onImport, onReset, onResetColumnWidths }) => {
    
    const [localSettings, setLocalSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('general');
    const { updateInfo, checkForUpdates, installUpdate } = useUpdater();
    
    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleCompanyChange = (field: keyof AppSettings['companyDetails'], value: string) => {
        let formattedValue = value;
        
        // Apply proper casing based on field type
        if (field === 'name') {
            formattedValue = toUpperCase(value); // Company names are usually uppercase
        } else if (field === 'address') {
            formattedValue = toProperCase(value);
        } else if (field === 'contactPerson') {
            formattedValue = toProperCase(value);
        }
        // Phone numbers keep original formatting for flexibility
        
        setLocalSettings(prev => ({
            ...prev,
            companyDetails: { ...prev.companyDetails, [field]: formattedValue }
        }));
    };

    const handleNumericChange = (field: keyof AppSettings, value: string) => {
        setLocalSettings(prev => ({
            ...prev,
            [field]: Number(value) || 0
        }));
    };

    const handleTierChange = (id: string, field: keyof Omit<DeliveryEstimateTier, 'id'>, value: string | number) => {
        setLocalSettings(prev => ({
            ...prev,
            deliveryEstimateTiers: prev.deliveryEstimateTiers.map(tier =>
                tier.id === id ? { ...tier, [field]: field === 'timeframe' ? value : Number(value) || 0 } : tier
            )
        }));
    };

    const handleAddTier = () => {
        const newTier: DeliveryEstimateTier = {
            id: `tier-${Date.now()}`,
            minWindows: (localSettings.deliveryEstimateTiers[localSettings.deliveryEstimateTiers.length - 1]?.maxWindows || 0) + 1,
            maxWindows: (localSettings.deliveryEstimateTiers[localSettings.deliveryEstimateTiers.length - 1]?.maxWindows || 0) + 5,
            timeframe: ''
        };
        setLocalSettings(prev => ({
            ...prev,
            deliveryEstimateTiers: [...prev.deliveryEstimateTiers, newTier]
        }));
    };

    const handleRemoveTier = (id: string) => {
        setLocalSettings(prev => ({
            ...prev,
            deliveryEstimateTiers: prev.deliveryEstimateTiers.filter(tier => tier.id !== id)
        }));
    };

    const handleRoomNameChange = (roomId: string, newName: string) => {
        const formattedName = toProperCase(newName);
        setLocalSettings(prev => ({
            ...prev,
            roomOptions: prev.roomOptions.map(room => 
                room.id === roomId ? { ...room, name: formattedName } : room
            )
        }));
    };    const handleAddRoom = () => {
        const newRoom: SelectOption = {
            id: `room-${Date.now()}`,
            name: ''
        };
        setLocalSettings(prev => ({
            ...prev,
            roomOptions: [...prev.roomOptions, newRoom]
        }));
    };

    const handleRemoveRoom = (id: string) => {
        setLocalSettings(prev => ({
            ...prev,
            roomOptions: prev.roomOptions.filter(room => room.id !== id)
        }));
    };


    const handleSave = () => {
        // Filter out empty room names before saving
        const cleanedSettings = {
            ...localSettings,
            roomOptions: localSettings.roomOptions.filter(room => room.name.trim() !== '')
        };
        onSettingsChange(cleanedSettings);
        alert("Settings have been saved!");
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Company Details</h2>
                            <p className="text-sm text-slate-400 mb-6">This information will be used as the default 'From' address on new quotations.</p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                                    <input 
                                        id="companyName" 
                                        type="text" 
                                        value={localSettings.companyDetails.name} 
                                        onChange={e => handleCompanyChange('name', toTitleCase(e.target.value))} 
                                        onBlur={e => handleCompanyChange('name', toTitleCase(e.target.value))}
                                        onPaste={e => {
                                            setTimeout(() => {
                                                const pastedValue = e.currentTarget.value;
                                                handleCompanyChange('name', toTitleCase(pastedValue));
                                            }, 0);
                                        }}
                                        className={sharedInputClass} 
                                        placeholder="Your Company Name" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="companyAddress" className="block text-sm font-medium text-slate-300 mb-1">Address</label>
                                    <input 
                                        id="companyAddress" 
                                        type="text" 
                                        value={localSettings.companyDetails.address} 
                                        onChange={e => handleCompanyChange('address', toProperCase(e.target.value))} 
                                        onBlur={e => handleCompanyChange('address', toProperCase(e.target.value))}
                                        onPaste={e => {
                                            setTimeout(() => {
                                                const pastedValue = e.currentTarget.value;
                                                handleCompanyChange('address', toProperCase(pastedValue));
                                            }, 0);
                                        }}
                                        className={sharedInputClass} 
                                        placeholder="123 Main Street, City" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="companyPhone" className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                                    <input 
                                        id="companyPhone" 
                                        type="text" 
                                        value={localSettings.companyDetails.phone} 
                                        onChange={e => handleCompanyChange('phone', formatPhoneNumber(e.target.value))} 
                                        onBlur={e => handleCompanyChange('phone', formatPhoneNumber(e.target.value))}
                                        onPaste={e => {
                                            setTimeout(() => {
                                                const pastedValue = e.currentTarget.value;
                                                handleCompanyChange('phone', formatPhoneNumber(pastedValue));
                                            }, 0);
                                        }}
                                        className={sharedInputClass} 
                                        placeholder="Tel: xxx, WhatsApp: xxx" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-300 mb-1">Contact Person (for signature)</label>
                                    <input 
                                        id="contactPerson" 
                                        type="text" 
                                        value={localSettings.companyDetails.contactPerson} 
                                        onChange={e => handleCompanyChange('contactPerson', toProperCase(e.target.value))} 
                                        onBlur={e => handleCompanyChange('contactPerson', toProperCase(e.target.value))}
                                        onPaste={e => {
                                            setTimeout(() => {
                                                const pastedValue = e.currentTarget.value;
                                                handleCompanyChange('contactPerson', toProperCase(pastedValue));
                                            }, 0);
                                        }}
                                        className={sharedInputClass} 
                                        placeholder="e.g., John Doe" 
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Financial Defaults</h2>
                            <p className="text-sm text-slate-400 mb-6">Set the default discount and tax percentages for new quotations.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="defaultDiscount" className="block text-sm font-medium text-slate-300 mb-1">Default Discount (%)</label>
                                    <input id="defaultDiscount" type="number" value={localSettings.defaultDiscountPercent} onChange={e => handleNumericChange('defaultDiscountPercent', e.target.value)} className={sharedInputClass} min="0" />
                                </div>
                                <div>
                                    <label htmlFor="defaultTax" className="block text-sm font-medium text-slate-300 mb-1">Default Tax (%)</label>
                                    <input id="defaultTax" type="number" value={localSettings.defaultTaxPercent} onChange={e => handleNumericChange('defaultTaxPercent', e.target.value)} className={sharedInputClass} min="0" />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'defaults':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quotation Item Defaults</h2>
                            <p className="text-sm text-slate-400 mb-6">Set the default values for new items added to a quotation.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label htmlFor="defaultItemWidth" className="block text-sm font-medium text-slate-300 mb-1">Default Width (cm)</label>
                                    <input id="defaultItemWidth" type="number" value={localSettings.defaultItemWidth} onChange={e => handleNumericChange('defaultItemWidth', e.target.value)} className={sharedInputClass} min="0" />
                                </div>
                                <div>
                                    <label htmlFor="defaultItemHeight" className="block text-sm font-medium text-slate-300 mb-1">Default Height (cm)</label>
                                    <input id="defaultItemHeight" type="number" value={localSettings.defaultItemHeight} onChange={e => handleNumericChange('defaultItemHeight', e.target.value)} className={sharedInputClass} min="0" />
                                </div>
                                <div>
                                    <label htmlFor="defaultItemQuantity" className="block text-sm font-medium text-slate-300 mb-1">Default Quantity</label>
                                    <input id="defaultItemQuantity" type="number" value={localSettings.defaultItemQuantity} onChange={e => handleNumericChange('defaultItemQuantity', e.target.value)} className={sharedInputClass} min="1" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Template Defaults</h2>
                            <p className="text-sm text-slate-400 mb-6">Set the default fullness for new templates created on the Templates page.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="defaultTemplateFullnessFront" className="block text-sm font-medium text-slate-300 mb-1">Default Fullness (Front)</label>
                                    <input id="defaultTemplateFullnessFront" type="number" value={localSettings.defaultTemplateFullnessFront} onChange={e => handleNumericChange('defaultTemplateFullnessFront', e.target.value)} className={sharedInputClass} min="0" step="0.1" />
                                </div>
                                <div>
                                    <label htmlFor="defaultTemplateFullnessBack" className="block text-sm font-medium text-slate-300 mb-1">Default Fullness (Back)</label>
                                    <input id="defaultTemplateFullnessBack" type="number" value={localSettings.defaultTemplateFullnessBack} onChange={e => handleNumericChange('defaultTemplateFullnessBack', e.target.value)} className={sharedInputClass} min="0" step="0.1" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Default Room Names</h2>
                            <p className="text-sm text-slate-400 mb-6">Manage the list of room names available in the quotation table dropdown.</p>
                            <div className="space-y-3">
                                {localSettings.roomOptions.map((room) => (
                                    <div key={room.id} className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={room.name}
                                            onChange={e => handleRoomNameChange(room.id, toTitleCase(e.target.value))}
                                            onBlur={e => handleRoomNameChange(room.id, toTitleCase(e.target.value))}
                                            onPaste={e => {
                                                setTimeout(() => {
                                                    const pastedValue = e.currentTarget.value;
                                                    handleRoomNameChange(room.id, toTitleCase(pastedValue));
                                                }, 0);
                                            }}
                                            className={sharedInputClass}
                                            placeholder="Enter room name"
                                        />
                                        <button onClick={() => handleRemoveRoom(room.id)} className="flex-shrink-0 text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/50" title="Remove Room">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddRoom}
                                    className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-600/50 border border-dashed border-slate-500 text-slate-300 font-semibold rounded-lg hover:bg-slate-700/50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Room
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'document':
                 return (
                    <div className="space-y-6">
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Quotation Text Blocks</h2>
                            <p className="text-sm text-slate-400 mb-6">Define the terms and text blocks that will appear on every quotation preview.</p>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="scopeOfWork" className="block text-sm font-medium text-slate-300 mb-1">Scope of Work</label>
                                    <textarea
                                        id="scopeOfWork"
                                        rows={3}
                                        value={localSettings.scopeOfWork}
                                        onChange={e => setLocalSettings(prev => ({ ...prev, scopeOfWork: e.target.value }))}
                                        className={sharedInputClass}
                                        placeholder="Enter default scope of work..."
                                    />
                                </div>
                                <div>
                                    <label htmlFor="termsAndConditions" className="block text-sm font-medium text-slate-300 mb-1">Terms & Conditions</label>
                                    <textarea
                                        id="termsAndConditions"
                                        rows={5}
                                        value={localSettings.termsAndConditions}
                                        onChange={e => setLocalSettings(prev => ({ ...prev, termsAndConditions: e.target.value }))}
                                        className={sharedInputClass}
                                        placeholder="Enter terms and conditions here..."
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Use the placeholder <code>{'{delivery_estimate}'}</code> to show a dynamic delivery time.
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="paymentTerms" className="block text-sm font-medium text-slate-300 mb-1">Payment Terms</label>
                                    <textarea
                                        id="paymentTerms"
                                        rows={2}
                                        value={localSettings.paymentTerms}
                                        onChange={e => setLocalSettings(prev => ({ ...prev, paymentTerms: e.target.value }))}
                                        className={sharedInputClass}
                                        placeholder="e.g., 50% advance..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Delivery Time Tiers</h2>
                            <p className="text-sm text-slate-400 mb-6">Define the timeframes for the <code>{'{delivery_estimate}'}</code> placeholder based on total window quantity.</p>
                            <div className="space-y-3">
                                {localSettings.deliveryEstimateTiers.map((tier) => (
                                    <div key={tier.id} className="grid grid-cols-1 sm:grid-cols-8 gap-3 items-center">
                                        <div className="sm:col-span-2">
                                            <label htmlFor={`min-${tier.id}`} className="sr-only">Min Windows</label>
                                            <input id={`min-${tier.id}`} type="number" value={tier.minWindows} onChange={e => handleTierChange(tier.id, 'minWindows', e.target.value)} className={sharedInputClass} placeholder="Min" />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label htmlFor={`max-${tier.id}`} className="sr-only">Max Windows</label>
                                            <input id={`max-${tier.id}`} type="number" value={tier.maxWindows} onChange={e => handleTierChange(tier.id, 'maxWindows', e.target.value)} className={sharedInputClass} placeholder="Max" />
                                        </div>
                                        <div className="sm:col-span-3">
                                            <label htmlFor={`timeframe-${tier.id}`} className="sr-only">Timeframe</label>
                                            <input 
                                                id={`timeframe-${tier.id}`} 
                                                type="text" 
                                                value={tier.timeframe} 
                                                onChange={e => handleTierChange(tier.id, 'timeframe', toProperCase(e.target.value))} 
                                                onBlur={e => handleTierChange(tier.id, 'timeframe', toProperCase(e.target.value))}
                                                onPaste={e => {
                                                    setTimeout(() => {
                                                        const pastedValue = e.currentTarget.value;
                                                        handleTierChange(tier.id, 'timeframe', toProperCase(pastedValue));
                                                    }, 0);
                                                }}
                                                className={sharedInputClass} 
                                                placeholder="e.g., 3-4 weeks" 
                                            />
                                        </div>
                                        <div className="sm:col-span-1 text-right">
                                            <button onClick={() => handleRemoveTier(tier.id)} className="text-slate-500 hover:text-red-500 transition-colors p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/50" title="Remove Tier">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={handleAddTier}
                                    className="w-full flex items-center justify-center gap-2 mt-4 px-4 py-2 bg-slate-600/50 border border-dashed border-slate-500 text-slate-300 font-semibold rounded-lg hover:bg-slate-700/50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Add Tier
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'application':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Table Layout Settings</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between bg-slate-700/50 p-4 rounded-lg">
                                    <div>
                                        <label htmlFor="autoSaveWidths" className="font-medium text-white cursor-pointer">Auto-save column widths</label>
                                        <p className="text-sm text-slate-400">Automatically save resized column widths in the quotation table.</p>
                                    </div>
                                    <div className="flex-shrink-0 ml-4">
                                        <input
                                            id="autoSaveWidths"
                                            type="checkbox"
                                            checked={localSettings.autoSaveColumnWidths}
                                            onChange={e => setLocalSettings(prev => ({ ...prev, autoSaveColumnWidths: e.target.checked }))}
                                            className="h-6 w-6 rounded border-slate-500 bg-slate-600 text-blue-500 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Layout Management</label>
                                    <button
                                        onClick={onResetColumnWidths}
                                        className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
                                    >
                                        Reset Quotation Table Column Widths to Default
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Data Management</h2>
                            <p className="text-sm text-slate-400 mb-6">Backup your data to a file or restore it. Be careful, importing will overwrite existing data.</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={onExport}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                                >
                                    <DownloadIcon className="w-5 h-5" />
                                    Export Data
                                </button>
                                
                                <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors">
                                    <UploadIcon className="w-5 h-5" />
                                    Import Data
                                    <input type="file" accept=".json" className="hidden" onChange={onImport} />
                                </label>

                                <button
                                    onClick={onReset}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-700 text-white font-semibold rounded-lg shadow-md hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                                >
                                    <RefreshIcon className="w-5 h-5" />
                                    Reset App
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 'updates':
                return (
                    <div className="space-y-6">
                        <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Application Updates</h2>
                            <p className="text-sm text-slate-400 mb-6">Manage application updates and check your current version.</p>
                            
                            <div className="space-y-4">
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-2">Current Version</h3>
                                    <p className="text-slate-300 text-lg font-mono">{updateInfo.version}</p>
                                </div>
                                
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-3">Update Status</h3>
                                    <div className="space-y-3">
                                        {updateInfo.hasUpdate && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                                <span className="text-green-400 font-medium">Update Available!</span>
                                            </div>
                                        )}
                                        
                                        {updateInfo.error && (
                                            <div className="flex items-start gap-3">
                                                <div className="w-3 h-3 bg-orange-500 rounded-full mt-0.5"></div>
                                                <div>
                                                    <span className="text-orange-400 font-medium">Notice:</span>
                                                    <p className="text-slate-300 text-sm mt-1">{updateInfo.error}</p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {!updateInfo.hasUpdate && !updateInfo.error && !updateInfo.isChecking && (
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                                                <span className="text-slate-400">No updates checked yet</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={checkForUpdates}
                                        disabled={updateInfo.isChecking}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                                    >
                                        <UpdateIcon className={`w-5 h-5 ${updateInfo.isChecking ? 'animate-spin' : ''}`} />
                                        {updateInfo.isChecking ? 'Checking...' : 'Check for Updates'}
                                    </button>
                                    
                                    {updateInfo.hasUpdate && (
                                        <button
                                            onClick={installUpdate}
                                            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                                        >
                                            <DownloadIcon className="w-5 h-5" />
                                            Install Update
                                        </button>
                                    )}
                                </div>
                                
                                <div className="bg-slate-700/50 p-4 rounded-lg">
                                    <h3 className="text-lg font-medium text-white mb-2">Update Information</h3>
                                    <div className="text-sm text-slate-400 space-y-2">
                                        <p>• Updates are automatically checked when the app starts</p>
                                        <p>• Manual update checking is available here and in the sidebar</p>
                                        <p>• Updates require the app to restart to complete installation</p>
                                        <p>• Update functionality is only available in the packaged desktop app</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            default: return null;
        }
    }
    
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <button
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-colors"
                >
                    Save All Settings
                </button>
            </div>
            
            <div className="border-b border-slate-700">
                <nav className="-mb-px flex flex-wrap space-x-6 sm:space-x-8" aria-label="Tabs">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none ${
                                activeTab === tab.id
                                    ? 'border-blue-500 text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                            }`}
                            aria-current={activeTab === tab.id ? 'page' : undefined}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="pt-4">
                {renderContent()}
            </div>
        </div>
    );
};
