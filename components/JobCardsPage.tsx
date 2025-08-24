import React, { useState, useMemo } from 'react';
import type { JobCard, JobCardStatus, SavedQuotation, QuotationItem, JobCardMeasurement } from '../types';

interface JobCardsPageProps {
    jobCards: JobCard[];
    savedQuotations: SavedQuotation[];
    onCreateJobCard: (quotationId: string) => void;
    onUpdateJobCard: (jobCard: JobCard) => void;
    onDeleteJobCard: (jobCardId: string) => void;
    isDarkTheme: boolean;
}

const JOB_CARD_STATUSES: JobCardStatus[] = [
    'Created', 'In Progress', 'Measurement Taken', 'Production',
    'Ready for Installation', 'Installed', 'Completed'
];

const PRIORITY_COLORS = {
    'Low': 'bg-green-100 text-green-800',
    'Medium': 'bg-yellow-100 text-yellow-800',
    'High': 'bg-red-100 text-red-800'
};

const STATUS_COLORS = {
    'Created': 'bg-gray-100 text-gray-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Measurement Taken': 'bg-indigo-100 text-indigo-800',
    'Production': 'bg-purple-100 text-purple-800',
    'Ready for Installation': 'bg-orange-100 text-orange-800',
    'Installed': 'bg-green-100 text-green-800',
    'Completed': 'bg-emerald-100 text-emerald-800'
};

