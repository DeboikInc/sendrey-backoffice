// admin-dashboard/src/pages/PayoutManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPayoutReceipts, reviewReceipt } from '../Redux/payoutSlice';
import { FileText, Eye, Check, X, RefreshCw } from 'lucide-react';

export default function PayoutManagement() {
    const dispatch = useDispatch();
   const { receipts: rawReceipts, loading = false, error = null } = useSelector(state => state.payout || state.payouts || {});
const receipts = Array.isArray(rawReceipts) ? rawReceipts : [];

    const [refreshing, setRefreshing] = useState(false);  // ← local refresh state

    useEffect(() => { dispatch(getPayoutReceipts()); }, [dispatch]);

    // ── Refresh handler (mirrors KYC handleRefresh) ──────────────────────────
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getPayoutReceipts());
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black italic">PAYOUT RECEIPTS</h1>
                    <p className="text-gray-400 text-sm">Review and approve runner payout receipts</p>

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
            </div>

            {/* ── Error Banner (mirrors KYC error block) ──────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    Error: {error}
                </div>
            )}

            {/* ── Loading State ───────────────────────────────────────────────── */}
            {loading && (
                <div className="flex justify-center py-10">
                    <RefreshCw className="animate-spin text-primary" />
                </div>
            )}

            {/* ── Empty State ─────────────────────────────────────────────────── */}
            {!loading && !error && receipts.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-500 italic">No payout receipts found.</p>
                </div>
            )}

            {/* ── Receipt Cards ───────────────────────────────────────────────── */}
            <div className="grid gap-4">
                {receipts.map(receipt => (
                    <div key={receipt.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                <FileText />
                            </div>
                            <div>
                                <p className="font-bold">Runner: {receipt.runnerName}</p>
                                <p className="text-xs text-gray-500">
                                    Amount: ₦{receipt.amount} • Ref: {receipt.reference}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/5 rounded-lg hover:text-primary">
                                <Eye size={18} />
                            </button>
                            <button
                                onClick={() => dispatch(reviewReceipt({
                                    payoutId: receipt.payoutId,
                                    receiptId: receipt.id,
                                    status: 'approved'
                                }))}
                                className="p-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition"
                            >
                                <Check size={18} />
                            </button>
                            <button
                                onClick={() => dispatch(reviewReceipt({
                                    payoutId: receipt.payoutId,
                                    receiptId: receipt.id,
                                    status: 'rejected'
                                }))}
                                className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}