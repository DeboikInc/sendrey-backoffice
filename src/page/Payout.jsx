// pages/PayoutManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPayoutReceipts, reviewReceipt } from '../Redux/payoutSlice';
import {
    FileText, Check, X, RefreshCw, Clock,
    ChevronDown, ChevronUp, User, Bike, CreditCard
} from 'lucide-react';

function ReceiptCard({ receipt, onApprove, onReject }) {
    const [expanded, setExpanded] = useState(false);

    const isPending  = receipt.status === 'pending';
    const isApproved = receipt.status === 'approved';
    //const isRejected = receipt.status === 'rejected';

    const borderClass = isPending  ? 'border-orange/20  hover:border-orange/40'
                      : isApproved ? 'border-purple/20  hover:border-purple/30'
                      :              'border-crimson/20 hover:border-crimson/30';

    const pillClass   = isPending  ? 'text-orange  bg-orange/10  border-orange/20'
                      : isApproved ? 'text-purple  bg-purple/10  border-purple/20'
                      :              'text-crimson bg-crimson/10 border-crimson/20';

    return (
        <div className={`bg-white/5 border rounded-2xl transition-all ${borderClass}`}>
            {/* Main row */}
            <div
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                onClick={() => setExpanded(e => !e)}
            >
                {/* Icon */}
                <div className={`p-3 rounded-xl shrink-0 self-start
                    ${isPending ? 'bg-orange/10 text-orange' : isApproved ? 'bg-purple/10 text-purple' : 'bg-crimson/10 text-crimson'}`}>
                    <FileText size={20} />
                </div>

                {/* Core details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                            <p className="font-bold text-sm text-white/90">
                                {receipt.vendorName || '—'}
                            </p>
                            <p className="text-xs text-white/40 mt-0.5 font-mono">
                                {receipt.orderId}
                            </p>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border shrink-0 ${pillClass}`}>
                            {receipt.status}
                        </span>
                    </div>

                    {/* Key numbers */}
                    <div className="flex flex-wrap gap-3 mt-2">
                        <span className="text-xs text-white/70 font-bold">
                            Spent: &#x20A6;{receipt.amountSpent?.toLocaleString() ?? '—'}
                        </span>
                        {receipt.changeAmount > 0 && (
                            <span className="text-xs text-purple font-bold">
                                Change: &#x20A6;{receipt.changeAmount?.toLocaleString()}
                            </span>
                        )}
                        <span className="text-xs text-white/40">
                            Budget: &#x20A6;{receipt.itemBudget?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-white/30">
                            {new Date(receipt.submittedAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                        <>
                            <button
                                onClick={e => { e.stopPropagation(); onApprove(); }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-purple/10 text-purple rounded-lg hover:bg-purple/20 transition text-xs font-bold border border-purple/20"
                            >
                                <Check size={13} /> Approve
                            </button>
                            <button
                                onClick={e => { e.stopPropagation(); onReject(); }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-crimson/10 text-crimson rounded-lg hover:bg-crimson/20 transition text-xs font-bold border border-crimson/20"
                            >
                                <X size={13} /> Reject
                            </button>
                        </>
                    )}
                    <button
                        onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                        className="p-2 bg-white/5 rounded-lg hover:text-orange text-white/40 transition-colors border border-white/10"
                    >
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>
            </div>

            {/* Expanded detail panel */}
            {expanded && (
                <div className="border-t border-white/5 px-4 sm:px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* Runner info */}
                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Bike size={12} className="text-orange" />
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Runner</p>
                        </div>
                        {receipt.runner ? (
                            <>
                                <p className="text-xs text-white/80 font-medium">{receipt.runner.firstName}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{receipt.runner.email}</p>
                                <p className="text-[10px] text-white/40">{receipt.runner.phone}</p>
                            </>
                        ) : (
                            <p className="text-[10px] text-white/25 italic">Not available</p>
                        )}
                    </div>

                    {/* User info */}
                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <User size={12} className="text-orange" />
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Customer</p>
                        </div>
                        {receipt.user ? (
                            <>
                                <p className="text-xs text-white/80 font-medium">{receipt.user.firstName}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{receipt.user.phone}</p>
                            </>
                        ) : (
                            <p className="text-[10px] text-white/25 italic">Not available</p>
                        )}
                    </div>

                    {/* Bank details */}
                    <div className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <CreditCard size={12} className="text-orange" />
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Bank Details</p>
                        </div>
                        {receipt.bankDetails ? (
                            <>
                                <p className="text-xs text-white/80 font-medium">{receipt.bankDetails.accountName}</p>
                                <p className="text-[10px] text-white/50 mt-0.5">{receipt.bankDetails.bankName}</p>
                                <p className="text-[10px] text-white/40 font-mono">{receipt.bankDetails.accountNumber}</p>
                            </>
                        ) : (
                            <p className="text-[10px] text-white/25 italic">No bank details</p>
                        )}
                    </div>

                    {/* Extra details row */}
                    <div className="sm:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            ['Receipt ID',    receipt.receiptId?.slice(-8)],
                            ['Payout Status', receipt.payoutStatus],
                            ['Submitted',     new Date(receipt.submittedAt).toLocaleString()],
                            ['Reviewed',      receipt.reviewedAt ? new Date(receipt.reviewedAt).toLocaleString() : '—'],
                        ].map(([k, v]) => (
                            <div key={k} className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                                <p className="text-[9px] text-white/30 uppercase tracking-widest">{k}</p>
                                <p className="text-[10px] text-white/60 mt-0.5 font-medium capitalize">{v}</p>
                            </div>
                        ))}
                    </div>

                    {/* Rejection reason */}
                    {receipt.rejectionReason && (
                        <div className="sm:col-span-3 px-3 py-2 rounded-lg bg-crimson/10 border border-crimson/20">
                            <p className="text-[10px] text-crimson">
                                Rejection reason: {receipt.rejectionReason}
                            </p>
                        </div>
                    )}

                    {/* Receipt image */}
                    {receipt.receiptUrl && (
                        <div className="sm:col-span-3">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Receipt Image</p>
                            <img
                                src={receipt.receiptUrl}
                                alt="Receipt"
                                className="w-full max-w-sm h-48 object-cover rounded-xl border border-white/10"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Payout() {
    const dispatch = useDispatch();
    const { receipts: rawReceipts, count = 0, loading = false, error = null } = useSelector(state => state.payout || state.payouts || {});
    const receipts = Array.isArray(rawReceipts) ? rawReceipts : [];

    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => { dispatch(getPayoutReceipts()); }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try { await dispatch(getPayoutReceipts()); }
        finally { setRefreshing(false); }
    };

    const pendingCount  = receipts.filter(r => r.status === 'pending').length;
    const approvedCount = receipts.filter(r => r.status === 'approved').length;
    const rejectedCount = receipts.filter(r => r.status === 'rejected').length;

    const filtered = statusFilter === 'all' ? receipts : receipts.filter(r => r.status === statusFilter);

    return (
        <div className="space-y-6">
            {/* Header */}
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
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange/10 border border-orange/20">
                        <Clock size={12} className="text-orange" />
                        <span className="text-[11px] font-bold text-orange">{pendingCount} Pending</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple/10 border border-purple/20">
                        <Check size={12} className="text-purple" />
                        <span className="text-[11px] font-bold text-purple">{approvedCount} Approved</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-crimson/10 border border-crimson/20">
                        <X size={12} className="text-crimson" />
                        <span className="text-[11px] font-bold text-crimson">{rejectedCount} Rejected</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                        <FileText size={12} className="text-gray-400" />
                        <span className="text-[11px] font-bold text-gray-400">{count} Total</span>
                    </div>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 flex-wrap">
                {['all', 'pending', 'approved', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all
                            ${statusFilter === s
                                ? 'bg-orange/10 text-orange border border-orange/20'
                                : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}
                    >
                        {s === 'all' ? `All (${receipts.length})` : s}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                    Error: {typeof error === 'string' ? error : 'Failed to load receipts'}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-10">
                    <RefreshCw className="animate-spin text-primary" />
                </div>
            )}

            {/* Empty */}
            {!loading && !error && filtered.length === 0 && (
                <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <FileText size={32} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-500 italic">No payout receipts found.</p>
                </div>
            )}

            {/* Receipt cards */}
            <div className="grid gap-4">
                {filtered.map(receipt => (
                    <ReceiptCard
                        key={receipt.receiptId}
                        receipt={receipt}
                        onApprove={() => dispatch(reviewReceipt({
                            payoutId:  receipt.payoutId,
                            receiptId: receipt.receiptId,
                            action:    'approve',
                        }))}
                        onReject={() => dispatch(reviewReceipt({
                            payoutId:  receipt.payoutId,
                            receiptId: receipt.receiptId,
                            action:    'reject',
                        }))}
                    />
                ))}
            </div>
        </div>
    );
}