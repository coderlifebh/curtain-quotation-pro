import React, { useMemo } from 'react';
import type { SavedQuotation, Client } from '../types';

// --- Icons --- //
const FunnelIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);
const LightBulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197M15 21a6 6 0 00-9-5.197" /></svg>
);
const ChartPieIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
    </svg>
);


interface DashboardPageProps {
    savedQuotations: SavedQuotation[];
    clients: Client[];
    setActivePage: (page: string) => void;
    isDarkTheme?: boolean;
}

const FunnelStage: React.FC<{
    title: string;
    count: number;
    value: number;
    colorClass: string;
    isFirst?: boolean;
    isLast?: boolean;
}> = ({ title, count, value, colorClass, isFirst = false, isLast = false }) => (
    <div className={`relative flex items-center justify-between px-6 py-4 text-white overflow-hidden ${isFirst ? 'rounded-t-lg' : ''} ${isLast ? 'rounded-b-lg' : ''} ${colorClass}`}>
        <div className="z-10">
            <p className="font-bold text-lg">{title}</p>
            <p className="text-sm opacity-80">{count} Quotation{count !== 1 ? 's' : ''}</p>
        </div>
        <div className="z-10 text-xl font-bold">
            {value.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}
        </div>
    </div>
);


export const DashboardPage: React.FC<DashboardPageProps> = ({ savedQuotations, clients, setActivePage, isDarkTheme = true }) => {

    const pipeline = useMemo(() => {
        const draft = { count: 0, value: 0 };
        const sent = { count: 0, value: 0 };
        const approved = { count: 0, value: 0 };

        savedQuotations.forEach(q => {
            switch(q.status) {
                case 'Draft':
                    draft.count++;
                    draft.value += q.grandTotal;
                    break;
                case 'Sent':
                    sent.count++;
                    sent.value += q.grandTotal;
                    break;
                case 'Approved':
                    approved.count++;
                    approved.value += q.grandTotal;
                    break;
            }
        });
        
        return { draft, sent, approved };
    }, [savedQuotations]);

    const recentQuotations = useMemo(() => {
        return [...savedQuotations]
            .sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime())
            .slice(0, 5);
    }, [savedQuotations]);

    const topClients = useMemo(() => {
        const clientTotals: { [name: string]: number } = {};
        savedQuotations.filter(q => q.status === 'Approved').forEach(q => {
            const clientName = q.clientDetails.name;
            if (clientName) {
                clientTotals[clientName] = (clientTotals[clientName] || 0) + q.grandTotal;
            }
        });
        return Object.entries(clientTotals)
            .sort(([, aValue], [, bValue]) => bValue - aValue)
            .slice(0, 5)
            .map(([name, total]) => ({ name, total }));
    }, [savedQuotations]);

    if (savedQuotations.length === 0) {
        return (
            <div className={`text-center py-16 rounded-lg shadow-xl ${isDarkTheme ? 'bg-slate-800' : 'bg-white'}`}>
                <ChartPieIcon className={`mx-auto h-12 w-12 ${isDarkTheme ? 'text-slate-500' : 'text-gray-400'}`} />
                <h3 className={`mt-2 text-lg font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Welcome to your Dashboard</h3>
                <p className={`mt-1 text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Save your first quotation to see your sales pipeline and business insights here.</p>
                 <button
                    onClick={() => setActivePage('quotation')}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                >
                    Create a Quotation
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Funnel Column */}
                <div className={`p-6 rounded-lg shadow-2xl ${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'}`}>
                    <h2 className={`flex items-center gap-3 text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                        <FunnelIcon className={`w-6 h-6 ${isDarkTheme ? 'text-purple-400' : 'text-purple-500'}`} />
                        Sales Pipeline
                    </h2>
                    <div className="space-y-1">
                        <FunnelStage title="Approved" {...pipeline.approved} colorClass="bg-green-600" isFirst />
                        <FunnelStage title="Sent" {...pipeline.sent} colorClass="bg-blue-600" />
                        <FunnelStage title="Draft" {...pipeline.draft} colorClass="bg-slate-600" isLast />
                    </div>
                </div>

                {/* Next Steps & Top Clients Column */}
                <div className="space-y-6">
                    <div className={`p-6 rounded-lg shadow-2xl ${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'}`}>
                        <h2 className={`flex items-center gap-3 text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>
                            <LightBulbIcon className={`w-6 h-6 ${isDarkTheme ? 'text-yellow-400' : 'text-yellow-500'}`}/>
                            Next Steps
                        </h2>
                        <ul className="space-y-3 text-sm">
                           {pipeline.sent.count > 0 && (
                               <li className="flex items-start gap-3">
                                   <span className={`mt-1 ${isDarkTheme ? 'text-blue-400' : 'text-blue-500'}`}>&#8227;</span>
                                   <span className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                                       Follow up on <strong>{pipeline.sent.count} sent quotation{pipeline.sent.count !== 1 ? 's' : ''}</strong> to secure your pending revenue.
                                   </span>
                               </li>
                           )}
                           {pipeline.draft.count > 0 && (
                                <li className="flex items-start gap-3">
                                   <span className={`mt-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`}>&#8227;</span>
                                   <span className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                                       Finalize and send <strong>{pipeline.draft.count} draft quotation{pipeline.draft.count !== 1 ? 's' : ''}</strong>.
                                   </span>
                               </li>
                           )}
                           {topClients.length > 0 && (
                                <li className="flex items-start gap-3">
                                   <span className="text-green-400 mt-1">&#8227;</span>
                                   <span className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                                        Consider offering a loyalty discount to your top client, <strong>{topClients[0].name}</strong>.
                                   </span>
                               </li>
                           )}
                           {pipeline.sent.count === 0 && pipeline.draft.count === 0 && (
                                <li className="flex items-start gap-3">
                                   <span className="text-green-400 mt-1">&#8227;</span>
                                   <span className={isDarkTheme ? 'text-slate-300' : 'text-gray-600'}>
                                        Great work! Your pipeline is clean. Time to generate new leads.
                                   </span>
                               </li>
                           )}
                        </ul>
                    </div>

                     <div className={`p-6 rounded-lg shadow-2xl ${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'}`}>
                        <h2 className={`flex items-center gap-3 text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}><UsersIcon className={`w-6 h-6 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}/>Top Clients (by Approved Revenue)</h2>
                        <ul className={`${isDarkTheme ? 'divide-y divide-slate-700/50' : 'divide-y divide-gray-200'}`}>
                            {topClients.map(c => (
                                <li key={c.name} className="flex justify-between items-center py-3">
                                    <p className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{c.name}</p>
                                    <p className="font-semibold text-green-400 text-sm">{c.total.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className={`p-6 rounded-lg shadow-2xl ${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'}`}>
                <h2 className={`flex items-center gap-3 text-xl font-bold mb-4 ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}><ClockIcon className={`w-6 h-6 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}/>Recent Activity</h2>
                <ul className={`${isDarkTheme ? 'divide-y divide-slate-700/50' : 'divide-y divide-gray-200'}`}>
                    {recentQuotations.map(q => (
                        <li key={q.id} className="flex justify-between items-center py-3">
                            <div>
                                <p className={`font-medium ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{q.name}</p>
                                <p className={`text-xs ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>{q.clientDetails.name} &middot; {new Date(q.savedAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isDarkTheme ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}>
                                    {q.status}
                                </span>
                                <p className={`font-semibold text-sm w-32 text-right ${isDarkTheme ? 'text-blue-400' : 'text-blue-600'}`}>{q.grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};
