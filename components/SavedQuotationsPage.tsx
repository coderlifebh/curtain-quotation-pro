import React, { useState, useMemo } from 'react';
import type { SavedQuotation, QuotationVersion, QuotationStatus } from '../types';

// --- Icons --- //
const EditIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>);
const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>);
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const PreviewIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>);
const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const RestoreIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6-6m-6 6l6 6" /></svg>);
const CloseIcon: React.FC<{className?: string}> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>);
const StatusIcon: React.FC<{ className?: string }> = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);

interface SavedQuotationsPageProps {
    quotations: SavedQuotation[];
    onLoad: (id: string) => void;
    onDelete: (id: string) => void;
    onCopy: (id: string) => void;
    onPreview: (id: string) => void;
    onRestore: (id: string) => void;
    onDeletePermanently: (id: string) => void;
    onRestoreVersion: (quoteId: string, versionSavedAt: string) => void;
    onPreviewVersion: (quoteId: string, version: QuotationVersion | 'current') => void;
    clientFilter: string | null;
    onClearFilter: () => void;
    onStatusUpdate: (id: string, newStatus: QuotationStatus, notes?: string) => void;
}

const statusColors: Record<QuotationStatus, { bg: string; text: string }> = {
    Draft: { bg: 'bg-slate-600', text: 'text-slate-100' },
    Sent: { bg: 'bg-blue-600', text: 'text-blue-100' },
    Approved: { bg: 'bg-green-600', text: 'text-green-100' },
    Completed: { bg: 'bg-purple-600', text: 'text-purple-100' },
    Rejected: { bg: 'bg-red-600', text: 'text-red-100' },
};

