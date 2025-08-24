
import React from 'react';

// Icons are defined as simple functional components
const DashboardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
);

const ProductsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
);

const SettingsIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const QuotationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const TemplatesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5v14l7-3 7 3V5l-7 3-7-3z" />
    </svg>
);

const ArchiveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
);

const ChartBarIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-4m3 4v-2m3 2v-6m-9 2V7a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2zm12 0V9a2 2 0 00-2-2h-2a2 2 0 00-2 2v8a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197M15 21a6 6 0 00-9-5.197" />
    </svg>
);

const JobCardIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const DeliveryIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
);

const CurtainIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v16h2V4h16v16h2V4c0-1.1-.9-2-2-2zM4 6v14h4V6H4zm6 0v14h4V6h-4zm6 0v14h4V6h-4z" />
    </svg>
);

const ChevronDoubleLeftIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
    </svg>
);

const SunIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon },
    { id: 'quotation', name: 'Quotation', icon: QuotationIcon },
    { id: 'clients', name: 'Clients', icon: UsersIcon },
    { id: 'products', name: 'Products', icon: ProductsIcon },
    { id: 'templates', name: 'Templates', icon: TemplatesIcon },
    { id: 'saved-quotations', name: 'Saved Quotations', icon: ArchiveIcon },
    { id: 'job-cards', name: 'Job Cards', icon: JobCardIcon },
    { id: 'delivery-notes', name: 'Delivery Notes', icon: DeliveryIcon },
    { id: 'reports', name: 'Reports', icon: ChartBarIcon },
];

interface SidebarProps {
    activePage: string;
    setActivePage: (page: string) => void;
    isMobileOpen: boolean;
    isCollapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
    isDarkTheme: boolean;
    setIsDarkTheme: (isDark: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage, isMobileOpen, isCollapsed, setCollapsed, isDarkTheme, setIsDarkTheme }) => {

    return (
        <aside className={`sidebar fixed top-0 left-0 z-40 h-screen bg-slate-800 border-slate-700 border-r transition-all duration-300 ease-in-out lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} ${isCollapsed ? 'w-20' : 'w-64'}`}>
            <div className={`flex items-center h-20 border-b transition-all duration-300 border-slate-700 ${isCollapsed ? 'justify-center' : 'justify-center'}`}>
                <CurtainIcon className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <h1 className={`text-xl font-bold ml-3 tracking-wider transition-opacity duration-200 text-white ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Quotation Pro</h1>
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
                                    className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${isActive
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
                    <li className="px-4">
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                setActivePage('settings');
                            }}
                            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${activePage === 'settings'
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

                    <li className="px-4 pt-2">
                        <button
                            onClick={() => setIsDarkTheme(!isDarkTheme)}
                            className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? (isDarkTheme ? 'Light Theme' : 'Dark Theme') : undefined}
                        >
                            {isDarkTheme ? <SunIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!isCollapsed ? 'mr-4' : ''}`} /> : <MoonIcon className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${!isCollapsed ? 'mr-4' : ''}`} />}
                            <span className={`font-medium transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                                {isDarkTheme ? 'Light Theme' : 'Dark Theme'}
                            </span>
                        </button>
                    </li>

                    <li className="px-4 pt-2 hidden lg:block">
                        <button
                            onClick={() => setCollapsed(!isCollapsed)}
                            className={`flex items-center w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-slate-300 hover:bg-slate-700 hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
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