import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

// ── Import pages as you build them ──────────────────────────────────────────
import KycDashboard from '../components/KycDashboard';
// import Disputes from '../components/Disputes';
// import BusinessUsers from '../components/BusinessUsers';
// import Dashboard from './Dashboard';

const Placeholder = ({ title }) => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mb-2">{title}</p>
        <h2 className="text-2xl font-black text-white">{title}</h2>
        <p className="text-gray-500 text-sm mt-2">This section is under construction.</p>
    </div>
);

// ── Add pages here as you build them 
const PAGES = {
    'dashboard':      <Placeholder title="Dashboard" />,
    'kyc':            <KycDashboard title="KYC"/>,
    'disputes':       <Placeholder title="Disputes" />,
    'business-users': <Placeholder title="Business Users" />,
};

export default function Home() {
    const [activePage, setActivePage] = useState('dashboard');

    return (
        <div className="flex h-screen bg-black-100 overflow-hidden">
            <Sidebar activePage={activePage} onNavigate={setActivePage} />
            <main className="flex-1 overflow-y-auto">
                {PAGES[activePage]}
            </main>
        </div>
    );
}