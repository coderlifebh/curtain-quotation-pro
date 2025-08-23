
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import type { QuotationItem, TemplateOption, ProductOption, SelectOption } from '../types';

interface QuotationTableProps {
    items: QuotationItem[];
    onItemChange: (id: string, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => void;
    onRemoveItem: (id: string) => void;
    onCopyItem: (id: string) => void;
    onReorderItems: (dragIndex: number, hoverIndex: number) => void;
    calculateAmount: (item: QuotationItem) => number;
    templateOptions: TemplateOption[];
    productOptions: ProductOption[];
    setActivePage: (page: string) => void;
    roomOptions: SelectOption[];
    onAddRoomOption: (newRoomName: string) => void;
    columnWidths: number[];
    onColumnWidthsChange: (newWidths: number[]) => void;
}

const TrashIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);

const CopyIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
);

const LinkIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.596a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
);

const DragHandleIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
);


// Text casing utility functions
const toProperCase = (str: string): string => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const sharedInputClass = "w-full bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-white text-sm";
const sharedSelectClass = `${sharedInputClass} appearance-none`;
const sharedNumericInputClass = `${sharedInputClass} text-right`;
const sharedThClass = "px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider select-none";

const SelectInput: React.FC<{
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: {id: string, name: string}[];
}> = ({ value, onChange, options }) => (
    <select value={value} onChange={onChange} className={sharedSelectClass}>
        {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
    </select>
);

const Resizer: React.FC<{ onMouseDown: (e: React.MouseEvent) => void }> = ({ onMouseDown }) => (
    <div
        className="resizer"
        onMouseDown={onMouseDown}
    />
);

const EditableDatalistInput: React.FC<{
    value: string;
    onChange: (newValue: string) => void;
    onAddOption: (newOption: string) => void;
    options: { id: string; name: string }[];
    listId: string;
}> = ({ value, onChange, onAddOption, options, listId }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleBlur = () => {
        const formattedValue = toProperCase(inputValue); // Apply proper case
        if (options.some(opt => opt.name === formattedValue)) {
            onChange(formattedValue);
        } else if (formattedValue.trim()) {
            onAddOption(formattedValue);
            onChange(formattedValue);
        } else if (formattedValue) {
            onChange(''); // Clear the value if input is cleared
        }
    };    return (
        <>
            <input
                list={listId}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleBlur}
                className={sharedInputClass}
                placeholder="Type or select a room"
            />
            <datalist id={listId}>
                {options.map(opt => <option key={opt.id} value={opt.name} />)}
            </datalist>
        </>
    );
};