export const JobCardsPage: React.FC<JobCardsPageProps> = ({
    jobCards, savedQuotations, onCreateJobCard, onUpdateJobCard, onDeleteJobCard, isDarkTheme
}) => {
    const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [filterStatus, setFilterStatus] = useState<JobCardStatus | 'All'>('All');
    const [filterPriority, setFilterPriority] = useState<'All' | 'Low' | 'Medium' | 'High'>('All');
    const [searchTerm, setSearchTerm] = useState('');

    // Get quotations that don't have job cards yet
    const availableQuotations = useMemo(() => {
        const jobCardQuotationIds = new Set(jobCards.map(jc => jc.quotationId));
        return savedQuotations.filter(q => !jobCardQuotationIds.has(q.id) && !q.deletedAt);
    }, [jobCards, savedQuotations]);

    // Filter job cards
    const filteredJobCards = useMemo(() => {
        return jobCards.filter(jobCard => {
            const matchesStatus = filterStatus === 'All' || jobCard.status === filterStatus;
            const matchesPriority = filterPriority === 'All' || jobCard.priority === filterPriority;
            const matchesSearch = searchTerm === '' ||
                jobCard.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                jobCard.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                jobCard.clientDetails.name.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesStatus && matchesPriority && matchesSearch;
        });
    }, [jobCards, filterStatus, filterPriority, searchTerm]);

    // Shared styling helper
    const getSharedInputClass = () => {
        return `w-full border rounded-md px-3 py-2 ${isDarkTheme
                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
            }`;
    };

    const handleStatusUpdate = (jobCard: JobCard, newStatus: JobCardStatus) => {
        const updatedJobCard = {
            ...jobCard,
            status: newStatus,
            updatedAt: new Date().toISOString()
        };
        onUpdateJobCard(updatedJobCard);
    };

    const handleNotesUpdate = (jobCard: JobCard, notes: string) => {
        const updatedJobCard = {
            ...jobCard,
            notes,
            updatedAt: new Date().toISOString()
        };
        onUpdateJobCard(updatedJobCard);
    };

    const handlePriorityUpdate = (jobCard: JobCard, priority: 'Low' | 'Medium' | 'High') => {
        const updatedJobCard = {
            ...jobCard,
            priority,
            updatedAt: new Date().toISOString()
        };
        onUpdateJobCard(updatedJobCard);
    };

    const handleEstimatedDeliveryUpdate = (jobCard: JobCard, estimatedDelivery: string) => {
        const updatedJobCard = {
            ...jobCard,
            estimatedDelivery: estimatedDelivery || undefined,
            updatedAt: new Date().toISOString()
        };
        onUpdateJobCard(updatedJobCard);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header and Controls */}
            <div className={`rounded-lg p-6 shadow-2xl ${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Job Cards</h1>
                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                        {/* Create Job Card from Quotation */}
                        {availableQuotations.length > 0 && (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) {
                                        onCreateJobCard(e.target.value);
                                        e.target.value = '';
                                    }
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                defaultValue=""
                            >
                                <option value="" disabled>Create Job Card</option>
                                {availableQuotations.map(quotation => (
                                    <option key={quotation.id} value={quotation.id}>
                                        {quotation.quotationNumber} - {quotation.clientDetails.name}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Search</label>
                        <input
                            type="text"
                            placeholder="Job#, Quotation#, Client..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={getSharedInputClass()}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as JobCardStatus | 'All')}
                            className={getSharedInputClass()}
                        >
                            <option value="All">All Statuses</option>
                            {JOB_CARD_STATUSES.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Priority</label>
                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value as 'All' | 'Low' | 'Medium' | 'High')}
                            className={getSharedInputClass()}
                        >
                            <option value="All">All Priorities</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <span className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                            {filteredJobCards.length} of {jobCards.length} job cards
                        </span>
                    </div>
                </div>
            </div>

            {/* Job Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobCards.map(jobCard => (
                    <div key={jobCard.id} className={`rounded-lg p-6 shadow-2xl ${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'}`}>
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className={`text-lg font-semibold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{jobCard.jobNumber}</h3>
                                <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Quote: {jobCard.quotationNumber}</p>
                            </div>
                            <div className="flex gap-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${PRIORITY_COLORS[jobCard.priority]}`}>
                                    {jobCard.priority}
                                </span>
                                <button
                                    onClick={() => onDeleteJobCard(jobCard.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                    title="Delete Job Card"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Client Info */}
                        <div className="mb-4">
                            <h4 className={`text-sm font-medium mb-1 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Client</h4>
                            <p className={isDarkTheme ? 'text-white' : 'text-gray-900'}>{jobCard.clientDetails.name}</p>
                            <p className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>{jobCard.clientDetails.phone}</p>
                        </div>

                        {/* Status */}
                        <div className="mb-4">
                            <h4 className={`text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Status</h4>
                            <select
                                value={jobCard.status}
                                onChange={(e) => handleStatusUpdate(jobCard, e.target.value as JobCardStatus)}
                                className={`w-full px-3 py-2 text-sm font-medium rounded-md border-0 ${STATUS_COLORS[jobCard.status]}`}
                            >
                                {JOB_CARD_STATUSES.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority */}
                        <div className="mb-4">
                            <h4 className={`text-sm font-medium mb-2 ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>Priority</h4>
                            <select
                                value={jobCard.priority}
                                onChange={(e) => handlePriorityUpdate(jobCard, e.target.value as 'Low' | 'Medium' | 'High')}
                                className={`${getSharedInputClass()} text-sm`}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>

                        {/* Items Count */}
                        <div className="mb-4">
                            <span className={`text-sm ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                                {jobCard.items.length} item(s) • Total Windows: {jobCard.items.reduce((sum, item) => sum + item.quantity, 0)}
                            </span>
                        </div>

                        {/* Dates */}
                        <div className="mb-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className={isDarkTheme ? 'text-slate-400' : 'text-gray-500'}>Created:</span>
                                <span className={isDarkTheme ? 'text-white' : 'text-gray-900'}>{formatDate(jobCard.createdAt)}</span>
                            </div>
                            <div>
                                <label className={`block text-xs mb-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Estimated Delivery</label>
                                <input
                                    type="date"
                                    value={jobCard.estimatedDelivery ? jobCard.estimatedDelivery.split('T')[0] : ''}
                                    onChange={(e) => handleEstimatedDeliveryUpdate(jobCard, e.target.value)}
                                    className={`w-full border rounded px-2 py-1 text-xs ${isDarkTheme
                                            ? 'bg-slate-700/50 border-slate-600 text-white'
                                            : 'bg-white border-gray-300 text-gray-900'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="mb-4">
                            <label className={`block text-xs mb-1 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>Notes</label>
                            <textarea
                                value={jobCard.notes}
                                onChange={(e) => handleNotesUpdate(jobCard, e.target.value)}
                                placeholder="Add notes..."
                                className={`w-full border rounded-md px-3 py-2 text-sm resize-none ${isDarkTheme
                                        ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                    }`}
                                rows={3}
                            />
                        </div>

                        {/* View Details Button */}
                        <button
                            onClick={() => setSelectedJobCard(jobCard)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>

            {filteredJobCards.length === 0 && (
                <div className="bg-slate-800 shadow-2xl shadow-slate-950/50 rounded-lg p-12 text-center">
                    <div className="text-slate-400 mb-4">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Job Cards Found</h3>
                    <p className="text-slate-400">
                        {jobCards.length === 0
                            ? "Create your first job card from an approved quotation."
                            : "No job cards match your current filters."
                        }
                    </p>
                </div>
            )}

            {/* Job Card Details Modal */}
            {selectedJobCard && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Job Card Details</h2>
                            <button
                                onClick={() => setSelectedJobCard(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Job Card Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{selectedJobCard.jobNumber}</h3>
                                    <p className="text-slate-400">Quotation: {selectedJobCard.quotationNumber}</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-300 mb-1">Client Details</h4>
                                    <p className="text-white">{selectedJobCard.clientDetails.name}</p>
                                    <p className="text-slate-400">{selectedJobCard.clientDetails.phone}</p>
                                    <p className="text-slate-400">{selectedJobCard.clientDetails.address}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-slate-300 mb-1">Status & Priority</h4>
                                    <div className="flex gap-2 mb-2">
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${STATUS_COLORS[selectedJobCard.status]}`}>
                                            {selectedJobCard.status}
                                        </span>
                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${PRIORITY_COLORS[selectedJobCard.priority]}`}>
                                            {selectedJobCard.priority}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-slate-300 mb-1">Timeline</h4>
                                    <p className="text-sm text-slate-400">Created: {formatDate(selectedJobCard.createdAt)}</p>
                                    <p className="text-sm text-slate-400">Updated: {formatDate(selectedJobCard.updatedAt)}</p>
                                    {selectedJobCard.estimatedDelivery && (
                                        <p className="text-sm text-slate-400">Est. Delivery: {formatDate(selectedJobCard.estimatedDelivery)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="mb-6">
                            <h4 className="font-medium text-slate-300 mb-3">Job Items</h4>
                            <div className="bg-slate-700/50 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-600/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-slate-300">Room</th>
                                            <th className="px-4 py-3 text-left text-slate-300">Dimensions</th>
                                            <th className="px-4 py-3 text-left text-slate-300">Quantity</th>
                                            <th className="px-4 py-3 text-left text-slate-300">Template</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedJobCard.items.map(item => (
                                            <tr key={item.id} className="border-t border-slate-600">
                                                <td className="px-4 py-3 text-white">{item.room}</td>
                                                <td className="px-4 py-3 text-slate-300">{item.width}cm × {item.height}cm</td>
                                                <td className="px-4 py-3 text-slate-300">{item.quantity}</td>
                                                <td className="px-4 py-3 text-slate-300">{item.templateId}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Notes */}
                        {selectedJobCard.notes && (
                            <div className="mb-6">
                                <h4 className="font-medium text-slate-300 mb-2">Notes</h4>
                                <div className="bg-slate-700/50 rounded-lg p-4">
                                    <p className="text-slate-300 whitespace-pre-wrap">{selectedJobCard.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
