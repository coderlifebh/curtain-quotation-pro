import React, { useState, useMemo, useEffect } from 'react';
import type { ProductOption, ProductCategory, ProductUnit } from '../types';
import { PRODUCT_CATEGORIES, PRODUCT_UNITS } from '../constants';

// Make TypeScript aware of the XLSX library loaded from CDN
declare var XLSX: any;

// Text casing utility function
const toTitleCase = (str: string): string => {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;


interface ProductsPageProps {
    productOptions: ProductOption[];
    setProductOptions: React.Dispatch<React.SetStateAction<ProductOption[]>>;
    isDarkTheme?: boolean;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ productOptions, setProductOptions, isDarkTheme = true }) => {
    // Define dynamic styles based on theme
    const sharedInputClass = `w-full border rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${isDarkTheme
        ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        }`;
    const sharedSelectClass = `${sharedInputClass} appearance-none`;
    const sharedThClass = `px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`;

    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [discountPrice, setDiscountPrice] = useState(0);
    const [category, setCategory] = useState<ProductCategory>('Fabric');
    const [unit, setUnit] = useState<ProductUnit>('per-meter');
    const [fabricWidth, setFabricWidth] = useState(1.4);
    const [activeCategory, setActiveCategory] = useState<ProductCategory>(PRODUCT_CATEGORIES[0]);

    const isEditing = editId !== null;
    const isFabricCategory = useMemo(() => ['Fabric', 'Sheer', 'Blackout'].includes(category), [category]);

    useEffect(() => {
        // When the active tab changes, update the category dropdown in the form
        // but only if the user is not currently editing an existing product.
        if (!isEditing) {
            setCategory(activeCategory);
        }
    }, [activeCategory, isEditing]);


    const resetForm = () => {
        setEditId(null);
        setName('');
        setPrice(0);
        setDiscountPrice(0);
        setCategory(activeCategory); // Reset to the current active tab
        setUnit('per-meter');
        setFabricWidth(1.4);
    }

    const handleSave = () => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            alert('Product name cannot be empty.');
            return;
        }

        const productData = {
            name: toTitleCase(trimmedName),
            price,
            discountPrice: discountPrice > 0 ? discountPrice : undefined,
            category,
            unit,
            fabricWidth: isFabricCategory ? fabricWidth : undefined,
        };

        if (isEditing) {
            setProductOptions(prev => prev.map(p => p.id === editId ? { ...p, ...productData } : p));
        } else {
            const newProduct: ProductOption = {
                id: `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                ...productData
            };
            setProductOptions(prev => [...prev, newProduct]);
        }
        resetForm();
    };

    const handleEdit = (product: ProductOption) => {
        setActiveCategory(product.category); // Switch tab to the product's category
        setEditId(product.id);
        setName(product.name);
        setPrice(product.price);
        setDiscountPrice(product.discountPrice || 0);
        setCategory(product.category);
        setUnit(product.unit);
        setFabricWidth(product.fabricWidth || 1.4);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (id: string) => {
        if (id === 'none') {
            alert("The 'None' option cannot be deleted as it is essential for the application's logic.");
            return;
        }
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            setProductOptions(prev => prev.filter(p => p.id !== id));
        }
    };

    const visibleProducts = useMemo(() => {
        return productOptions.filter(p => p.category === activeCategory && p.id !== 'none').sort((a, b) => a.name.localeCompare(b.name));
    }, [productOptions, activeCategory]);

    const handleDownloadSample = () => {
        const sampleData = [
            {
                'Name': 'Example Velvet',
                'Price': 25.50,
                'Discount Price': 22.00,
                'Category': 'Fabric', // Must be one of: Fabric, Sheer, Blackout, Motor, Blinds, Accessory
                'Unit': 'per-meter', // Must be one of: per-meter, per-sq-meter, per-item
                'Fabric Width': 1.4 // Only for Fabric, Sheer, Blackout
            },
            {
                'Name': 'Example Roller Blind',
                'Price': 45.00,
                'Discount Price': 0,
                'Category': 'Blinds',
                'Unit': 'per-sq-meter',
                'Fabric Width': null
            }
        ];
        const worksheet = XLSX.utils.json_to_sheet(sampleData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');
        XLSX.writeFile(workbook, 'Product_Import_Sample.xlsx');
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: any[] = XLSX.utils.sheet_to_json(worksheet);

                const newProducts: ProductOption[] = [];
                const errors: string[] = [];
                const duplicates: string[] = [];

                json.forEach((row, index) => {
                    const { Name, Price, Category, Unit } = row;
                    if (!Name || Price === undefined || !Category || !Unit) {
                        errors.push(`Row ${index + 2}: Missing required fields (Name, Price, Category, Unit).`);
                        return;
                    }

                    // Check for duplicate product names (case-insensitive)
                    const trimmedName = String(Name).trim();
                    const existingProduct = productOptions.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
                    if (existingProduct) {
                        duplicates.push(`Row ${index + 2}: Product "${trimmedName}" already exists. Skipping duplicate.`);
                        return;
                    }

                    // Also check for duplicates within the current import batch
                    const duplicateInBatch = newProducts.find(p => p.name.toLowerCase() === trimmedName.toLowerCase());
                    if (duplicateInBatch) {
                        duplicates.push(`Row ${index + 2}: Product "${trimmedName}" appears multiple times in this import. Skipping duplicate.`);
                        return;
                    }

                    const validCategory = PRODUCT_CATEGORIES.find(c => c.toLowerCase() === String(Category).toLowerCase().trim());
                    const validUnit = PRODUCT_UNITS.find(u => u.toLowerCase() === String(Unit).toLowerCase().trim());

                    if (!validCategory) {
                        errors.push(`Row ${index + 2}: Invalid Category "${Category}". Must be one of: ${PRODUCT_CATEGORIES.join(', ')}.`);
                        return;
                    }
                    if (!validUnit) {
                        errors.push(`Row ${index + 2}: Invalid Unit "${Unit}". Must be one of: ${PRODUCT_UNITS.join(', ')}.`);
                        return;
                    }
                    if (isNaN(parseFloat(Price))) {
                        errors.push(`Row ${index + 2}: Price "${Price}" is not a valid number.`);
                        return;
                    }

                    const discountPrice = row['Discount Price'] ? parseFloat(row['Discount Price']) : undefined;
                    if (discountPrice !== undefined && isNaN(discountPrice)) {
                        errors.push(`Row ${index + 2}: Discount Price "${row['Discount Price']}" is not a valid number.`);
                        return;
                    }

                    const fabricWidth = row['Fabric Width'] ? parseFloat(row['Fabric Width']) : undefined;
                    if (fabricWidth !== undefined && isNaN(fabricWidth)) {
                        errors.push(`Row ${index + 2}: Fabric Width "${row['Fabric Width']}" is not a valid number.`);
                        return;
                    }

                    const isFabricLike = ['Fabric', 'Sheer', 'Blackout'].includes(validCategory);

                    const newProduct: ProductOption = {
                        id: `product-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${index}`,
                        name: String(Name).trim(),
                        price: parseFloat(Price),
                        discountPrice: discountPrice && discountPrice > 0 ? discountPrice : undefined,
                        category: validCategory,
                        unit: validUnit,
                        fabricWidth: isFabricLike ? (fabricWidth || 1.4) : undefined,
                    };
                    newProducts.push(newProduct);
                });

                if (errors.length > 0) {
                    alert(`Import failed with the following errors:\n\n${errors.join('\n')}`);
                } else {
                    let message = '';
                    if (newProducts.length > 0) {
                        setProductOptions(prev => [...prev, ...newProducts]);
                        message = `${newProducts.length} product(s) imported successfully!`;
                    } else {
                        message = 'No new products were imported.';
                    }

                    if (duplicates.length > 0) {
                        message += `\n\nDuplicates skipped (${duplicates.length}):\n${duplicates.join('\n')}`;
                    }

                    alert(message);
                }

            } catch (error) {
                console.error("Error parsing Excel file:", error);
                alert('There was an error processing the file. Please ensure it is a valid Excel file and matches the sample format.');
            } finally {
                event.target.value = ''; // Reset file input
            }
        };
        reader.readAsArrayBuffer(file);
    };


    return (
        <div className="space-y-8">
            <div className={`${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-slate-200/50'} shadow-2xl rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 lg:col-span-3">
                        <label htmlFor="productName" className="block text-sm font-medium text-slate-300 mb-1">Product Name</label>
                        <input
                            id="productName"
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
                            placeholder="e.g., Sheer Voile"
                            required />
                    </div>
                    <div>
                        <label htmlFor="productCategory" className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                        <select id="productCategory" value={category} onChange={e => setCategory(e.target.value as ProductCategory)} className={sharedSelectClass}>
                            {PRODUCT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="productUnit" className="block text-sm font-medium text-slate-300 mb-1">Unit</label>
                        <select id="productUnit" value={unit} onChange={e => setUnit(e.target.value as ProductUnit)} className={sharedSelectClass}>
                            {PRODUCT_UNITS.map(u => <option key={u} value={u}>{u.replace('-', ' ')}</option>)}
                        </select>
                    </div>
                    {isFabricCategory && (
                        <div>
                            <label htmlFor="fabricWidth" className="block text-sm font-medium text-slate-300 mb-1">Fabric Width (m)</label>
                            <input id="fabricWidth" type="number" value={fabricWidth} onChange={e => setFabricWidth(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.1" required />
                        </div>
                    )}
                    <div>
                        <label htmlFor="productPrice" className="block text-sm font-medium text-slate-300 mb-1">Price</label>
                        <input id="productPrice" type="number" value={price} onChange={e => setPrice(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.01" required />
                    </div>
                    <div>
                        <label htmlFor="productDiscountPrice" className="block text-sm font-medium text-slate-300 mb-1">Discount Price</label>
                        <input id="productDiscountPrice" type="number" value={discountPrice} onChange={e => setDiscountPrice(Number(e.target.value) || 0)} className={sharedInputClass} min="0" step="0.01" />
                    </div>

                    <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-3">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            {isEditing ? 'Update Product' : 'Add Product'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className="w-full px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors">
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className={`${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-slate-200/50'} shadow-2xl rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>Bulk Import</h2>
                <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-600'} mb-6`}>
                    Quickly add multiple products by uploading an Excel file. Make sure the file format matches the sample.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={handleDownloadSample}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download Sample
                    </button>
                    <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors">
                        <UploadIcon className="w-5 h-5" />
                        Import From Excel
                        <input
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileImport}
                        />
                    </label>
                </div>
            </div>

            <div className={`${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-slate-200/50'} shadow-2xl rounded-lg`}>
                <div className={`border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
                    <nav className="-mb-px flex gap-x-6 px-6" aria-label="Tabs">
                        {PRODUCT_CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`${activeCategory === cat
                                        ? 'border-blue-500 text-blue-500'
                                        : isDarkTheme
                                            ? 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                                aria-current={activeCategory === cat ? 'page' : undefined}
                            >
                                {cat}
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className={isDarkTheme ? 'bg-slate-800/50' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className={sharedThClass}>Name</th>
                                <th scope="col" className={sharedThClass}>Unit</th>
                                <th scope="col" className={sharedThClass}>Fabric Width</th>
                                <th scope="col" className={sharedThClass}>Price</th>
                                <th scope="col" className={`${sharedThClass} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`${isDarkTheme ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'} divide-y`}>
                            {visibleProducts.length > 0 ? (
                                visibleProducts.map(product => (
                                    <tr key={product.id} className={isDarkTheme ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{product.name}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} capitalize`}>{product.unit.replace('-', ' ')}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                                            {product.fabricWidth ? `${product.fabricWidth.toFixed(2)}m` : <span className={isDarkTheme ? 'text-slate-500' : 'text-gray-400'}>-</span>}
                                        </td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>
                                            {product.discountPrice && product.discountPrice > 0 ? (
                                                <>
                                                    <span className={`line-through mr-2 ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`}>
                                                        {product.price.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}
                                                    </span>
                                                    <span className="font-semibold text-green-500">
                                                        {product.discountPrice.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}
                                                    </span>
                                                </>
                                            ) : (
                                                product.price.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                                            <button onClick={() => handleEdit(product)} className={`${isDarkTheme ? 'text-slate-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'} transition-colors p-1`} aria-label="Edit"><EditIcon className="w-5 h-5" /></button>

                                            <button onClick={() => handleDelete(product.id)} className={`${isDarkTheme ? 'text-slate-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors p-1`} aria-label="Delete"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className={`text-center py-10 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                                        No products found in the "{activeCategory}" category.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};