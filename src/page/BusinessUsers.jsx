// admin-dashboard/src/pages/BusinessDashboard.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBusinessAccounts, getSuggestions, convertToBusiness, revokeBusiness } from '../Redux/businessSlice';
import { UserPlus, RefreshCw } from 'lucide-react';

export default function BusinessDashboard() {
    const dispatch = useDispatch();
    const { accounts: rawAccounts, suggestions: rawSuggestions, loading = false, error = null } = useSelector(state => state.business || {});
    const accounts    = Array.isArray(rawAccounts)    ? rawAccounts    : [];
    const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];

    const [view, setView]           = useState('accounts');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(getBusinessAccounts());
        dispatch(getSuggestions());
    }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getBusinessAccounts());
            await dispatch(getSuggestions());
        } finally {
            setRefreshing(false);
        }
    };

    const activeList = view === 'accounts' ? accounts : suggestions;

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black italic">BUSINESS ECOSYSTEM</h1>
                    <p className="text-gray-400 text-sm">Manage corporate accounts and conversion leads</p>

                    <div className="flex items-center gap-3 mt-5">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing || loading}
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-bold disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button
                        onClick={() => setView('accounts')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${view === 'accounts' ? 'bg-primary text-white' : 'text-gray-400'}`}
                    >
                        Active Accounts ({accounts.length})
                    </button>
                    <button
                        onClick={() => setView('suggestions')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${view === 'suggestions' ? 'bg-primary text-white' : 'text-gray-400'}`}
                    >
                        Suggestions ({suggestions.length})
                    </button>
                </div>
            </div>

            {/* ── Error Banner ────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-black">
                        <tr>
                            <th className="p-4">Entity/User</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {activeList.map(item => (
                            <tr key={item._id} className="hover:bg-white/5 transition">
                                <td className="p-4">
                                    <div className="font-bold">{item.businessName || item.name}</div>
                                    <div className="text-xs text-gray-500">{item.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className="text-[10px] bg-white/10 px-2 py-1 rounded uppercase font-bold text-gray-400">
                                        {view === 'accounts' ? 'Corporate' : 'Lead'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {view === 'accounts' ? (
                                        <button
                                            onClick={() => dispatch(revokeBusiness(item._id))} // ✅ _id
                                            className="text-red-400 hover:text-red-300 text-xs font-bold transition-colors"
                                        >
                                            REVOKE
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => dispatch(convertToBusiness(item._id))} // ✅ _id
                                            className="flex items-center gap-1 ml-auto bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition"
                                        >
                                            <UserPlus size={14} /> CONVERT
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Loading State ────────────────────────────────────────────── */}
                {loading && (
                    <div className="p-8 text-center text-gray-500">
                        Loading {view === 'accounts' ? 'accounts' : 'suggestions'}...
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────────────── */}
                {!loading && !error && activeList.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No {view === 'accounts' ? 'business accounts' : 'suggestions'} found
                    </div>
                )}
            </div>
        </div>
    );
}