import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, Briefcase, Users, LogOut, Package,CreditCard } from 'lucide-react';
import { adminLogout } from '../Redux/authSlice';

const NAV_ITEMS = [
    { label: 'KYC', key: 'kyc', icon: ShieldCheck },
    { label: 'Disputes', key: 'disputes', icon: AlertTriangle },
    { label: 'Business Users', key: 'business-users', icon: Briefcase },
    { label: 'Users ', key: 'users', icon: Users },
    { label: 'Runners', key: 'runner-list', icon: Users },
    { label: 'Order', key: 'orders', icon: Package },
    { label: 'Payouts', key: 'payout', icon: CreditCard },
];

export default function Sidebar({ activePage, onNavigate }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(adminLogout());
        navigate('/');
    };

    return (
        <aside className="h-screen w-64 flex-shrink-0 flex flex-col bg-black-200 border-r border-white/5">

            {/* Brand */}
            <div className="px-6 py-6 border-b border-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Sendrey Admin</p>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.key;

                    return (
                        <button
                            key={item.key}
                            onClick={() => onNavigate(item.key)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                                ${isActive
                                    ? 'bg-primary text-white'
                                    : 'text-gray-500 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="px-3 py-4 border-t border-white/5">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </aside>
    );
}