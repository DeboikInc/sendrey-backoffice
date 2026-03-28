import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/sidebar';

import Disputes from './Disputes';
import BusinessUsers from './BusinessUsers';
import DashBoard from './DashBoard';
import RunnersList from './RunnerList';
import UsersList from './UserList';
import OrdersList from './OrdersList';
import PayoutManagement from './Payout';

const PAGES = {
  'dashboard':      <DashBoard title="Dashboard" />,
  'disputes':       <Disputes title="Disputes" />,
  'business-users': <BusinessUsers title="Business Users" />,
  'runner-list':    <RunnersList title="Runner List" />,
  'users':          <UsersList title="User List" />,
  'orders':         <OrdersList title="Order List" />,
  'payout':         <PayoutManagement title="Payout List" />,
};

export default function Home() {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-navy border-b border-white/5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-bold text-white capitalize">
            {activePage.replace('-', ' ')}
          </span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {PAGES[activePage]}
        </main>
      </div>
    </div>
  );
}