export const QuotationTable: React.FC<QuotationTableProps> = ({
    items, onItemChange, onRemoveItem, onCopyItem, onReorderItems,
    calculateAmount, templateOptions, productOptions, setActivePage,
    roomOptions, onAddRoomOption, columnWidths, onColumnWidthsChange
}) => {
    
    // Local state for rendering performance during resize, synced with props
    const [currentWidths, setCurrentWidths] = useState(columnWidths);
    const widthsRef = useRef(columnWidths);

    useEffect(() => {
        setCurrentWidths(columnWidths);
        widthsRef.current = columnWidths;
    }, [columnWidths]);
    
    const resizingRef = useRef<{ index: number; startX: number; startWidth: number; } | null>(null);
    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!resizingRef.current) return;
        const { index, startX, startWidth } = resizingRef.current;
        const dx = e.clientX - startX;
        const newWidth = startWidth + dx;
        
        if (newWidth >= 40) { // min width
            setCurrentWidths(prev => {
                const newWidths = [...prev];
                newWidths[index] = newWidth;
                widthsRef.current = newWidths; // Also update ref for use in mouseUp
                return newWidths;
            });
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        if (resizingRef.current) {
            onColumnWidthsChange(widthsRef.current);
        }
        resizingRef.current = null;
        document.body.classList.remove('resizing');
    }, [handleMouseMove, onColumnWidthsChange]);

    const handleMouseDown = useCallback((index: number) => (e: React.MouseEvent) => {
        e.preventDefault();
        resizingRef.current = {
            index,
            startX: e.clientX,
            startWidth: currentWidths[index],
        };
        document.body.classList.add('resizing');
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [currentWidths, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        // Cleanup function
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        dragItem.current = index;
        e.currentTarget.classList.add('dragging-row');
        document.body.classList.add('grabbing');
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        if (dragItem.current !== index) {
            dragOverItem.current = index;
            onReorderItems(dragItem.current!, dragOverItem.current!);
            dragItem.current = index;
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        dragItem.current = null;
        dragOverItem.current = null;
        e.currentTarget.classList.remove('dragging-row');
        document.body.classList.remove('grabbing');
    };

    const handleNumericChange = <T extends keyof Omit<QuotationItem, 'id'>>(id: string, field: T, value: string) => {
        onItemChange(id, field, Number(value) || 0);
    };

    const noneOption = useMemo(() => productOptions.find(p => p.id === 'none'), [productOptions]);

    const filteredOptions = useMemo(() => {
        const createOptions = (categories: string[]) => {
            const options = productOptions.filter(p => categories.includes(p.category));
            // Ensure 'None' option is always at the top if it exists
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

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 table-fixed">
                 <colgroup>
                    {currentWidths.map((width, index) => (
                        <col key={index} style={{ width: `${width}px` }} />
                    ))}
                </colgroup>
                <thead className="bg-slate-800/50">
                    <tr>
                        <th scope="col" className={`${sharedThClass} text-center`}>SL.<Resizer onMouseDown={handleMouseDown(0)} /></th>
                        <th scope="col" className={`${sharedThClass}`}>Room<Resizer onMouseDown={handleMouseDown(1)} /></th>
                        <th scope="col" className={`${sharedThClass}`}>Width (cm)<Resizer onMouseDown={handleMouseDown(2)} /></th>
                        <th scope="col" className={`${sharedThClass}`}>Height (cm)<Resizer onMouseDown={handleMouseDown(3)} /></th>
                        
                        <th scope="col" className={`${sharedThClass} border-l border-slate-700`}>
                             <div className="flex items-center gap-2">
                                <span>Template</span>
                                <button onClick={() => setActivePage('templates')} className="text-slate-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full p-0.5" aria-label="Go to templates page">
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <Resizer onMouseDown={handleMouseDown(4)} />
                        </th>
                        <th scope="col" className={`${sharedThClass}`}>Fullness (F)<Resizer onMouseDown={handleMouseDown(5)} /></th>
                        <th scope="col" className={`${sharedThClass}`}>Fullness (B)<Resizer onMouseDown={handleMouseDown(6)} /></th>
                         <th scope="col" className={`${sharedThClass} border-l border-slate-700`}>
                             <div className="flex items-center gap-2">
                                <span>Fabric / Blind</span>
                                <button onClick={() => setActivePage('products')} className="text-slate-400 hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 rounded-full p-0.5" aria-label="Go to products page">
                                    <LinkIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <Resizer onMouseDown={handleMouseDown(7)} />
                        </th>
                        <th scope="col" className={`${sharedThClass}`}>Sheer<Resizer onMouseDown={handleMouseDown(8)} /></th>
                        <th scope="col" className={`${sharedThClass}`}>Lining (Blackout)<Resizer onMouseDown={handleMouseDown(9)} /></th>

                        <th scope="col" className={`${sharedThClass} border-l border-slate-700`}>Front Motor<Resizer onMouseDown={handleMouseDown(10)} /></th>
                        <th scope="col" className={`${sharedThClass}`}>Back Motor<Resizer onMouseDown={handleMouseDown(11)} /></th>

                        <th scope="col" className={`${sharedThClass} border-l border-slate-700`}>Qty<Resizer onMouseDown={handleMouseDown(12)} /></th>
                        <th scope="col" className={`${sharedThClass} text-right`}>Amount<Resizer onMouseDown={handleMouseDown(13)} /></th>
                        <th scope="col" className="relative px-4 py-3"><span className="sr-only">Actions</span><Resizer onMouseDown={handleMouseDown(14)} /></th>
                    </tr>
                </thead>
                <tbody className="bg-slate-800 divide-y divide-slate-700">
                    {items.map((item, index) => (
                        <tr 
                            key={item.id} 
                            className="hover:bg-slate-700/40 transition-colors"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnter={(e) => handleDragEnter(e, index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <td className="px-4 py-2 text-center text-sm text-slate-400">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="drag-handle" title="Drag to reorder">
                                        <DragHandleIcon className="w-4 h-4" />
                                    </span>
                                    <span>{index + 1}</span>
                                </div>
                            </td>
                            <td className="px-4 py-2">
                                <EditableDatalistInput
                                    value={item.room}
                                    onChange={(newValue) => onItemChange(item.id, 'room', newValue)}
                                    onAddOption={onAddRoomOption}
                                    options={roomOptions}
                                    listId={`room-options-${item.id}`}
                                />
                            </td>
                            <td className="px-4 py-2"><input type="number" value={item.width} onChange={(e) => handleNumericChange(item.id, 'width', e.target.value)} className={sharedNumericInputClass} min="0" /></td>
                            <td className="px-4 py-2"><input type="number" value={item.height} onChange={(e) => handleNumericChange(item.id, 'height', e.target.value)} className={sharedNumericInputClass} min="0" /></td>
                            
                            {/* Unified Layer */}
                            <td className="px-4 py-2 border-l border-slate-700"><SelectInput value={item.templateId} onChange={(e) => onItemChange(item.id, 'templateId', e.target.value)} options={templateOptions} /></td>
                            <td className="px-4 py-2"><input type="number" value={item.fullnessFront} onChange={(e) => handleNumericChange(item.id, 'fullnessFront', e.target.value)} className={sharedNumericInputClass} min="0" step="0.1" /></td>
                            <td className="px-4 py-2"><input type="number" value={item.fullnessBack} onChange={(e) => handleNumericChange(item.id, 'fullnessBack', e.target.value)} className={sharedNumericInputClass} min="0" step="0.1" /></td>

                            <td className="px-4 py-2 border-l border-slate-700"><SelectInput value={item.fabricId} onChange={(e) => onItemChange(item.id, 'fabricId', e.target.value)} options={filteredOptions.fabric} /></td>
                            <td className="px-4 py-2"><SelectInput value={item.sheerId} onChange={(e) => onItemChange(item.id, 'sheerId', e.target.value)} options={filteredOptions.sheer} /></td>
                            <td className="px-4 py-2"><SelectInput value={item.liningId} onChange={(e) => onItemChange(item.id, 'liningId', e.target.value)} options={filteredOptions.lining} /></td>
                            
                            {/* Motors & Accessories */}
                            <td className="px-4 py-2 border-l border-slate-700"><SelectInput value={item.frontMotorId} onChange={(e) => onItemChange(item.id, 'frontMotorId', e.target.value)} options={filteredOptions.motor} /></td>
                            <td className="px-4 py-2"><SelectInput value={item.backMotorId} onChange={(e) => onItemChange(item.id, 'backMotorId', e.target.value)} options={filteredOptions.motor} /></td>

                            {/* Totals */}
                            <td className="px-4 py-2 border-l border-slate-700"><input type="number" value={item.quantity} onChange={(e) => handleNumericChange(item.id, 'quantity', e.target.value)} className={sharedNumericInputClass} min="1" step="1" /></td>
                            <td className="px-4 py-2 text-right text-sm font-semibold text-green-300">
                                {calculateAmount(item).toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}
                            </td>
                            <td className="px-4 py-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    <button onClick={() => onCopyItem(item.id)} className="text-slate-500 hover:text-blue-400 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/50" title="Copy Item">
                                        <CopyIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => onRemoveItem(item.id)} className="text-slate-500 hover:text-red-500 transition-colors p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500/50" title="Remove Item">
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};