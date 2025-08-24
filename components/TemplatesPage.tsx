

import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { TemplateOption, ProductOption, AppSettings } from '../types';

// Text casing utility functions
const toTitleCase = (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;

const getSharedInputClass = (isDarkTheme: boolean) => `w-full rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${isDarkTheme
        ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400'
        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
    }`;
const getSharedSelectClass = (isDarkTheme: boolean) => `${getSharedInputClass(isDarkTheme)} appearance-none`;
const getSharedThClass = (isDarkTheme: boolean) => `px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`;

interface TemplatesPageProps {
    templateOptions: TemplateOption[];
    setTemplateOptions: React.Dispatch<React.SetStateAction<TemplateOption[]>>;
    productOptions: ProductOption[];
    settings: AppSettings;
    isDarkTheme?: boolean;
}

const MultiSelectDropdown: React.FC<{
    options: { id: string; name: string }[];
    selectedIds: string[];
    onChange: (selectedIds: string[]) => void;
    placeholder?: string;
    isDarkTheme?: boolean;
}> = ({ options, selectedIds, onChange, placeholder = "Select options", isDarkTheme = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectClass = getSharedSelectClass(isDarkTheme);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleOptionClick = (optionId: string) => {
        const newSelectedIds = selectedIds.includes(optionId)
            ? selectedIds.filter(id => id !== optionId)
            : [...selectedIds, optionId];
        onChange(newSelectedIds);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selectedText = selectedIds.length > 0
        ? `${selectedIds.length} selected`
        : <span className={isDarkTheme ? "text-slate-400" : "text-gray-400"}>{placeholder}</span>;

    return (
        <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={handleToggle} className={`${selectClass} text-left flex justify-between items-center`}>
                <span>{selectedText}</span>
                <svg className={`w-5 h-5 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'} transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>
            {isOpen && (
                <div className={`absolute z-10 mt-1 w-full ${isDarkTheme ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border rounded-md shadow-lg max-h-60 overflow-y-auto`}>
                    <ul className="py-1">
                        {options.map(option => (
                            <li key={option.id}
                                className={`px-3 py-2 text-sm ${isDarkTheme ? 'text-white hover:bg-slate-700' : 'text-gray-900 hover:bg-gray-100'} cursor-pointer flex items-center`}
                                onClick={() => handleOptionClick(option.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(option.id)}
                                    readOnly
                                    className={`h-4 w-4 rounded ${isDarkTheme ? 'border-slate-500 bg-slate-700' : 'border-gray-300 bg-white'} text-blue-600 focus:ring-blue-500 mr-3 pointer-events-none`}
                                />
                                {option.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export const TemplatesPage: React.FC<TemplatesPageProps> = ({ templateOptions, setTemplateOptions, productOptions, settings, isDarkTheme = true }) => {
    const sharedInputClass = getSharedInputClass(isDarkTheme);
    const sharedSelectClass = getSharedSelectClass(isDarkTheme);
    const sharedThClass = getSharedThClass(isDarkTheme);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [fullnessFront, setFullnessFront] = useState(settings.defaultTemplateFullnessFront);
    const [fullnessBack, setFullnessBack] = useState(settings.defaultTemplateFullnessBack);
    const [calculationType, setCalculationType] = useState<'running-meter' | 'square-meter'>('running-meter');

    // Layer-specific defaults
    const [defaultFabricId, setDefaultFabricId] = useState<string>('none');
    const [defaultSheerId, setDefaultSheerId] = useState<string>('none');
    const [defaultLiningId, setDefaultLiningId] = useState<string>('none');
    const [defaultFrontMotorId, setDefaultFrontMotorId] = useState<string>('none');
    const [defaultBackMotorId, setDefaultBackMotorId] = useState<string>('none');
    const [defaultFrontAccessoryIds, setDefaultFrontAccessoryIds] = useState<string[]>([]);
    const [defaultBackAccessoryIds, setDefaultBackAccessoryIds] = useState<string[]>([]);

    // Stitching charges
    const [stitchingPricePerPanelFabric, setStitchingPricePerPanelFabric] = useState(0);
    const [stitchingPricePerPanelSheer, setStitchingPricePerPanelSheer] = useState(0);
    const [stitchingPricePerPanelLining, setStitchingPricePerPanelLining] = useState(0);

    // Fixing charges
    const [fixingPricePerSqM, setFixingPricePerSqM] = useState(0);

    const isEditing = editId !== null;

    const noneOption = useMemo(() => productOptions.find(p => p.id === 'none'), [productOptions]);

    const filteredOptions = useMemo(() => {
        const createOptions = (categories: string[]) => {
            const options = productOptions.filter(p => categories.includes(p.category));
            const filtered = options.filter(o => o.id !== 'none');
            return noneOption ? [noneOption, ...filtered] : options;
        }
        return {
            fabric: createOptions(['Fabric', 'Blinds', 'Sheer']),
            sheer: createOptions(['Sheer', 'Fabric']),
            lining: createOptions(['Blackout']),
            motor: createOptions(['Motor']),
            accessory: createOptions(['Accessory']),
        }
    }, [productOptions, noneOption]);


    const resetForm = () => {
        setEditId(null);
        setName('');
        setFullnessFront(settings.defaultTemplateFullnessFront);
        setFullnessBack(settings.defaultTemplateFullnessBack);
        setCalculationType('running-meter');
        setDefaultFabricId('none');
        setDefaultSheerId('none');
        setDefaultLiningId('none');
        setDefaultFrontMotorId('none');
        setDefaultBackMotorId('none');
        setDefaultFrontAccessoryIds([]);
        setDefaultBackAccessoryIds([]);
        setStitchingPricePerPanelFabric(0);
        setStitchingPricePerPanelSheer(0);
        setStitchingPricePerPanelLining(0);
        setFixingPricePerSqM(0);
    }

    const handleSave = () => {
        if (!name.trim()) {
            alert('Template name cannot be empty.');
            return;
        }

        const templateData: Omit<TemplateOption, 'id' | 'name'> & { name: string } = {
            name,
            fullnessFront,
            fullnessBack,
            calculationType,
            defaultFabricId: defaultFabricId === 'none' ? undefined : defaultFabricId,
            defaultSheerId: defaultSheerId === 'none' ? undefined : defaultSheerId,
            defaultLiningId: defaultLiningId === 'none' ? undefined : defaultLiningId,
            defaultFrontMotorId: defaultFrontMotorId === 'none' ? undefined : defaultFrontMotorId,
            defaultBackMotorId: defaultBackMotorId === 'none' ? undefined : defaultBackMotorId,
            defaultFrontAccessoryIds: defaultFrontAccessoryIds.length > 0 ? defaultFrontAccessoryIds : undefined,
            defaultBackAccessoryIds: defaultBackAccessoryIds.length > 0 ? defaultBackAccessoryIds : undefined,
            stitchingPricePerPanelFabric: stitchingPricePerPanelFabric > 0 ? stitchingPricePerPanelFabric : undefined,
            stitchingPricePerPanelSheer: stitchingPricePerPanelSheer > 0 ? stitchingPricePerPanelSheer : undefined,
            stitchingPricePerPanelLining: stitchingPricePerPanelLining > 0 ? stitchingPricePerPanelLining : undefined,
            fixingPricePerSqM: fixingPricePerSqM > 0 ? fixingPricePerSqM : undefined,
        };

        if (isEditing) {
            setTemplateOptions(prev => prev.map(tmpl => tmpl.id === editId ? { ...tmpl, ...templateData } : tmpl));
        } else {
            const newTemplate: TemplateOption = {
                id: `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                ...templateData,
            };
            setTemplateOptions(prev => [...prev.filter(t => t.id !== 'none'), newTemplate, ...prev.filter(t => t.id === 'none')]);
        }
        resetForm();
    };

    const handleEdit = (template: TemplateOption) => {
        setEditId(template.id);
        setName(template.name);
        setFullnessFront(template.fullnessFront);
        setFullnessBack(template.fullnessBack);
        setCalculationType(template.calculationType);
        setDefaultFabricId(template.defaultFabricId || 'none');
        setDefaultSheerId(template.defaultSheerId || 'none');
        setDefaultLiningId(template.defaultLiningId || 'none');
        setDefaultFrontMotorId(template.defaultFrontMotorId || 'none');
        setDefaultBackMotorId(template.defaultBackMotorId || 'none');
        setDefaultFrontAccessoryIds(template.defaultFrontAccessoryIds || []);
        setDefaultBackAccessoryIds(template.defaultBackAccessoryIds || []);
        setStitchingPricePerPanelFabric(template.stitchingPricePerPanelFabric || 0);
        setStitchingPricePerPanelSheer(template.stitchingPricePerPanelSheer || 0);
        setStitchingPricePerPanelLining(template.stitchingPricePerPanelLining || 0);
        setFixingPricePerSqM(template.fixingPricePerSqM || 0);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        if (id === 'none') {
            alert("The 'None' template cannot be deleted.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
            setTemplateOptions(prev => prev.filter(tmpl => tmpl.id !== id));
        }
    };

    return (
        <div className="space-y-8">
            <div className={`${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-slate-200/50'} shadow-2xl rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>{isEditing ? 'Edit Template' : 'Add New Template'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="templateName" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Template Name</label>
                            <input
                                id="templateName"
                                type="text"
                                value={name}
                                onChange={e => setName(toTitleCase(e.target.value))}
                                onBlur={e => setName(toTitleCase(e.target.value))}
                                onPaste={e => {
                                    setTimeout(() => {
                                        const pastedValue = e.currentTarget.value;
                                        setName(toTitleCase(pastedValue));
                                    }, 0);
                                }}
                                className={sharedInputClass}
                                placeholder="e.g., Eyelet"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="templateFullnessFront" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Fullness (Front)</label>
                            <input id="templateFullnessFront" type="number" value={fullnessFront} onChange={e => setFullnessFront(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.1" required />
                        </div>
                        <div>
                            <label htmlFor="templateFullnessBack" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Fullness (Back)</label>
                            <input id="templateFullnessBack" type="number" value={fullnessBack} onChange={e => setFullnessBack(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.1" required />
                        </div>
                        <div className="md:col-span-4">
                            <label htmlFor="calculationType" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Calculation Type</label>
                            <select id="calculationType" value={calculationType} onChange={e => setCalculationType(e.target.value as 'running-meter' | 'square-meter')} className={sharedSelectClass}>
                                <option value="running-meter">Running Meter</option>
                                <option value="square-meter">Square Meter</option>
                            </select>
                        </div>
                    </div>

                    <fieldset className={`border-t ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
                        <legend className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>Default Products (Optional)</legend>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                            <div>
                                <label htmlFor="defaultFabric" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Fabric / Blind</label>
                                <select id="defaultFabric" value={defaultFabricId} onChange={e => setDefaultFabricId(e.target.value)} className={sharedSelectClass}>
                                    {filteredOptions.fabric.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="defaultSheer" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Sheer</label>
                                <select id="defaultSheer" value={defaultSheerId} onChange={e => setDefaultSheerId(e.target.value)} className={sharedSelectClass}>
                                    {filteredOptions.sheer.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="defaultLining" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Lining (Blackout)</label>
                                <select id="defaultLining" value={defaultLiningId} onChange={e => setDefaultLiningId(e.target.value)} className={sharedSelectClass}>
                                    {filteredOptions.lining.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className={`text-xs font-semibold uppercase ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-2`}>Front Layer Motors/Accessories</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="defaultFrontMotor" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Motor</label>
                                    <select id="defaultFrontMotor" value={defaultFrontMotorId} onChange={e => setDefaultFrontMotorId(e.target.value)} className={sharedSelectClass}>
                                        {filteredOptions.motor.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Accessory</label>
                                    <MultiSelectDropdown
                                        options={filteredOptions.accessory.filter(o => o.id !== 'none')}
                                        selectedIds={defaultFrontAccessoryIds}
                                        onChange={setDefaultFrontAccessoryIds}
                                        placeholder="Select accessories..."
                                        isDarkTheme={isDarkTheme}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <h4 className={`text-xs font-semibold uppercase ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-2`}>Back Layer Motors/Accessories</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="defaultBackMotor" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Motor</label>
                                    <select id="defaultBackMotor" value={defaultBackMotorId} onChange={e => setDefaultBackMotorId(e.target.value)} className={sharedSelectClass}>
                                        {filteredOptions.motor.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Accessory</label>
                                    <MultiSelectDropdown
                                        options={filteredOptions.accessory.filter(o => o.id !== 'none')}
                                        selectedIds={defaultBackAccessoryIds}
                                        onChange={setDefaultBackAccessoryIds}
                                        placeholder="Select accessories..."
                                        isDarkTheme={isDarkTheme}
                                    />
                                </div>
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className={`border-t ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
                        <legend className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>Stitching Charges (per panel)</legend>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="stitchingFabric" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Fabric Layer</label>
                                <input id="stitchingFabric" type="number" value={stitchingPricePerPanelFabric} onChange={e => setStitchingPricePerPanelFabric(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.01" />
                            </div>
                            <div>
                                <label htmlFor="stitchingSheer" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Sheer Layer</label>
                                <input id="stitchingSheer" type="number" value={stitchingPricePerPanelSheer} onChange={e => setStitchingPricePerPanelSheer(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.01" />
                            </div>
                            <div>
                                <label htmlFor="stitchingLining" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Lining Layer</label>
                                <input id="stitchingLining" type="number" value={stitchingPricePerPanelLining} onChange={e => setStitchingPricePerPanelLining(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.01" />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className={`border-t ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'} pt-4`}>
                        <legend className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-2`}>Fixing / Installation Charge (per sq. meter)</legend>
                        <div className="max-w-xs">
                            <label htmlFor="fixingCharge" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-1`}>Charge Amount</label>
                            <input id="fixingCharge" type="number" value={fixingPricePerSqM} onChange={e => setFixingPricePerSqM(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.01" />
                        </div>
                    </fieldset>

                    <div className="flex gap-2 pt-4">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            {isEditing ? 'Update Template' : 'Add Template'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className={`w-full px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 transition-colors ${isDarkTheme ? 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-400' : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400'}`}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className={isDarkTheme ? 'bg-slate-800/50' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className={sharedThClass}>Name</th>
                                <th scope="col" className={sharedThClass}>Fullness (Front)</th>
                                <th scope="col" className={sharedThClass}>Fullness (Back)</th>
                                <th scope="col" className={sharedThClass}>Calc. Type</th>
                                <th scope="col" className={sharedThClass}>Stitching/Panel (Fabric)</th>
                                <th scope="col" className={sharedThClass}>Fixing/Sq. M.</th>
                                <th scope="col" className={`${sharedThClass} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`${isDarkTheme ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'} divide-y`}>
                            {templateOptions.filter(t => t.id !== 'none').map(template => (
                                <tr key={template.id} className={isDarkTheme ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{template.name}</td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>{template.fullnessFront.toFixed(2)}x</td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>{template.fullnessBack.toFixed(2)}x</td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} capitalize`}>
                                        {template.calculationType.replace('-', ' ')}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                                        {template.stitchingPricePerPanelFabric ? template.stitchingPricePerPanelFabric.toLocaleString('en-US', { style: 'currency', currency: 'BHD' }) : <span className={isDarkTheme ? 'text-slate-500' : 'text-gray-400'}>N/A</span>}
                                    </td>
                                    <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                                        {template.fixingPricePerSqM ? template.fixingPricePerSqM.toLocaleString('en-US', { style: 'currency', currency: 'BHD' }) : <span className={isDarkTheme ? 'text-slate-500' : 'text-gray-400'}>N/A</span>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                                        <button onClick={() => handleEdit(template)} className={`${isDarkTheme ? 'text-slate-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'} transition-colors p-1`} aria-label="Edit"><EditIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(template.id)} className={`${isDarkTheme ? 'text-slate-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors p-1`} aria-label="Delete"><TrashIcon className="w-5 h-5" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};