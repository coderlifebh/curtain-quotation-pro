import React, { useMemo, useState } from 'react';
import type { SavedQuotation, ProductOption, TemplateOption, DetailedCosts, QuotationItem } from '../types';

// --- Icons --- //
const DollarSignIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01M12 16v-1m0-1v.01M12 16c-1.11 0-2.08-.402-2.599-1M12 16H9.401M12 8h2.599M12 8c-3.313 0-6-1.79-6-4s2.687-4 6-4 6 1.79 6 4-2.687 4-6 4zm0 16c-3.313 0-6-1.79-6-4s2.687-4 6-4 6 1.79 6 4-2.687 4-6 4z" />
    </svg>
);

const DocumentTextIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ChartPieIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);

const PrintIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
    </svg>
);


interface ReportsPageProps {
    savedQuotations: SavedQuotation[];
    productOptions: ProductOption[];
    templateOptions: TemplateOption[];
    calculateDetailedAmount: (item: QuotationItem) => DetailedCosts;
}

const KpiCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <div className="bg-slate-800 p-6 rounded-lg shadow-2xl shadow-slate-950/50 flex items-center gap-6">
        <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
        </div>
    </div>
);

const SalesChart: React.FC<{ data: { month: string; total: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.total), 0);
    return (
        <div className="h-64 flex items-end justify-around gap-2 pt-4">
            {data.map(({ month, total }) => (
                <div key={month} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div
                        className="w-full bg-blue-500 rounded-t-md hover:bg-blue-400 transition-all duration-300"
                        style={{ height: maxValue > 0 ? `${(total / maxValue) * 100}%` : '0%' }}
                    >
                         <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white text-center bg-slate-900/50 rounded-md p-1 -mt-8 mx-auto w-max">
                           {total.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}
                        </div>
                    </div>
                    <div className="text-xs text-slate-400 mt-2">{month}</div>
                </div>
            ))}
        </div>
    );
};

