// admin-dashboard/src/pages/PayoutManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPayoutReceipts, reviewReceipt } from '../Redux/payoutSlice';
import { FileText, Eye, Check, X, RefreshCw, Clock } from 'lucide-react';

export default function PayoutManagement() {
    const dispatch = useDispatch();
    const { receipts: rawReceipts, count = 0, loading = false, error = null } = useSelector(state => state.payout || state.payouts || {});
    const receipts = Array.isArray(rawReceipts) ? rawReceipts : [];

    const [refreshing, setRefreshing] = useState(false);
    const [previewId, setPreviewId] = useState(null);
    useEffect(() => {
    if (receipts.length > 0) {
        console.log('payoutId value:', receipts[0].payoutId);
        console.log('Full receipt:', JSON.stringify(receipts[0], null, 2));
    }
}, [receipts]);

    useEffect(() => { dispatch(getPayoutReceipts()); }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getPayoutReceipts());
        } finally {
            setRefreshing(false);
        }
    };

    // Derived counts for stat pills
    const pendingCount  = receipts.filter(r => r.status === 'pending').length;
    const approvedCount = receipts.filter(r => r.status === 'approved').length;

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black italic">PAYOUT RECEIPTS</h1>
                    <p className="text-gray-400 text-sm">Review and approve runner payout receipts</p>

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

                {/* Stat pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                        <Clock size={12} className="text-yellow-400" />
                        <span className="text-[11px] font-bold text-yellow-400">{pendingCount} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-400/10 border border-green-400/20">
                        <Check size={12} className="text-green-400" />
                        <span className="text-[11px] font-bold text-green-400">{approvedCount} Approved</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <FileText size={12} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-400">{count} Total</span>
                    </div>
                </div>
            </div>

            {/* ── Error Banner ────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                    Error: {typeof error === 'string' ? error : 'Failed to load receipts'}
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
                    <FileText size={32} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-500 italic">No payout receipts found.</p>
                </div>
            )}

            {/* ── Receipt Cards ───────────────────────────────────────────────── */}
            <div className="grid gap-4">
                {receipts.map(receipt => (
                    <div
                        key={receipt.receiptId} // ✅ server uses receiptId, not _id
                        className={`bg-white/5 border rounded-2xl p-4 sm:p-5 transition
                            ${receipt.status === 'pending'
                                ? 'border-yellow-500/20 hover:border-yellow-500/40'
                                : receipt.status === 'approved'
                                ? 'border-green-500/20 hover:border-green-500/30'
                                : 'border-white/10 hover:border-white/20'}`}
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            {/* ── Left: icon + details ─────────────────────── */}
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl shrink-0
                                    ${receipt.status === 'pending'
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : receipt.status === 'approved'
                                        ? 'bg-green-500/10 text-green-400'
                                        : 'bg-primary/10 text-primary'}`}>
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    {/* Vendor / runner name */}
                                    <p className="font-bold text-sm truncate">
                                        {receipt.vendorName || receipt.runnerName || '—'}
                                    </p>

                                    {/* Amount + Ref ✅ using correct field names from server */}
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Amount: &#x20A6;{receipt.amountSpent?.toLocaleString() ?? '—'}
                                        {receipt.changeAmount != null && (
                                            <span className="ml-2 text-green-400">
                                                Change: &#x20A6;{receipt.changeAmount.toLocaleString()}
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-0.5 font-mono">
                                        Ref: {receipt.receiptId ?? '—'}
                                    </p>

                                    {/* Status badge */}
                                    <span className={`inline-block mt-1.5 text-[10px] font-black uppercase px-2 py-0.5 rounded
                                        ${receipt.status === 'pending'
                                            ? 'bg-yellow-400/10 text-yellow-400'
                                            : receipt.status === 'approved'
                                            ? 'bg-green-400/10 text-green-400'
                                            : 'bg-red-400/10 text-red-400'}`}>
                                        {receipt.status}
                                    </span>
                                </div>
                            </div>

                            {/* ── Right: action buttons ────────────────────── */}
                            <div className="flex items-center gap-2 sm:shrink-0">
                                {/* Preview — placeholder for future modal */}
                                <button
                                    onClick={() => setPreviewId(receipt.receiptId)}
                                    className="p-2 bg-white/5 rounded-lg hover:text-primary transition-colors"
                                    title="Preview"
                                >
                                    <Eye size={16} />
                                </button>

                                {/* Only show approve/reject on pending receipts */}
                                {receipt.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => dispatch(reviewReceipt({
                                                payoutId:  receipt.payoutId,
                                                receiptId: receipt.receiptId, // ✅
                                                action:    'approve'
                                            }))}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition text-xs font-bold"
                                            title="Approve"
                                        >
                                            <Check size={14} /> Approve
                                        </button>
                                        <button
                                            onClick={() => dispatch(reviewReceipt({
                                                payoutId:  receipt.payoutId,
                                                receiptId: receipt.receiptId, // ✅
                                                action:    'reject'
                                            }))}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition text-xs font-bold"
                                            title="Reject"
                                        >
                                            <X size={14} /> Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}