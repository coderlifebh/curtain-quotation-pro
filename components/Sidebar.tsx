
import React from 'react';
import { useUpdater } from '../hooks/useUpdater';

// Icons are defined as simple functional components
const DashboardIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const ProductsIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const SettingsIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const QuotationIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TemplatesIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5v14l7-3 7 3V5l-7 3-7-3z" />
    </svg>
);

const ArchiveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

const ChartBarIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-4m3 4v-2m3 2v-6m-9 2V7a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2zm12 0V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
);

const UsersIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197M15 21a6 6 0 00-9-5.197" />
    </svg>
);

const CurtainIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v16h2V4h16v16h2V4c0-1.1-.9-2-2-2zM4 6v14h4V6H4zm6 0v14h4V6h-4zm6 0v14h4V6h-4z"/>
    </svg>
);

const ChevronDoubleLeftIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
);

const UpdateIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

const DownloadIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon },
    { id: 'quotation', name: 'Quotation', icon: QuotationIcon },
    { id: 'clients', name: 'Clients', icon: UsersIcon },
    { id: 'products', name: 'Products', icon: ProductsIcon },
    { id: 'templates', name: 'Templates', icon: TemplatesIcon },
    { id: 'saved-quotations', name: 'Saved Quotations', icon: ArchiveIcon },
    { id: 'reports', name: 'Reports', icon: ChartBarIcon },
];

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    isMobileOpen: boolean;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isMobileOpen, isCollapsed, setCollapsed }) => {
    const { updateInfo, checkForUpdates, installUpdate } = useUpdater();

    return (
        <aside className={`fixed top-0 left-0 z-40 h-screen bg-slate-800 border-r border-slate-700 transition-all duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center h-20 border-b border-slate-700 transition-all duration-300 ${isCollapsed ? 'justify-center' : 'justify-center'}`}>
                <CurtainIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <h1 className={`text-xl font-bold text-white ml-3 tracking-wider transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Quotation Pro</h1>
            </div>
            <nav className="py-6 flex flex-col h-[calc(100vh-5rem)]">
                <ul className="flex-grow space-y-1">
                    {navItems.map((item) => {
                        const isActive = item.id === activePage;
                        return (
                            <li key={item.id} className="px-4">
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setActivePage(item.id);
                                    }}
                                    className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                        isActive
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                                    } ${isCollapsed ? 'justify-center' : ''}`}
                                    aria-current={isActive ? 'page' : undefined}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!isCollapsed ? 'mr-4' : ''}`} />
                                    <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{item.name}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
                
                <ul className="mt-auto space-y-1">
                    {/* Auto-updater controls - only show in Electron */}
                    {window.electronAPI && (
                        <>
                            {updateInfo.hasUpdate && (
                                <li className="px-4">
                                    <button
                                        onClick={installUpdate}
                                        className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 bg-green-600 hover:bg-green-700 text-white ${isCollapsed ? 'justify-center' : ''}`}
                                        title={isCollapsed ? 'Install Update' : undefined}
                                    >
                                        <DownloadIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!isCollapsed ? 'mr-4' : ''}`} />
                                        <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Install Update</span>
                                    </button>
                                </li>
                            )}
                            <li className="px-4">
                                <button
                                    onClick={checkForUpdates}
                                    disabled={updateInfo.isChecking}
                                    className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white disabled:bg-slate-600 disabled:text-slate-400 ${isCollapsed ? 'justify-center' : ''}`}
                                    title={isCollapsed ? (updateInfo.isChecking ? 'Checking...' : 'Check Updates') : undefined}
                                >
                                    <UpdateIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${updateInfo.isChecking ? 'animate-spin' : ''} ${!isCollapsed ? 'mr-4' : ''}`} />
                                    <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                        {updateInfo.isChecking ? 'Checking...' : 'Check Updates'}
                                    </span>
                                </button>
                            </li>
                            {!isCollapsed && (
                                <li className="px-4">
                                    <div className="text-xs text-slate-400 px-4 py-1">
                                        Version {updateInfo.version}
                                        {updateInfo.error && (
                                            <div className="text-red-400 mt-1">{updateInfo.error}</div>
                                        )}
                                    </div>
                                </li>
                            )}
                        </>
                    )}
                    
                    <li className="px-4">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActivePage('settings');
                            }}
                            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                                activePage === 'settings'
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                            } ${isCollapsed ? 'justify-center' : ''}`}
                            aria-current={activePage === 'settings' ? 'page' : undefined}
                            title={isCollapsed ? 'Settings' : undefined}
                        >
                            <SettingsIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!isCollapsed ? 'mr-4' : ''}`} />
                            <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Settings</span>
                        </a>
                    </li>

                    <li className="px-4 pt-2 hidden lg:block">
                         <button
                            onClick={() => setCollapsed(!isCollapsed)}
                            className={`flex items-center w-full px-4 py-2.5 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                         >
                            <ChevronDoubleLeftIcon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                            <span className={`font-medium ml-4 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Collapse</span>
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};