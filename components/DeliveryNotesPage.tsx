import React, { useState, useMemo } from 'react';
import type { DeliveryNote, DeliveryNoteItem, JobCard, ClientDetails } from '../types';

interface DeliveryNotesPageProps {
    deliveryNotes: DeliveryNote[];
    jobCards: JobCard[];
    onCreateDeliveryNote: (deliveryNote: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
    onUpdateDeliveryNote: (deliveryNote: DeliveryNote) => void;
    onDeleteDeliveryNote: (deliveryNoteId: string) => void;
    isDarkTheme?: boolean;
}

export const DeliveryNotesPage: React.FC<DeliveryNotesPageProps> = ({
    deliveryNotes,
    jobCards,
    onCreateDeliveryNote,
    onUpdateDeliveryNote,
    onDeleteDeliveryNote,
    isDarkTheme = true
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedDeliveryNote, setSelectedDeliveryNote] = useState<DeliveryNote | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [createFromJobCard, setCreateFromJobCard] = useState<JobCard | null>(null);

    // Form state for creating/editing delivery notes
    const [formData, setFormData] = useState<Partial<DeliveryNote>>({
        deliveryDate: new Date().toISOString().split('T')[0],
        deliveredBy: '',
        status: 'Prepared',
        notes: '',
        vehicleNumber: '',
        driverContact: '',
        estimatedDeliveryTime: ''
    });

    const [items, setItems] = useState<DeliveryNoteItem[]>([]);

    const filteredDeliveryNotes = useMemo(() => {
        return deliveryNotes.filter(note => {
            const matchesSearch = searchTerm === '' || 
                note.deliveryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                note.clientDetails.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || note.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [deliveryNotes, searchTerm, statusFilter]);

    const availableJobCards = useMemo(() => {
        const deliveredJobCardIds = deliveryNotes.map(dn => dn.jobCardId);
        return jobCards.filter(jc => 
            jc.status === 'Ready for Installation' || 
            jc.status === 'Production' ||
            !deliveredJobCardIds.includes(jc.id)
        );
    }, [jobCards, deliveryNotes]);

    const generateDeliveryNumber = (): string => {
        const year = new Date().getFullYear();
        const existingNumbers = deliveryNotes
            .filter(dn => dn.deliveryNumber.startsWith(`DN${year}`))
            .map(dn => parseInt(dn.deliveryNumber.split('-')[1]) || 0);
        
        const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
        return `DN${year}-${nextNumber.toString().padStart(3, '0')}`;
    };

    const handleCreateFromJobCard = (jobCard: JobCard) => {
        setCreateFromJobCard(jobCard);
        setIsCreating(true);
        
        // Generate delivery items from job card items
        const deliveryItems: DeliveryNoteItem[] = jobCard.items.map(item => ({
            itemId: item.id,
            room: item.room,
            description: `${item.templateId} - ${item.width}cm x ${item.height}cm`,
            quantity: item.quantity,
            delivered: item.quantity, // Default to full delivery
            pending: 0,
            notes: ''
        }));
        
        setItems(deliveryItems);
        setFormData({
            jobCardId: jobCard.id,
            jobNumber: jobCard.jobNumber,
            clientDetails: jobCard.clientDetails,
            deliveryNumber: generateDeliveryNumber(),
            deliveryDate: new Date().toISOString().split('T')[0],
            deliveredBy: '',
            status: 'Prepared',
            notes: '',
            vehicleNumber: '',
            driverContact: '',
            estimatedDeliveryTime: ''
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.jobCardId || !formData.deliveredBy || items.length === 0) {
            alert('Please fill in all required fields and add at least one item.');
            return;
        }

        const deliveryNote: Omit<DeliveryNote, 'id' | 'createdAt' | 'updatedAt'> = {
            deliveryNumber: formData.deliveryNumber!,
            jobCardId: formData.jobCardId!,
            jobNumber: formData.jobNumber!,
            clientDetails: formData.clientDetails!,
            items: items,
            deliveryDate: formData.deliveryDate!,
            deliveredBy: formData.deliveredBy!,
            receivedBy: formData.receivedBy,
            status: formData.status as any,
            notes: formData.notes!,
            vehicleNumber: formData.vehicleNumber,
            driverContact: formData.driverContact,
            estimatedDeliveryTime: formData.estimatedDeliveryTime,
            actualDeliveryTime: formData.actualDeliveryTime
        };

        if (selectedDeliveryNote) {
            onUpdateDeliveryNote({ ...deliveryNote, id: selectedDeliveryNote.id, createdAt: selectedDeliveryNote.createdAt, updatedAt: new Date().toISOString() });
        } else {
            onCreateDeliveryNote(deliveryNote);
        }

        handleCancel();
    };

    const handleCancel = () => {
        setIsCreating(false);
        setSelectedDeliveryNote(null);
        setCreateFromJobCard(null);
        setFormData({
            deliveryDate: new Date().toISOString().split('T')[0],
            deliveredBy: '',
            status: 'Prepared',
            notes: '',
            vehicleNumber: '',
            driverContact: '',
            estimatedDeliveryTime: ''
        });
        setItems([]);
    };

    const handleEdit = (deliveryNote: DeliveryNote) => {
        setSelectedDeliveryNote(deliveryNote);
        setIsCreating(true);
        setFormData(deliveryNote);
        setItems(deliveryNote.items);
    };

    const handleStatusUpdate = (deliveryNote: DeliveryNote, newStatus: DeliveryNote['status']) => {
        const updatedNote = {
            ...deliveryNote,
            status: newStatus,
            updatedAt: new Date().toISOString()
        };

        if (newStatus === 'Delivered' && !deliveryNote.actualDeliveryTime) {
            updatedNote.actualDeliveryTime = new Date().toLocaleTimeString();
        }

        onUpdateDeliveryNote(updatedNote);
    };

    const updateItem = (index: number, field: keyof DeliveryNoteItem, value: any) => {
        setItems(prev => prev.map((item, i) => 
            i === index ? { 
                ...item, 
                [field]: value,
                ...(field === 'delivered' ? { pending: item.quantity - value } : {})
            } : item
        ));
    };

    const getStatusColor = (status: DeliveryNote['status']) => {
        switch (status) {
            case 'Prepared': return 'bg-blue-100 text-blue-800';
            case 'In Transit': return 'bg-yellow-100 text-yellow-800';
            case 'Delivered': return 'bg-green-100 text-green-800';
            case 'Received': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (isCreating || selectedDeliveryNote) {
        return (
            <div className="space-y-6">
                <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {selectedDeliveryNote ? 'Edit Delivery Note' : 'Create Delivery Note'}
                        </h2>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-slate-300 hover:text-white font-medium"
                        >
                            Cancel
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Delivery Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.deliveryNumber || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryNumber: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Job Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.jobNumber || ''}
                                    className="w-full bg-slate-700/30 border border-slate-600 rounded-lg px-3 py-2 text-slate-300"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={formData.deliveryDate || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Delivered By *
                                </label>
                                <input
                                    type="text"
                                    value={formData.deliveredBy || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, deliveredBy: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status || 'Prepared'}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="Prepared">Prepared</option>
                                    <option value="In Transit">In Transit</option>
                                    <option value="Delivered">Delivered</option>
                                    <option value="Received">Received</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Vehicle Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.vehicleNumber || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Driver Contact
                                </label>
                                <input
                                    type="text"
                                    value={formData.driverContact || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, driverContact: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Estimated Delivery Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.estimatedDeliveryTime || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedDeliveryTime: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">
                                    Received By
                                </label>
                                <input
                                    type="text"
                                    value={formData.receivedBy || ''}
                                    onChange={(e) => setFormData(prev => ({ ...prev, receivedBy: e.target.value }))}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Client Details */}
                        <div className="bg-slate-700/50 rounded-lg p-4">
                            <h3 className="font-medium text-white mb-2">Client Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-slate-300">Name:</span> <span className="text-white">{formData.clientDetails?.name}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-300">Phone:</span> <span className="text-white">{formData.clientDetails?.phone}</span>
                                </div>
                                <div>
                                    <span className="font-medium text-slate-300">Address:</span> <span className="text-white">{formData.clientDetails?.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Items */}
                        <div>
                            <h3 className="font-medium text-white mb-4">Delivery Items</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-600">
                                    <thead>
                                        <tr className="bg-slate-700/50">
                                            <th className="border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-300">Room</th>
                                            <th className="border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-300">Description</th>
                                            <th className="border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-300">Total Qty</th>
                                            <th className="border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-300">Delivered</th>
                                            <th className="border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-300">Pending</th>
                                            <th className="border border-slate-600 px-3 py-2 text-left text-sm font-medium text-slate-300">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="border border-slate-600 px-3 py-2 text-sm text-white">{item.room}</td>
                                                <td className="border border-slate-600 px-3 py-2 text-sm text-white">{item.description}</td>
                                                <td className="border border-slate-600 px-3 py-2 text-sm text-center text-white">{item.quantity}</td>
                                                <td className="border border-slate-600 px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity}
                                                        value={item.delivered}
                                                        onChange={(e) => updateItem(index, 'delivered', parseInt(e.target.value) || 0)}
                                                        className="w-20 px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-sm text-center text-white"
                                                    />
                                                </td>
                                                <td className="border border-slate-600 px-3 py-2 text-sm text-center text-white">{item.pending}</td>
                                                <td className="border border-slate-600 px-3 py-2">
                                                    <input
                                                        type="text"
                                                        value={item.notes || ''}
                                                        onChange={(e) => updateItem(index, 'notes', e.target.value)}
                                                        className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600 rounded text-sm text-white placeholder-slate-400"
                                                        placeholder="Optional notes"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">
                                Delivery Notes
                            </label>
                            <textarea
                                value={formData.notes || ''}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any special delivery instructions or notes..."
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 border border-slate-600 text-slate-300 rounded-lg hover:bg-slate-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {selectedDeliveryNote ? 'Update' : 'Create'} Delivery Note
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className={`rounded-xl shadow-sm border p-6 ${isDarkTheme 
                ? 'bg-slate-800 border-slate-700' 
                : 'bg-white border-gray-200'
            }`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <h1 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Delivery Notes</h1>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => setIsCreating(true)}
                            className={`px-4 py-2 text-white rounded-lg font-medium ${isDarkTheme 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            Create Delivery Note
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by delivery number, job number, or client name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkTheme
                                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className={`border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkTheme
                                ? 'bg-slate-700/50 border-slate-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            }`}
                        >
                            <option value="all">All Status</option>
                            <option value="Prepared">Prepared</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Received">Received</option>
                        </select>
                    </div>
                </div>

                {/* Quick Create from Job Cards */}
                {availableJobCards.length > 0 && (
                    <div className={`mb-6 p-4 border rounded-lg ${isDarkTheme 
                        ? 'bg-blue-900/30 border-blue-700/50' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                        <h3 className={`font-medium mb-2 ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}>Create Delivery Note from Job Card</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableJobCards.slice(0, 5).map(jobCard => (
                                <button
                                    key={jobCard.id}
                                    onClick={() => handleCreateFromJobCard(jobCard)}
                                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                    {jobCard.jobNumber} - {jobCard.clientDetails.name}
                                </button>
                            ))}
                            {availableJobCards.length > 5 && (
                                <span className="px-3 py-1 text-blue-300 text-sm">
                                    +{availableJobCards.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Delivery Notes List */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-slate-600">
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Delivery #</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Job #</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Client</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Delivery Date</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Status</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Delivered By</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Items</th>
                                <th className="text-left py-3 px-4 font-medium text-slate-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeliveryNotes.map((deliveryNote) => (
                                <tr key={deliveryNote.id} className="border-b border-slate-700 hover:bg-slate-700/30">
                                    <td className="py-3 px-4 font-medium text-blue-400">{deliveryNote.deliveryNumber}</td>
                                    <td className="py-3 px-4 text-white">{deliveryNote.jobNumber}</td>
                                    <td className="py-3 px-4 text-white">{deliveryNote.clientDetails.name}</td>
                                    <td className="py-3 px-4 text-white">{new Date(deliveryNote.deliveryDate).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(deliveryNote.status)}`}>
                                            {deliveryNote.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-white">{deliveryNote.deliveredBy}</td>
                                    <td className="py-3 px-4 text-white">{deliveryNote.items.length} items</td>
                                    <td className="py-3 px-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(deliveryNote)}
                                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                            >
                                                Edit
                                            </button>
                                            {deliveryNote.status !== 'Delivered' && deliveryNote.status !== 'Received' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(deliveryNote, 'Delivered')}
                                                    className="text-green-400 hover:text-green-300 text-sm font-medium"
                                                >
                                                    Mark Delivered
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Are you sure you want to delete delivery note ${deliveryNote.deliveryNumber}?`)) {
                                                        onDeleteDeliveryNote(deliveryNote.id);
                                                    }
                                                }}
                                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredDeliveryNotes.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-slate-500 mb-4">
                            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-slate-300 mb-2">No delivery notes found</h3>
                        <p className="text-slate-400 mb-4">
                            {searchTerm || statusFilter !== 'all' 
                                ? 'Try adjusting your search terms or filters.'
                                : 'Create your first delivery note to get started.'
                            }
                        </p>
                        {availableJobCards.length > 0 && (
                            <button
                                onClick={() => setIsCreating(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Create Delivery Note
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
