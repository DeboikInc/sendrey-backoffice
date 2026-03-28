import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Star, Trash2, ShieldAlert, Bike, RefreshCw } from 'lucide-react';
import { getRunners, searchRunners, getRunnerStats, updateRunnerStatus, deleteRunner } from '../Redux/runnersSlice';
import debounce from 'lodash/debounce';

export default function RunnersList() {
    const dispatch = useDispatch();
   const { list: rawList, stats = {}, loading = false, error = null } = useSelector(state => state.runners || {});
const list = Array.isArray(rawList) ? rawList : [];
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshing, setRefreshing] = useState(false);  // ← local refresh state

    useEffect(() => {
        dispatch(getRunners());
        dispatch(getRunnerStats());
    }, [dispatch]);

    // ── Refresh handler (mirrors KYC handleRefresh) ──────────────────────────
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getRunners());
            await dispatch(getRunnerStats());
        } finally {
            setRefreshing(false);
        }
    };

   

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        delayedSearch(e.target.value);
    };
     const delayedSearch = useCallback(
        debounce((q) => dispatch(searchRunners(q)), 500),
        [handleSearch]
    );

    const handleToggleStatus = (id, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
        if (window.confirm(`Change runner status to ${newStatus}?`)) {
            dispatch(updateRunnerStatus({ runnerId: id, status: newStatus }));
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure? This action is permanent.")) {
            dispatch(deleteRunner(id));
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Stats Cards ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard label="Total Runners" value={stats.total} icon={<Bike />} color="text-primary" />
                <StatCard label="Active"         value={stats.active} icon={<Star />} color="text-green-400" />
                <StatCard label="Suspended"      value={stats.suspended} icon={<ShieldAlert />} color="text-red-400" />
            </div>

            {/* ── Error Banner (mirrors KYC error block) ──────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {/* ── Toolbar ─────────────────────────────────────────────────── */}
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearch}
                            placeholder="Search runners..."
                            className="w-full bg-black-200 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm outline-none focus:border-primary"
                        />
                    </div>

                    {/* Refresh button (mirrors KYC pattern, replaces bare icon) */}
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 rounded-lg text-sm font-bold disabled:opacity-50 ml-3"
                    >
                        <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* ── Table ───────────────────────────────────────────────────── */}
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-black">
                        <tr>
                            <th className="p-4">Runner</th>
                            <th className="p-4">Performance</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.map(runner => (
                            <tr key={runner._id} className="hover:bg-white/5 transition">
                                <td className="p-4">
                                    <div className="font-bold">{runner.firstName} {runner.lastName}</div>
                                    <div className="text-xs text-gray-500">{runner.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <Star size={14} fill="currentColor" /> {runner.rating || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-400">{runner.tripsCount || 0} Trips</div>
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => handleToggleStatus(runner._id, runner.status)}
                                        className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                            runner.status === 'Active'
                                                ? 'bg-green-500/10 text-green-400'
                                                : 'bg-red-500/10 text-red-400'
                                        }`}
                                    >
                                        {runner.status}
                                    </button>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(runner._id)}
                                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Loading State ────────────────────────────────────────────── */}
                {loading && (
                    <div className="p-8 text-center text-gray-500">
                        Loading runners...
                    </div>
                )}

                {/* ── Empty State ──────────────────────────────────────────────── */}
                {!loading && !error && list.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No runners found
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <div className={`mb-2 ${color}`}>{icon}</div>
            <div className="text-2xl font-black">{value ?? '—'}</div>
            <div className="text-xs text-gray-500 font-bold uppercase">{label}</div>
        </div>
    );
}