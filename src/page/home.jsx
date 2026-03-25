import React, { useState } from 'react';
import Sidebar from '../components/sidebar';

// ── Import pages as you build them ──────────────────────────────────────────
//import KycDashboard from '../components/KycDashboard';
import Disputes from './DisputeCenter';
 import BusinessUsers from './BusinessUsers';
 import DashBoard from './DashBoard';
 import RunnersList from './RunnerList';
 import UsersList from './UserList';
 import OrdersList from './OrdersList';
 import PayoutManagement from './PayoutManagement';

 



// ── Add pages here as you build them 
const PAGES = {
    'dashboard':      <DashBoard title="Dashboard" />,
    'disputes':       <Disputes title="Disputes" />,
    'business-users': <BusinessUsers title="Business Users" />,
    'runner-list':    <RunnersList title="Runner List"/>,
    'users':       <UsersList title="User List" />,
    'orders':           <OrdersList title="Order List" />,
    'payout':         <PayoutManagement title="Payout List" />
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