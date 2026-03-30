import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Briefcase, Users, LogOut,
  LayoutDashboard, Package, CreditCard, X
} from 'lucide-react';
import { adminLogout } from '../Redux/authSlice';
import logo from '../assets/Sendrey-Logo-Variants-09.png';

const NAV_ITEMS = [
  { label: 'KYC',      key: 'dashboard',     icon: LayoutDashboard },
  { label: 'Disputes',       key: 'disputes',       icon: AlertTriangle },
  { label: 'Business Users', key: 'business-users', icon: Briefcase },
  { label: 'Users',          key: 'users',          icon: Users },
  { label: 'Runners',        key: 'runner-list',    icon: Users },
  { label: 'Orders',         key: 'orders',         icon: Package },
  { label: 'Payouts',        key: 'payout',         icon: CreditCard },
];

export default function Sidebar({ activePage, onNavigate, open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(adminLogout());
    navigate('/');
  };

  const handleNav = (key) => {
    onNavigate(key);
    onClose?.();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-navy border-r border-white/5
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 lg:flex lg:z-auto
      `}>
        <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
          <div>
            <img src={logo} alt="sendrey logo" className="w-2/3 mb-1" />
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange">Admin</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleNav(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive
                    ? 'bg-orange text-white'
                    : 'text-white/50 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-crimson/80 hover:bg-crimson/20 hover:text-crimson transition-all"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}