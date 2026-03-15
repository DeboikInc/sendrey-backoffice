// admin-dashboard/src/pages/DisputeCenter.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDisputes, resolveDispute } from '../Redux/disputeSlice';
import { AlertTriangle, Clock, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';

export default function DisputeCenter() {
    const dispatch = useDispatch();

   const { list: rawList, loading = false, error = null } = useSelector(state => state.dispute || {});
const list = Array.isArray(rawList) ? rawList : [];


    const [filter, setFilter] = useState('All');
    const [refreshing, setRefreshing] = useState(false);  // ← local refresh state

    useEffect(() => {
        dispatch(getAllDisputes());
    }, [dispatch]);

    // ── Refresh handler (mirrors KYC handleRefresh) ──────────────────────────
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getAllDisputes());
        } finally {
            setRefreshing(false);
        }
    };

    const handleResolve = (disputeId) => {
        const resolution = window.prompt("Enter resolution notes (e.g., 'Refund Issued'):");
        if (resolution) {
            dispatch(resolveDispute({
                disputeId,
                resolutionData: { status: 'Resolved', notes: resolution }
            }));
        }
    };

    const filteredDisputes = list.filter(d =>
        filter === 'All' ? true : d.status === filter
    );

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black italic">DISPUTE CENTER</h1>
                    <p className="text-gray-400 text-sm">Review and resolve order conflicts</p>

                    {/* Refresh button (mirrors KYC pattern) */}
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

                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-[10px] font-black uppercase">
                    {['All', 'Pending', 'Resolved'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-lg transition ${
                                filter === tab ? 'bg-primary text-white' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Error Banner (mirrors KYC error block) ──────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            )}

            {/* ── Loading Spinner ─────────────────────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-10">
                    <RefreshCw className="animate-spin text-primary" />
                </div>
            )}

            {/* ── Empty State ─────────────────────────────────────────────────── */}
            {!loading && !error && filteredDisputes.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-500 italic">No disputes found for this category.</p>
                </div>
            )}

            {/* ── Dispute Cards ───────────────────────────────────────────────── */}
            <div className="grid gap-4">
                {filteredDisputes.map((dispute) => (
                    <div key={dispute.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary/40 transition">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-4">
                                <div className={`p-3 rounded-xl ${dispute.status === 'Pending' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg">{dispute.type || 'Order Issue'}</h3>
                                        <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-400">
                                            ID: {dispute.orderId}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Raised by <span className="text-white font-medium">{dispute.reporterName}</span> against <span className="text-white font-medium">{dispute.againstName}</span>
                                    </p>
                                    <div className="flex items-center gap-4 mt-4 text-[10px] font-bold uppercase text-gray-500">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {dispute.createdAt}</span>
                                        <span className="flex items-center gap-1 text-primary"><MessageSquare size={12} /> {dispute.messagesCount || 0} MESSAGES</span>
                                    </div>
                                </div>
                            </div>

                            {dispute.status === 'Pending' && (
                                <button
                                    onClick={() => handleResolve(dispute.id)}
                                    className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-xs font-black hover:bg-primary hover:text-white transition"
                                >
                                    RESOLVE CASE
                                </button>
                            )}

                            {dispute.status === 'Resolved' && (
                                <div className="flex items-center gap-1 text-green-400 text-xs font-black uppercase">
                                    <CheckCircle size={16} /> Resolved
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}