const DonutChart: React.FC<{ data: { name: string, count: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, curr) => acc + curr.count, 0);
    if (total === 0) return <p className="text-slate-400 text-center py-8">No data available for this period.</p>;
    
    let cumulative = 0;
    
    const segments = data.map(({ count, color }) => {
        const percent = count / total;
        const offset = cumulative * 100;
        cumulative += percent;
        return { percent: percent * 100, offset: 100 - offset, color };
    });

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="relative w-40 h-40 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle className="text-slate-700" strokeWidth="3" stroke="currentColor" fill="transparent" r="15.915" cx="18" cy="18" />
                    {segments.map((seg, i) => (
                        <circle
                            key={i}
                            strokeWidth="3"
                            strokeDasharray={`${seg.percent} ${100 - seg.percent}`}
                            strokeDashoffset={seg.offset}
                            stroke={seg.color}
                            fill="transparent"
                            r="15.915"
                            cx="18"
                            cy="18"
                            className="-rotate-90 origin-center"
                        />
                    ))}
                </svg>
            </div>
            <ul className="space-y-2">
                {data.map(({ name, count, color }) => (
                    <li key={name} className="flex items-center text-sm">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
                        <span className="text-slate-300">{name}:</span>
                        <span className="font-semibold text-white ml-2">{count}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const getStartOfYear = () => {
    const now = new Date();
    return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
};

export const ReportsPage: React.FC<ReportsPageProps> = ({ savedQuotations, productOptions, templateOptions, calculateDetailedAmount }) => {
    const [startDate, setStartDate] = useState(getStartOfYear);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

    const filteredQuotations = useMemo(() => {
        if (!startDate || !endDate) return savedQuotations;
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).setHours(23, 59, 59, 999);
        return savedQuotations.filter(q => {
            const quoteDate = new Date(q.savedAt).getTime();
            return quoteDate >= start && quoteDate <= end;
        });
    }, [savedQuotations, startDate, endDate]);

    const reportsData = useMemo(() => {
        const approvedQuotations = filteredQuotations.filter(q => q.status === 'Approved');

        const totalRevenue = approvedQuotations.reduce((sum, q) => sum + q.grandTotal, 0);
        const totalQuotations = filteredQuotations.length;
        const averageQuoteValue = approvedQuotations.length > 0 ? totalRevenue / approvedQuotations.length : 0;
        
        const outcomes = { completed: 0, rejected: 0 };
        filteredQuotations.forEach(q => {
            if (q.status === 'Completed') outcomes.completed++;
            if (q.status === 'Rejected') outcomes.rejected++;
        });
        const outcomesData = [
            { name: 'Completed', count: outcomes.completed, color: '#10b981' },
            { name: 'Rejected', count: outcomes.rejected, color: '#ef4444' },
        ];
        
        const salesByMonth: { [month: string]: number } = {};
        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' });
        approvedQuotations.forEach(q => {
            const monthKey = monthFormatter.format(new Date(q.savedAt));
            salesByMonth[monthKey] = (salesByMonth[monthKey] || 0) + q.grandTotal;
        });
        const salesData = Object.entries(salesByMonth).map(([month, total]) => ({ month, total })).slice(-12);

        const productPerformance: { [id: string]: { count: number; revenue: number } } = {};
        approvedQuotations.forEach(q => {
            q.items.forEach(item => {
                const detailedCosts = calculateDetailedAmount(item);
                const processProduct = (id: string, cost: number) => {
                    if (id !== 'none') {
                        if (!productPerformance[id]) productPerformance[id] = { count: 0, revenue: 0 };
                        productPerformance[id].count += 1 * item.quantity;
                        productPerformance[id].revenue += cost;
                    }
                };
                processProduct(item.fabricId, detailedCosts.fabric);
                processProduct(item.sheerId, detailedCosts.sheer);
                processProduct(item.liningId, detailedCosts.lining);
            });
        });
        const productData = Object.entries(productPerformance)
            .map(([id, data]) => ({ id, ...data, product: productOptions.find(p => p.id === id) }))
            .filter(d => d.product)
            .sort((a,b) => b.revenue - a.revenue);

        return { totalRevenue, totalQuotations, averageQuoteValue, salesData, productData, outcomesData };
    }, [filteredQuotations, productOptions, calculateDetailedAmount]);

    const fabricUsageReport = useMemo(() => {
        const usageData: { [productId: string]: { product: ProductOption, meters: number } } = {};
        const getProduct = (id: string) => productOptions.find(p => p.id === id && p.id !== 'none');
        const getTemplate = (id: string) => templateOptions.find(t => t.id === id);

        for (const quotation of filteredQuotations) {
            for (const item of quotation.items) {
                const template = getTemplate(item.templateId);
                if (!template || template.calculationType !== 'running-meter') continue;
                const processProductUsage = (productId: string, fullness: number) => {
                    const product = getProduct(productId);
                    if (!product || product.unit !== 'per-meter' || !product.fabricWidth || !['Fabric', 'Sheer', 'Blackout'].includes(product.category)) return;
                    const widthM = item.width / 100;
                    const heightM = item.height / 100;
                    if (widthM <= 0 || heightM <= 0) return;
                    const panels = Math.ceil((widthM * fullness) / product.fabricWidth);
                    const metersPerSet = panels * (heightM + 0.25);
                    const totalMeters = metersPerSet * item.quantity;
                    if (totalMeters > 0) {
                        if (!usageData[product.id]) usageData[product.id] = { product, meters: 0 };
                        usageData[product.id].meters += totalMeters;
                    }
                };
                processProductUsage(item.fabricId, item.fullnessFront);
                processProductUsage(item.sheerId, item.fullnessBack);
                processProductUsage(item.liningId, item.fullnessFront);
            }
        }
        return Object.values(usageData).sort((a, b) => b.meters - a.meters);
    }, [filteredQuotations, productOptions, templateOptions]);
    
    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print">
                <h1 className="text-3xl font-bold text-white">Reports</h1>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <PrintIcon className="w-5 h-5"/>
                    Print Report
                </button>
            </div>
            
            <div className="bg-slate-800 p-4 rounded-lg shadow-2xl shadow-slate-950/50 flex flex-col sm:flex-row items-center gap-4 no-print">
                 <label htmlFor="start-date" className="text-sm font-medium text-slate-300">Date Range:</label>
                 <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white" />
                 <span className="text-slate-400">to</span>
                 <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-md px-3 py-2 text-white" />
            </div>

            {filteredQuotations.length === 0 ? (
                <div className="text-center py-16 bg-slate-800 rounded-lg shadow-xl">
                    <ChartPieIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">No data for the selected period</h3>
                    <p className="mt-1 text-sm text-slate-400">Try adjusting the date range or save some quotations.</p>
                </div>
            ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <KpiCard title="Approved Revenue" value={reportsData.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })} icon={<DollarSignIcon className="w-6 h-6 text-white"/>} colorClass="bg-green-600" />
                    <KpiCard title="Total Quotations Created" value={reportsData.totalQuotations.toString()} icon={<DocumentTextIcon className="w-6 h-6 text-white"/>} colorClass="bg-blue-600" />
                    <KpiCard title="Avg. Approved Quote Value" value={reportsData.averageQuoteValue.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })} icon={<ChartPieIcon className="w-6 h-6 text-white"/>} colorClass="bg-purple-600" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-800 p-6 rounded-lg shadow-2xl shadow-slate-950/50">
                        <h2 className="text-xl font-bold text-white mb-4">Approved Sales Over Time</h2>
                        <SalesChart data={reportsData.salesData} />
                    </div>
                    <div className="bg-slate-800 p-6 rounded-lg shadow-2xl shadow-slate-950/50">
                        <h2 className="text-xl font-bold text-white mb-4">Quotation Outcomes</h2>
                        <DonutChart data={reportsData.outcomesData} />
                    </div>
                </div>

                <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg overflow-hidden">
                     <h2 className="text-xl font-bold text-white p-6">Product Performance (from Approved Quotes)</h2>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                             <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Product</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Times Quoted</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {reportsData.productData.map(p => (
                                    <tr key={p.id} className="hover:bg-slate-700/40">
                                        <td className="px-4 py-3 text-sm text-white">{p.product!.name}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{p.product!.category}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300">{p.count}</td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-400">{p.revenue.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg overflow-hidden">
                     <h2 className="text-xl font-bold text-white p-6">Fabric Usage Report</h2>
                     <p className="px-6 pb-6 -mt-4 text-sm text-slate-400">
                        Total meters quoted for each running-meter fabric, sheer, and lining within the selected date range.
                     </p>
                     <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                             <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Fabric Name</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Category</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase">Total Meters Quoted</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {fabricUsageReport.length > 0 ? (
                                    fabricUsageReport.map(item => (
                                        <tr key={item.product.id} className="hover:bg-slate-700/40">
                                            <td className="px-4 py-3 text-sm text-white">{item.product.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-400">{item.product.category}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-blue-300">{item.meters.toFixed(2)} m</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10 text-slate-400">
                                            No running-meter fabric usage data available for this period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </>
            )}

        </div>
    );
};