const StatusBadge: React.FC<{ status: QuotationStatus }> = ({ status }) => {
    const color = statusColors[status] || statusColors.Draft;
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color.bg} ${color.text}`}>
            {status}
        </span>
    );
};

const StatusUpdateModal: React.FC<{
    quote: SavedQuotation;
    onClose: () => void;
    onSave: (id: string, newStatus: QuotationStatus, notes?: string) => void;
}> = ({ quote, onClose, onSave }) => {
    const [newStatus, setNewStatus] = useState<QuotationStatus>(quote.status);
    const [notes, setNotes] = useState('');
    const statusOptions: QuotationStatus[] = ['Draft', 'Sent', 'Approved', 'Completed', 'Rejected'];

    const handleSave = () => {
        onSave(quote.id, newStatus, notes);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4">
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-lg font-bold text-white truncate">Update Status: "{quote.name}"</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="status-select" className="block text-sm font-medium text-slate-300 mb-1">New Status</label>
                        <select
                            id="status-select"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as QuotationStatus)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="status-notes" className="block text-sm font-medium text-slate-300 mb-1">Notes (Optional)</label>
                        <textarea
                            id="status-notes"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md shadow-sm px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., Client approved via email."
                        />
                    </div>
                    <div className="border-t border-slate-700 pt-4">
                        <h4 className="text-sm font-medium text-slate-300 mb-2">Status History</h4>
                        {quote.statusHistory && quote.statusHistory.length > 0 ? (
                            <ul className="space-y-2 max-h-40 overflow-y-auto text-xs">
                                {[...quote.statusHistory].reverse().map(entry => (
                                    <li key={entry.date} className="p-2 bg-slate-700/50 rounded-md">
                                        <p className="font-semibold text-slate-200">
                                            <StatusBadge status={entry.status} /> on {new Date(entry.date).toLocaleString()}
                                        </p>
                                        {entry.notes && <p className="text-slate-400 mt-1 italic">"{entry.notes}"</p>}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-slate-500">No history available.</p>
                        )}
                    </div>
                </div>
                <div className="flex justify-end gap-2 p-4 bg-slate-800/50 border-t border-slate-700">
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700">Save Status</button>
                </div>
            </div>
        </div>
    );
};

const HistoryModal: React.FC<{ 
    quote: SavedQuotation; 
    onClose: () => void;
    onRestoreVersion: (quoteId: string, versionSavedAt: string) => void;
    onPreviewVersion: (quoteId: string, version: QuotationVersion | 'current') => void;
}> = ({ quote, onClose, onRestoreVersion, onPreviewVersion }) => {
    
    const allVersions = useMemo(() => {
        const currentAsVersion: QuotationVersion = {
            savedAt: quote.savedAt,
            name: quote.name,
            grandTotal: quote.grandTotal,
            items: quote.items,
            clientDetails: quote.clientDetails,
            discountPercent: quote.discountPercent,
            taxPercent: quote.taxPercent,
            quotationDate: quote.quotationDate,
        };
        const historyReversed = quote.history ? [...quote.history].reverse() : [];
        return [
            { type: 'current', data: currentAsVersion },
            ...historyReversed.map(v => ({ type: 'history', data: v }))
        ];
    }, [quote]);

    return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl m-4">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white truncate">Version History: "{quote.name}"</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
                <ul className="space-y-3">
                    {allVersions.map(({type, data}) => (
                        <li key={data.savedAt} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 rounded-md ${type === 'current' ? 'bg-blue-900/50 border border-blue-700' : 'bg-slate-700/50'}`}>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold ${type === 'current' ? 'text-white' : 'text-slate-200'}`}>{type === 'current' ? 'Current Version' : data.name}</p>
                                <p className="text-xs text-slate-400">Saved: {new Date(data.savedAt).toLocaleString()}</p>
                            </div>
                            <div className="text-sm font-semibold text-slate-300 sm:text-base sm:w-36 sm:text-center">
                                {data.grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2 self-end sm:self-center">
                                <button onClick={() => onPreviewVersion(quote.id, type === 'current' ? 'current' : data)} className="px-3 py-1.5 text-xs bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">Preview</button>
                                {type !== 'current' && (
                                    <button onClick={() => { onRestoreVersion(quote.id, data.savedAt); onClose(); }} className="px-3 py-1.5 text-xs bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Restore as New Draft</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
    )
};

const TrashModal: React.FC<{ trashed: SavedQuotation[]; onRestore: (id: string) => void; onDeletePermanently: (id: string) => void; onClose: () => void; }> = ({ trashed, onRestore, onDeletePermanently, onClose }) => (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl m-4">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h3 className="text-lg font-bold text-white">Trash</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
            </div>
            <div className="p-2 sm:p-4 max-h-[70vh] overflow-y-auto">
                {trashed.length === 0 ? (
                    <p className="text-center text-slate-400 py-12">The trash is empty.</p>
                ) : (
                <table className="min-w-full">
                    <tbody className="divide-y divide-slate-700">
                        {trashed.map(q => (
                            <tr key={q.id}>
                                <td className="p-3 text-sm">
                                    <p className="font-medium text-white">{q.name}</p>
                                    <p className="text-slate-400">{q.quotationNumber}</p>
                                </td>
                                <td className="p-3 text-sm text-slate-400">
                                    Deleted: {new Date(q.deletedAt!).toLocaleDateString()}
                                </td>
                                <td className="p-3 text-right space-x-2">
                                    <button onClick={() => onRestore(q.id)} className="inline-flex items-center gap-1.5 text-green-400 hover:text-green-300 p-1.5 rounded-md hover:bg-slate-700" title="Restore"><RestoreIcon className="w-5 h-5"/> <span className="text-xs hidden sm:inline">Restore</span></button>
                                    <button onClick={() => onDeletePermanently(q.id)} className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-700" title="Delete Permanently"><TrashIcon className="w-5 h-5"/> <span className="text-xs hidden sm:inline">Delete Forever</span></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                )}
            </div>
        </div>
    </div>
);

export const SavedQuotationsPage: React.FC<SavedQuotationsPageProps> = ({ quotations, onLoad, onDelete, onCopy, onPreview, onRestore, onDeletePermanently, onRestoreVersion, onPreviewVersion, clientFilter, onClearFilter, onStatusUpdate }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isTrashOpen, setTrashOpen] = useState(false);
    const [isHistoryOpen, setHistoryOpen] = useState(false);
    const [selectedQuoteForHistory, setSelectedQuoteForHistory] = useState<SavedQuotation | null>(null);
    const [isStatusModalOpen, setStatusModalOpen] = useState(false);
    const [selectedQuoteForStatus, setSelectedQuoteForStatus] = useState<SavedQuotation | null>(null);

    const handleOpenStatusModal = (quote: SavedQuotation) => {
        setSelectedQuoteForStatus(quote);
        setStatusModalOpen(true);
    };

    const { activeQuotations, trashedQuotations } = useMemo(() => ({
        activeQuotations: quotations.filter(q => !q.deletedAt),
        trashedQuotations: quotations.filter(q => q.deletedAt).sort((a,b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime())
    }), [quotations]);

    const filteredAndSortedQuotations = useMemo(() => {
        let filtered = clientFilter ? activeQuotations.filter(q => q.clientDetails.name === clientFilter) : activeQuotations;
        
        const sorted = [...filtered].sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
        
        if (!searchQuery.trim()) return sorted;

        const lowercasedQuery = searchQuery.toLowerCase();
        return sorted.filter(q => 
            q.name.toLowerCase().includes(lowercasedQuery) ||
            q.quotationNumber.toLowerCase().includes(lowercasedQuery) ||
            q.clientDetails.name.toLowerCase().includes(lowercasedQuery)
        );
    }, [activeQuotations, searchQuery, clientFilter]);

    const sharedThClass = "px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider";

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                {clientFilter ? (
                     <div className="flex items-center gap-4 min-w-0">
                        <h1 className="text-3xl font-bold text-white truncate" title={clientFilter}><span className="text-slate-400 font-normal">Client:</span> {clientFilter}</h1>
                        <button onClick={onClearFilter} className="text-sm text-blue-400 hover:text-blue-300 whitespace-nowrap flex-shrink-0">(Show All)</button>
                    </div>
                ) : <h1 className="text-3xl font-bold text-white">Saved Quotations</h1>}

                <div className="flex items-center gap-2">
                    <div className="relative w-full md:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-slate-400" /></div>
                        <input type="text" placeholder="Search by name, client, or QN..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg shadow-sm pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <button onClick={() => setTrashOpen(true)} className="flex-shrink-0 relative px-4 py-2 text-sm bg-slate-600 text-white font-semibold rounded-lg shadow-md hover:bg-slate-700" title="Open Trash">
                        <TrashIcon className="w-5 h-5"/>
                        {trashedQuotations.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{trashedQuotations.length}</span>}
                    </button>
                </div>
            </div>
            
            {activeQuotations.length === 0 ? (
                 <div className="text-center py-16 bg-slate-800 rounded-lg shadow-xl">
                    <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" /></svg>
                    <h3 className="mt-2 text-lg font-medium text-white">No saved quotations</h3>
                    <p className="mt-1 text-sm text-slate-400">Go to the 'Quotation' page to save your first one.</p>
                </div>
            ) : filteredAndSortedQuotations.length === 0 ? (
                <div className="text-center py-16 bg-slate-800 rounded-lg shadow-xl">
                    <SearchIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <h3 className="mt-2 text-lg font-medium text-white">No Results Found</h3>
                    <p className="mt-1 text-sm text-slate-400">Your search for "{searchQuery}" did not match any quotations{clientFilter ? ` for ${clientFilter}` : ''}.</p>
                </div>
            ) : (
                <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-700">
                             <thead className="bg-slate-800/50">
                                <tr>
                                    <th scope="col" className={sharedThClass}>Quotation Name</th>
                                    <th scope="col" className={sharedThClass}>Quotation #</th>
                                    <th scope="col" className={sharedThClass}>Date</th>
                                    <th scope="col" className={sharedThClass}>Client Name</th>
                                    <th scope="col" className={sharedThClass}>Status</th>
                                    <th scope="col" className={sharedThClass}>Grand Total</th>
                                    <th scope="col" className={`${sharedThClass} text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800 divide-y divide-slate-700">
                                {filteredAndSortedQuotations.map(q => (
                                    <tr key={q.id} className="hover:bg-slate-700/40 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">{q.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{q.quotationNumber}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{new Date(q.quotationDate + 'T00:00:00').toLocaleDateString()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">{q.clientDetails.name || 'N/A'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-300">
                                            <StatusBadge status={q.status} />
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-blue-400">{q.grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'BHD' })}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-1">
                                            <button onClick={() => handleOpenStatusModal(q)} className="text-slate-400 hover:text-cyan-400 p-1" title="Update Status"><StatusIcon className="w-5 h-5" /></button>
                                            {q.history && q.history.length > 0 && <button onClick={() => { setSelectedQuoteForHistory(q); setHistoryOpen(true); }} className="text-slate-400 hover:text-yellow-400 p-1" title="History"><HistoryIcon className="w-5 h-5" /></button>}
                                            <button onClick={() => onPreview(q.id)} className="text-slate-400 hover:text-purple-400 p-1" title="Preview"><PreviewIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onLoad(q.id)} className="text-slate-400 hover:text-blue-400 p-1" title="Edit"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onCopy(q.id)} className="text-slate-400 hover:text-green-400 p-1" title="Copy"><CopyIcon className="w-5 h-5" /></button>
                                            <button onClick={() => onDelete(q.id)} className="text-slate-400 hover:text-red-500 p-1" title="Move to Trash"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isHistoryOpen && selectedQuoteForHistory && <HistoryModal quote={selectedQuoteForHistory} onClose={() => setHistoryOpen(false)} onRestoreVersion={onRestoreVersion} onPreviewVersion={onPreviewVersion} />}
            {isTrashOpen && <TrashModal trashed={trashedQuotations} onRestore={onRestore} onDeletePermanently={onDeletePermanently} onClose={() => setTrashOpen(false)} />}
            {isStatusModalOpen && selectedQuoteForStatus && <StatusUpdateModal quote={selectedQuoteForStatus} onClose={() => setStatusModalOpen(false)} onSave={onStatusUpdate} />}
        </div>
    );
};