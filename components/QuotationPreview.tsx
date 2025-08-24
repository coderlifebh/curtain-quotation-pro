
import React, { useMemo, useState, useRef, useCallback } from 'react';
import type { QuotationItem, TemplateOption, ProductOption, SavedQuotation, AppSettings } from '../types';

// Declarations for CDN libraries
declare const html2canvas: any;
declare const jspdf: any;

const PrintIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

interface QuotationPreviewProps {
    quotation: SavedQuotation;
    calculateAmount: (item: QuotationItem) => number;
    calculateActualAmount: (item: QuotationItem) => number;
    productOptions: ProductOption[];
    templateOptions: TemplateOption[];
    settings: AppSettings;
    onClose: () => void;
}

export const QuotationPreview: React.FC<QuotationPreviewProps> = ({
    quotation, calculateAmount, calculateActualAmount, productOptions, templateOptions, settings, onClose
}) => {
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [columnWidths, setColumnWidths] = useState([40, 15, 25, 8, 12]); // Percentages for each column
    const [isResizing, setIsResizing] = useState(false);
    const [resizingColumn, setResizingColumn] = useState<number | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const startXRef = useRef<number>(0);
    const startWidthsRef = useRef<number[]>([]);

    const handleMouseDown = useCallback((e: React.MouseEvent, columnIndex: number) => {
        e.preventDefault();
        setIsResizing(true);
        setResizingColumn(columnIndex);
        startXRef.current = e.clientX;
        startWidthsRef.current = [...columnWidths];
    }, [columnWidths]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing || resizingColumn === null || !tableRef.current) return;

        const deltaX = e.clientX - startXRef.current;
        const tableWidth = tableRef.current.offsetWidth;
        const deltaPercent = (deltaX / tableWidth) * 100;

        const newWidths = [...startWidthsRef.current];

        // Adjust current column and next column
        if (resizingColumn < newWidths.length - 1) {
            const minWidth = 5; // Minimum 5% width
            const maxDelta = Math.min(
                newWidths[resizingColumn + 1] - minWidth,
                100 - newWidths[resizingColumn] - minWidth
            );
            const clampedDelta = Math.max(-newWidths[resizingColumn] + minWidth, Math.min(deltaPercent, maxDelta));

            newWidths[resizingColumn] += clampedDelta;
            newWidths[resizingColumn + 1] -= clampedDelta;

            setColumnWidths(newWidths);
        }
    }, [isResizing, resizingColumn]);

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        setResizingColumn(null);
    }, []);

    // Set up event listeners when resizing starts
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isResizing, handleMouseMove, handleMouseUp]);

    const {
        items, clientDetails, taxPercent,
        quotationNumber, quotationDate, name: quotationName
    } = quotation;

    const { companyDetails, termsAndConditions, scopeOfWork, paymentTerms } = settings;

    const processedTermsAndConditions = useMemo(() => {
        const totalWindows = items.reduce((sum, item) => sum + item.quantity, 0);

        const tier = settings.deliveryEstimateTiers.find(t =>
            totalWindows >= t.minWindows && totalWindows <= t.maxWindows
        );

        const deliveryEstimate = tier ? tier.timeframe : 'Contact for details';

        return termsAndConditions.replace('{delivery_estimate}', deliveryEstimate);
    }, [items, termsAndConditions, settings.deliveryEstimateTiers]);

    const { subtotal, discountAmount, taxAmount, grandTotal } = useMemo(() => {
        // Calculate subtotal using actual prices (same as App.tsx logic)
        const actualTotal = items.reduce((acc, item) => acc + calculateActualAmount(item), 0);

        // Calculate discount based on saved quotation's discount type and amount
        let discount = 0;
        if (quotation.discountType === 'fixed' && quotation.discountAmount !== undefined) {
            discount = Math.min(quotation.discountAmount, actualTotal); // Can't discount more than total
        } else {
            // Default to percentage discount (or if discountType is 'percentage')
            discount = (actualTotal * quotation.discountPercent) / 100;
        }

        const subAfterDiscount = actualTotal - discount;
        const tax = (subAfterDiscount * taxPercent) / 100;
        const totalBeforeRound = subAfterDiscount + tax;
        const finalTotal = Math.round(totalBeforeRound);

        return {
            subtotal: actualTotal,
            discountAmount: discount,
            taxAmount: tax,
            grandTotal: finalTotal,
        };
    }, [items, taxPercent, quotation.discountPercent, quotation.discountAmount, quotation.discountType, calculateActualAmount]);

    // Helper to find names from IDs
    const getProductName = (id: string) => productOptions.find(p => p.id === id)?.name || null;
    const getTemplateName = (id: string) => templateOptions.find(t => t.id === id)?.name || 'N/A';

    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'BHD', minimumFractionDigits: 3, maximumFractionDigits: 3 });

    const handleDownloadPdf = async () => {
        const input = document.getElementById('printable-area');
        if (!input) return;

        setIsGeneratingPdf(true);

        try {
            const canvas = await html2canvas(input, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;

            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pageHeight = pdf.internal.pageSize.getHeight();
            const pageWidth = pdf.internal.pageSize.getWidth();
            const margin = 10;
            const usableHeight = pageHeight - margin * 2;
            const usableWidth = pageWidth - margin * 2;

            const imgHeight = (canvas.height * usableWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', margin, margin, usableWidth, imgHeight);
            heightLeft -= usableHeight;

            while (heightLeft > 0) {
                position -= usableHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, position + margin, usableWidth, imgHeight);
                heightLeft -= usableHeight;
            }

            pdf.save(`Quotation-${quotation.quotationNumber}.pdf`);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("An error occurred while generating the PDF. Please try again.");
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <div className="preview-modal-container">
            <style>{`
                .resize-handle {
                    position: absolute;
                    top: 0;
                    right: -4px;
                    width: 8px;
                    height: 100%;
                    cursor: col-resize;
                    z-index: 10;
                    background-color: transparent;
                    border-right: 2px solid transparent;
                    transition: all 0.2s ease;
                }
                
                .resize-handle:hover {
                    background-color: rgba(59, 130, 246, 0.3);
                    border-right-color: rgba(59, 130, 246, 0.8);
                }
                
                .resizing {
                    user-select: none;
                    cursor: col-resize;
                }
                
                .resizing * {
                    user-select: none !important;
                }
                
                @media print {
                    .resize-handle {
                        display: none !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div className="preview-modal-overlay" onClick={onClose}></div>
            <div className={`preview-modal-content ${isResizing ? 'resizing' : ''}`}>
                <header className="no-print flex justify-between items-center mb-4 pb-4 border-b">
                    <h2 className="text-xl font-bold">Quotation Preview</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setColumnWidths([40, 15, 25, 8, 12])}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors text-sm"
                        >
                            Reset Columns
                        </button>
                        <button
                            onClick={handleDownloadPdf}
                            disabled={isGeneratingPdf}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                        </button>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                            <PrintIcon className="w-5 h-5" />
                            Print
                        </button>
                        <button onClick={onClose} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors">
                            <CloseIcon className="w-5 h-5" />
                            Close
                        </button>
                    </div>
                </header>

                <div className="text-black bg-white font-sans text-sm p-4 sm:p-8 md:p-10" id="printable-area" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {/* Prestige Header */}
                    <header className="flex justify-between items-start pb-8 border-b-2 border-slate-800">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800">{companyDetails.name}</h1>
                            <p className="text-slate-500 mt-1">{companyDetails.address}</p>
                            <p className="text-slate-500">{companyDetails.phone}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-slate-400 tracking-widest uppercase">Quotation</h2>
                            <p className="text-slate-500 mt-1">
                                <span className="font-semibold text-slate-600">Quotation #:</span> {quotationNumber}
                            </p>
                            <p className="text-slate-500">
                                <span className="font-semibold text-slate-600">Date:</span> {new Date(quotationDate + 'T00:00:00').toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </header>

                    {/* Client Details */}
                    <section className="mt-8">
                        <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Prepared For</h3>
                        <div className="mt-2 text-slate-800">
                            <p className="text-lg font-bold">{clientDetails.name}</p>
                            <p className="text-slate-600">{clientDetails.address}</p>
                            <p className="text-slate-600">{clientDetails.phone}</p>
                        </div>
                    </section>

                    {/* Items Table Section */}
                    <section className="mt-10">
                        <div className="overflow-x-auto">
                            <table ref={tableRef} className="w-full border-collapse">
                                <colgroup>
                                    <col style={{ width: `${columnWidths[0]}%` }} />
                                    <col style={{ width: `${columnWidths[1]}%` }} />
                                    <col style={{ width: `${columnWidths[2]}%` }} />
                                    <col style={{ width: `${columnWidths[3]}%` }} />
                                    <col style={{ width: `${columnWidths[4]}%` }} />
                                </colgroup>
                                <thead>
                                    <tr className="bg-slate-800 text-white">
                                        <th className="border border-slate-300 px-3 py-3 text-left text-sm font-semibold relative">
                                            Item Details
                                            <div
                                                className="resize-handle no-print"
                                                onMouseDown={(e) => handleMouseDown(e, 0)}
                                                title="Drag to resize column"
                                            >
                                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-gray-400 opacity-50"></div>
                                            </div>
                                        </th>
                                        <th className="border border-slate-300 px-3 py-3 text-center text-sm font-semibold relative">
                                            Dimensions
                                            <div
                                                className="resize-handle no-print"
                                                onMouseDown={(e) => handleMouseDown(e, 1)}
                                                title="Drag to resize column"
                                            >
                                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-gray-400 opacity-50"></div>
                                            </div>
                                        </th>
                                        <th className="border border-slate-300 px-3 py-3 text-center text-sm font-semibold relative">
                                            Materials
                                            <div
                                                className="resize-handle no-print"
                                                onMouseDown={(e) => handleMouseDown(e, 2)}
                                                title="Drag to resize column"
                                            >
                                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-gray-400 opacity-50"></div>
                                            </div>
                                        </th>
                                        <th className="border border-slate-300 px-3 py-3 text-center text-sm font-semibold relative">
                                            Qty
                                            <div
                                                className="resize-handle no-print"
                                                onMouseDown={(e) => handleMouseDown(e, 3)}
                                                title="Drag to resize column"
                                            >
                                                <div className="absolute right-1 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-gray-400 opacity-50"></div>
                                            </div>
                                        </th>
                                        <th className="border border-slate-300 px-3 py-3 text-right text-sm font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const fabricName = getProductName(item.fabricId);
                                        const sheerName = getProductName(item.sheerId);
                                        const liningName = getProductName(item.liningId);
                                        const frontMotorName = getProductName(item.frontMotorId);
                                        const backMotorName = getProductName(item.backMotorId);

                                        return (
                                            <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                                {/* Item Details Column */}
                                                <td className="border border-slate-300 px-3 py-4 align-top">
                                                    <div>
                                                        <h4 className="font-bold text-slate-800 text-sm">
                                                            Item {index + 1}: {item.room || `Window ${index + 1}`}
                                                        </h4>
                                                        <p className="text-slate-600 text-xs mt-1">{getTemplateName(item.templateId)}</p>
                                                    </div>
                                                </td>

                                                {/* Dimensions Column */}
                                                <td className="border border-slate-300 px-3 py-4 text-center align-top">
                                                    <div className="text-sm">
                                                        <div className="font-semibold text-slate-800">{item.width} × {item.height}</div>
                                                        <div className="text-xs text-slate-600">cm (W × H)</div>
                                                    </div>
                                                </td>

                                                {/* Materials & Motors Column */}
                                                <td className="border border-slate-300 px-3 py-4 align-top">
                                                    <div className="text-xs text-slate-600">
                                                        {(() => {
                                                            const items = [];
                                                            if (fabricName) items.push(`Fabric: ${fabricName}`);
                                                            if (sheerName) items.push(`Sheer: ${sheerName}`);
                                                            if (liningName) items.push(`Lining: ${liningName}`);
                                                            if (frontMotorName) items.push(`Front Motor: ${frontMotorName}`);
                                                            if (backMotorName) items.push(`Back Motor: ${backMotorName}`);

                                                            if (items.length === 0) {
                                                                return <span className="text-slate-400 italic">No materials or motors</span>;
                                                            }

                                                            return items.join(', ');
                                                        })()}
                                                    </div>
                                                </td>

                                                {/* Quantity Column */}
                                                <td className="border border-slate-300 px-3 py-4 text-center align-top">
                                                    <div className="font-semibold text-slate-800 text-sm">{item.quantity}</div>
                                                </td>

                                                {/* Amount Column */}
                                                <td className="border border-slate-300 px-3 py-4 text-right align-top">
                                                    <div className="font-bold text-slate-800 text-sm">
                                                        {formatCurrency(calculateActualAmount(item))}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Financials & Terms Section */}
                    <section className="mt-10 grid grid-cols-1 md:grid-cols-5 gap-8 break-inside-avoid">
                        <div className="md:col-span-3 text-sm text-slate-600 space-y-6">
                            <div>
                                <h5 className="font-semibold text-slate-800 mb-2">Scope of Work</h5>
                                <p>{scopeOfWork}</p>
                            </div>
                            <div>
                                <h5 className="font-semibold text-slate-800 mb-2">Terms & Conditions</h5>
                                <pre className="whitespace-pre-wrap font-sans">{processedTermsAndConditions}</pre>
                            </div>
                            <div>
                                <h5 className="font-semibold text-slate-800 mb-2">Payment Terms</h5>
                                <p>{paymentTerms}</p>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-slate-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-3">
                                <span>Taxable Amount</span>
                                <span>{formatCurrency(subtotal - discountAmount)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>VAT ({taxPercent}%)</span>
                                <span>{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="!mt-4 pt-3 border-t-2 border-slate-800 flex justify-between font-bold text-xl text-slate-800">
                                <span>Grand Total</span>
                                <span>{formatCurrency(grandTotal)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Signature Section */}
                    <section className="mt-16 border-t border-slate-200 pt-8 flex justify-between text-sm break-inside-avoid">
                        <div className="w-1/2 pr-4">
                            <p className="font-semibold text-slate-800">For {companyDetails.name}</p>
                            <div className="mt-12 border-b border-slate-400"></div>
                            <p className="mt-2 text-slate-600">{companyDetails.contactPerson}</p>
                        </div>
                        <div className="w-1/2 pl-4">
                            <p className="font-semibold text-slate-800">Customer Acceptance</p>
                            <div className="mt-12 border-b border-slate-400"></div>
                            <p className="mt-2 text-slate-600">Signature</p>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="text-center text-xs text-slate-400 mt-12 pt-4 border-t border-slate-200">
                        <p>This quotation is valid for 30 days. All prices are in BHD.</p>
                        <p>Thank you for your business!</p>
                    </footer>
                </div>
            </div>
        </div>
    );
};