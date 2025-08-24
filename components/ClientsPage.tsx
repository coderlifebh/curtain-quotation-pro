import React, { useState, useMemo } from 'react';
import type { Client, SavedQuotation } from '../types';

// Text casing utility functions
const toProperCase = (str: string): string => {
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const formatPhoneNumber = (phone: string): string => {
    // Remove all non-numeric characters except + at the start
    const cleaned = phone.replace(/[^\d+]/g, '');
    return cleaned;
};

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>;
const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>;
const EditIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const ViewListIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 2a1 1 0 000 2h2a1 1 0 100-2H7zm0 4a1 1 0 000 2h2a1 1 0 100-2H7z" clipRule="evenodd" /></svg>;
const SearchIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const getSharedInputClass = (isDarkTheme: boolean) => `w-full rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${isDarkTheme
        ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400'
        : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400'
    }`;
const getSharedThClass = (isDarkTheme: boolean) => `px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`;

interface ClientsPageProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    savedQuotations: SavedQuotation[];
    onViewQuotations: (clientName: string) => void;
    isDarkTheme?: boolean;
}

export const ClientsPage: React.FC<ClientsPageProps> = ({ clients, setClients, savedQuotations, onViewQuotations, isDarkTheme = true }) => {
    const sharedInputClass = getSharedInputClass(isDarkTheme);
    const sharedThClass = getSharedThClass(isDarkTheme);
    const [editId, setEditId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const isEditing = editId !== null;

    const resetForm = () => {
        setEditId(null);
        setName('');
        setPhone('');
        setAddress('');
    };

    const handleSave = () => {
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();
        const trimmedAddress = address.trim();

        if (!trimmedName || !trimmedPhone) {
            alert('Client Name and Phone are required.');
            return;
        }

        const formattedPhone = formatPhoneNumber(trimmedPhone);
        const phoneExists = clients.some(c => c.phone === formattedPhone && c.id !== editId);
        if (phoneExists) {
            alert('A client with this phone number already exists.');
            return;
        }

        const clientData = {
            name: toProperCase(trimmedName),
            phone: formattedPhone,
            address: toProperCase(trimmedAddress)
        };

        if (isEditing) {
            setClients(prev => prev.map(c => c.id === editId ? { ...c, ...clientData } : c));
        } else {
            const newClient: Client = {
                id: `client-${Date.now()}`,
                ...clientData
            };
            setClients(prev => [...prev, newClient]);
        }
        resetForm();
    };

    const handleEdit = (client: Client) => {
        setEditId(client.id);
        setName(client.name);
        setPhone(client.phone);
        setAddress(client.address);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (client: Client) => {
        const isClientInUse = savedQuotations.some(q => q.clientDetails.phone === client.phone);
        if (isClientInUse) {
            alert(`Cannot delete "${client.name}". This client is associated with one or more saved quotations.`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete the client "${client.name}"? This cannot be undone.`)) {
            setClients(prev => prev.filter(c => c.id !== client.id));
        }
    };

    const filteredClients = useMemo(() => {
        const sorted = [...clients].sort((a, b) => a.name.localeCompare(b.name));
        if (!searchQuery.trim()) {
            return sorted;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return sorted.filter(c =>
            c.name.toLowerCase().includes(lowercasedQuery) ||
            c.phone.toLowerCase().includes(lowercasedQuery) ||
            c.address.toLowerCase().includes(lowercasedQuery)
        );
    }, [clients, searchQuery]);

    return (
        <div className="space-y-8">
            <div className={`${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'} shadow-2xl rounded-lg p-6`}>
                <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'} mb-4`}>{isEditing ? 'Edit Client' : 'Add New Client'}</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-1">
                        <label htmlFor="clientName" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Client Name</label>
                        <input
                            id="clientName"
                            type="text"
                            value={name}
                            onChange={e => setName(toProperCase(e.target.value))}
                            onBlur={e => setName(toProperCase(e.target.value))}
                            onPaste={e => {
                                setTimeout(() => {
                                    const pastedValue = e.currentTarget.value;
                                    setName(toProperCase(pastedValue));
                                }, 0);
                            }}
                            className={sharedInputClass}
                            placeholder="e.g., John Doe"
                            required />
                    </div>
                    <div className="lg:col-span-1">
                        <label htmlFor="clientPhone" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Phone Number</label>
                        <input
                            id="clientPhone"
                            type="text"
                            value={phone}
                            onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                            onBlur={e => setPhone(formatPhoneNumber(e.target.value))}
                            onPaste={e => {
                                setTimeout(() => {
                                    const pastedValue = e.currentTarget.value;
                                    setPhone(formatPhoneNumber(pastedValue));
                                }, 0);
                            }}
                            className={sharedInputClass}
                            placeholder="e.g., +973 1234 5678"
                            required />
                    </div>
                    <div className="sm:col-span-2 lg:col-span-1">
                        <label htmlFor="clientAddress" className={`block text-sm font-medium ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} mb-1`}>Address</label>
                        <input
                            id="clientAddress"
                            type="text"
                            value={address}
                            onChange={e => setAddress(toProperCase(e.target.value))}
                            onBlur={e => setAddress(toProperCase(e.target.value))}
                            onPaste={e => {
                                setTimeout(() => {
                                    const pastedValue = e.currentTarget.value;
                                    setAddress(toProperCase(pastedValue));
                                }, 0);
                            }}
                            className={sharedInputClass}
                            placeholder="e.g., Villa 5, Garden District" />
                    </div>
                    <div className="flex gap-2 pt-2 sm:col-span-2 lg:col-span-3">
                        <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors">
                            <PlusIcon className="w-5 h-5" />
                            {isEditing ? 'Update Client' : 'Add Client'}
                        </button>
                        {isEditing && (
                            <button type="button" onClick={resetForm} className={`w-full px-4 py-2 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 transition-colors ${isDarkTheme ? 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-400' : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400'}`}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className={`${isDarkTheme ? 'bg-slate-800 shadow-slate-950/50' : 'bg-white shadow-gray-200/50'} shadow-2xl rounded-lg`}>
                <div className={`p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b ${isDarkTheme ? 'border-slate-700' : 'border-gray-200'}`}>
                    <h2 className={`text-xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>Client List ({filteredClients.length})</h2>
                    <div className="relative w-full md:max-w-xs">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className={`h-5 w-5 ${isDarkTheme ? 'text-slate-400' : 'text-gray-400'}`} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search clients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full rounded-lg shadow-sm pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkTheme ? 'bg-slate-700/50 border border-slate-600 text-white placeholder-slate-400' : 'bg-white border border-gray-300 text-gray-900 placeholder-gray-500'}`}
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className={isDarkTheme ? 'bg-slate-800/50' : 'bg-gray-50'}>
                            <tr>
                                <th scope="col" className={sharedThClass}>Name</th>
                                <th scope="col" className={sharedThClass}>Phone</th>
                                <th scope="col" className={sharedThClass}>Address</th>
                                <th scope="col" className={`${sharedThClass} text-right`}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={`${isDarkTheme ? 'bg-slate-800 divide-slate-700' : 'bg-white divide-gray-200'} divide-y`}>
                            {filteredClients.length > 0 ? (
                                filteredClients.map(client => (
                                    <tr key={client.id} className={isDarkTheme ? 'hover:bg-slate-700/40' : 'hover:bg-gray-50'}>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-white' : 'text-gray-900'}`}>{client.name}</td>
                                        <td className={`px-4 py-3 whitespace-nowrap text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'}`}>{client.phone}</td>
                                        <td className={`px-4 py-3 text-sm ${isDarkTheme ? 'text-slate-300' : 'text-gray-700'} truncate max-w-xs`}>{client.address}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right space-x-2">
                                            <button onClick={() => onViewQuotations(client.name)} className={`${isDarkTheme ? 'text-slate-400 hover:text-green-400' : 'text-gray-500 hover:text-green-500'} transition-colors p-1`} aria-label="View Quotations" title="View Quotations"><ViewListIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleEdit(client)} className={`${isDarkTheme ? 'text-slate-400 hover:text-blue-400' : 'text-gray-500 hover:text-blue-500'} transition-colors p-1`} aria-label="Edit Client" title="Edit Client"><EditIcon className="w-5 h-5" /></button>
                                            <button onClick={() => handleDelete(client)} className={`${isDarkTheme ? 'text-slate-400 hover:text-red-500' : 'text-gray-500 hover:text-red-500'} transition-colors p-1`} aria-label="Delete Client" title="Delete Client"><TrashIcon className="w-5 h-5" /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className={`text-center py-10 ${isDarkTheme ? 'text-slate-400' : 'text-gray-500'}`}>
                                        {searchQuery ? `No clients found for "${searchQuery}".` : "No clients have been added yet."}
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
