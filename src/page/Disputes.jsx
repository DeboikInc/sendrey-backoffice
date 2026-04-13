// pages/Disputes.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDisputes, resolveDispute } from '../Redux/disputeSlice';
import {
    getCancelledEscrows, getEscrowDetails,
    refundToWallet, clearSelectedEscrow, clearRefundStatus
} from '../Redux/escrowSlice';
import {
    AlertTriangle, Clock, CheckCircle, MessageSquare,
    RefreshCw, Wallet, X, ShieldAlert
} from 'lucide-react';

// ── InfoRow helper ────────────────────────────────────────
function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between items-center py-1.5 border-b border-white/5 last:border-0">
            <span className="text-xs text-white/50">{label}</span>
            <span className="text-xs text-white font-medium capitalize">{value ?? '—'}</span>
        </div>
    );
}

// ── Escrow detail modal ───────────────────────────────────
function EscrowModal({ escrow, onClose, onRefund, refundStatus, refundError }) {
    const [reason, setReason] = useState('');
    const isRefunded = escrow.status === 'refunded';
    const isLoading  = refundStatus === 'loading';

    const user   = escrow.userId   || {};
    const runner = escrow.runnerId || {};
    const order  = escrow.orderId  || {};

    return (
        <div className="fixed inset-0 bg-black-200/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="w-full sm:max-w-lg sm:max-h-[88vh] max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-white/10 bg-black-100 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                    <div>
                        <h2 className="text-white font-bold text-sm">Escrow Review</h2>
                        <p className="text-white/40 text-[10px] font-mono mt-0.5">
                            {order.orderId ?? escrow.taskId ?? '—'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-crimson hover:border-crimson/30 transition-all"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'none' }}>

                    {/* Status banner */}
                    <div className={`px-4 py-3 rounded-xl border flex items-center gap-2
                        ${isRefunded
                            ? 'bg-purple/10 border-purple/30'
                            : 'bg-orange/10 border-orange/30'}`}>
                        {isRefunded
                            ? <CheckCircle size={14} className="text-purple shrink-0" />
                            : <ShieldAlert  size={14} className="text-orange shrink-0" />}
                        <span className={`text-xs font-bold uppercase tracking-wide ${isRefunded ? 'text-white' : 'text-white'}`}>
                            {isRefunded ? 'Already Refunded' : 'Pending Refund'}
                        </span>
                    </div>

                    {/* Financials */}
                    <div className="bg-black-200 rounded-xl border border-white/10 p-4">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Financials</p>
                        <InfoRow label="Total Amount"  value={`₦${escrow.totalAmount?.toLocaleString()}`} />
                        <InfoRow label="Item Budget"   value={`₦${escrow.itemBudget?.toLocaleString()}`} />
                        <InfoRow label="Delivery Fee"  value={`₦${escrow.deliveryFee?.toLocaleString()}`} />
                        <InfoRow label="Platform Fee"  value={`₦${escrow.platformFee?.toLocaleString()}`} />
                        <InfoRow label="Runner Payout" value={`₦${escrow.runnerPayout?.toLocaleString()}`} />
                    </div>

                    {/* User + Runner */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black-200 rounded-xl border border-white/10 p-4">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Customer</p>
                            <p className="text-sm text-white font-bold">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-white/50 mt-1">{user.email}</p>
                            <p className="text-xs text-white/50 mt-0.5">{user.phone}</p>
                        </div>
                        <div className="bg-black-200 rounded-xl border border-white/10 p-4">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Runner</p>
                            <p className="text-sm text-white font-bold">{runner.firstName} {runner.lastName}</p>
                            <p className="text-xs text-white/50 mt-1">{runner.email}</p>
                            <p className="text-xs text-white/50 mt-0.5">{runner.phone}</p>
                        </div>
                    </div>

                    {/* Order info */}
                    <div className="bg-black-200 rounded-xl border border-white/10 p-4">
                        <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-3">Order Info</p>
                        <InfoRow label="Task Type"     value={escrow.taskType} />
                        <InfoRow label="Order Status"  value={order.status} />
                        <InfoRow label="Cancel Reason" value={order.cancellationReason} />
                        <InfoRow label="Cancelled By"  value={order.cancelledBy} />
                        <InfoRow label="Escrow Status" value={escrow.status} />
                        <InfoRow label="Created"       value={new Date(escrow.createdAt).toLocaleString()} />
                    </div>

                    {/* Refund action */}
                    {!isRefunded && (
                        <div className="space-y-3">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Refund Reason</p>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Add a reason for the refund (optional)..."
                                rows={2}
                                className="w-full bg-black-200 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-orange/40 transition-colors resize-none"
                            />
                            {refundError && (
                                <p className="text-xs text-white bg-crimson/20 border border-crimson/30 px-3 py-2 rounded-lg">
                                    {refundError}
                                </p>
                            )}
                            <button
                                onClick={() => onRefund(escrow._id, reason)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-orange text-white font-bold text-sm hover:bg-orange/80 transition-all disabled:opacity-50"
                            >
                                {isLoading
                                    ? <><RefreshCw size={14} className="animate-spin" /> Processing...</>
                                    : <><Wallet size={14} /> Refund ₦{escrow.totalAmount?.toLocaleString()} to Wallet</>
                                }
                            </button>
                        </div>
                    )}

                    {/* Already refunded info */}
                    {isRefunded && escrow.metadata?.refundedAt && (
                        <div className="bg-black-200 rounded-xl border border-purple/20 p-4 space-y-2">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Refund Details</p>
                            <p className="text-sm text-white font-medium">
                                ₦{escrow.metadata.refundAmount?.toLocaleString()} refunded
                            </p>
                            <p className="text-xs text-white/50">
                                {new Date(escrow.metadata.refundedAt).toLocaleString()}
                            </p>
                            {escrow.metadata.refundReason && (
                                <p className="text-xs text-white/50">{escrow.metadata.refundReason}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/10 flex justify-end shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-bold hover:border-white/20 transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Escrow row card ───────────────────────────────────────
function EscrowRow({ escrow, onReview }) {
    const user     = escrow.userId  || {};
    const order    = escrow.orderId || {};
    const isRefunded = escrow.status === 'refunded';

    return (
        <div className={`bg-white/[0.03] border rounded-2xl p-5 transition-all
            ${isRefunded
                ? 'border-purple/20 hover:border-purple/40'
                : 'border-orange/20 hover:border-orange/40'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                {/* Left */}
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0
                        ${isRefunded ? 'bg-purple/10 text-purple' : 'bg-orange/10 text-orange'}`}>
                        {isRefunded ? <CheckCircle size={22} /> : <Wallet size={22} />}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="text-base text-white font-bold">
                                {user.firstName} {user.lastName}
                            </p>
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50">
                                {order.orderId ?? escrow.taskId}
                            </span>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border
                                ${isRefunded
                                    ? 'text-white bg-purple/20 border-purple/30'
                                    : 'text-white bg-orange/20 border-orange/30'}`}>
                                {isRefunded ? 'Refunded' : 'Pending'}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 mb-3">{user.email}</p>

                        {/* Financial summary */}
                        <div className="flex flex-wrap gap-4">
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-wide">Total</p>
                                <p className="text-sm text-white font-bold mt-0.5">
                                    &#x20A6;{escrow.totalAmount?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-wide">Budget</p>
                                <p className="text-sm text-white font-bold mt-0.5">
                                    &#x20A6;{escrow.itemBudget?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-wide">Delivery Fee</p>
                                <p className="text-sm text-white font-bold mt-0.5">
                                    &#x20A6;{escrow.deliveryFee?.toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-white/40 uppercase tracking-wide">Date</p>
                                <p className="text-xs text-white/60 mt-0.5">
                                    {new Date(escrow.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action button */}
                <button
                    onClick={() => onReview(escrow._id)}
                    className={`shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold border transition-all
                        ${isRefunded
                            ? 'bg-white/5 border-white/10 text-white hover:border-white/20'
                            : 'bg-orange text-white border-orange hover:bg-orange/80'}`}
                >
                    {isRefunded ? 'View Details' : 'Review & Refund'}
                </button>
            </div>
        </div>
    );
}

// ── Main Disputes page ────────────────────────────────────
export default function Disputes() {
    const dispatch = useDispatch();

    const { list: rawList, loading: dLoading = false, error: dError = null } =
        useSelector(state => state.dispute || {});
    const disputeList = Array.isArray(rawList) ? rawList : [];

    const {
        list: escrowList = [], refunded = [],
        selectedEscrow, status: eStatus, refundStatus, refundError,
    } = useSelector(state => state.escrow || {});

    const [tab, setTab]               = useState('disputes');
    const [filter, setFilter]         = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(getAllDisputes());
        dispatch(getCancelledEscrows());
    }, [dispatch]);

    useEffect(() => {
        if (refundStatus === 'succeeded') {
            setTimeout(() => dispatch(clearRefundStatus()), 2000);
        }
    }, [refundStatus, dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            if (tab === 'disputes') await dispatch(getAllDisputes());
            else await dispatch(getCancelledEscrows());
        } finally {
            setRefreshing(false);
        }
    };

    const handleResolve = (disputeId) => {
        const resolution = window.prompt("Enter resolution notes (e.g., 'Refund Issued'):");
        if (resolution) {
            dispatch(resolveDispute({ disputeId, resolutionData: { status: 'Resolved', notes: resolution } }));
        }
    };

    const filteredDisputes = disputeList.filter(d =>
        filter === 'All' ? true : d.status === filter
    );

    const pendingEscrows = escrowList.filter(e => e.status !== 'refunded');
    const allEscrows     = [...escrowList, ...refunded];

    const pendingDisputeCount = disputeList.filter(d => d.status === 'Pending').length;

    return (
        <div className="px-4 sm:px-6 py-8 space-y-6 min-h-full">

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-white text-2xl font-black italic">
                        {tab === 'disputes' ? 'DISPUTES' : 'ESCROW REFUNDS'}
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        {tab === 'disputes'
                            ? 'Review and resolve order conflicts'
                            : 'Refund cancelled order escrows to user wallets'}
                    </p>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || dLoading || eStatus === 'loading'}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange/80 disabled:opacity-50 transition-all"
                    >
                        <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 gap-1 self-start">
                    <button
                        onClick={() => setTab('disputes')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all
                            ${tab === 'disputes' ? 'bg-orange text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        <ShieldAlert size={14} /> Disputes
                        {pendingDisputeCount > 0 && (
                            <span className="bg-crimson text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingDisputeCount}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('escrows')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all
                            ${tab === 'escrows' ? 'bg-orange text-white' : 'text-white/50 hover:text-white'}`}
                    >
                        <Wallet size={14} /> Escrow Refunds
                        {pendingEscrows.length > 0 && (
                            <span className="bg-crimson text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingEscrows.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── DISPUTES TAB ─────────────────────────── */}
            {tab === 'disputes' && (
                <>
                    {/* Filter tabs */}
                    <div className="flex gap-2 flex-wrap">
                        {['All', 'Pending', 'Resolved'].map(t => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-all border
                                    ${filter === t
                                        ? 'bg-orange text-white border-orange'
                                        : 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:border-white/20'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {dError && (
                        <div className="bg-crimson/10 border border-crimson/30 text-white px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertTriangle size={15} className="text-crimson shrink-0" /> {dError}
                        </div>
                    )}

                    {dLoading && (
                        <div className="flex justify-center py-16">
                            <RefreshCw className="animate-spin text-orange" size={22} />
                        </div>
                    )}

                    {!dLoading && filteredDisputes.length === 0 && (
                        <div className="text-center py-20 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
                            <AlertTriangle size={28} className="text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">No disputes found.</p>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {filteredDisputes.map(dispute => (
                            <div
                                key={dispute._id}
                                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-orange/30 transition-all"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div className="flex gap-4">
                                        {/* Icon */}
                                        <div className={`p-3 rounded-xl shrink-0
                                            ${dispute.status === 'Pending'
                                                ? 'bg-crimson/10 text-crimson'
                                                : 'bg-purple/10 text-purple'}`}>
                                            <AlertTriangle size={22} />
                                        </div>

                                        {/* Info */}
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="text-white font-bold text-base">
                                                    {dispute.type || 'Order Issue'}
                                                </h3>
                                                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/50 font-mono">
                                                    {dispute.orderId}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/50 mt-1">
                                                Raised by{' '}
                                                <span className="text-white font-medium">{dispute.reporterName}</span>
                                                {' '}against{' '}
                                                <span className="text-white font-medium">{dispute.againstName}</span>
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-white/40">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={12} /> {dispute.createdAt}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-royal">
                                                    <MessageSquare size={12} />
                                                    {dispute.messagesCount || 0} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <div className="shrink-0">
                                        {dispute.status === 'Pending' && (
                                            <button
                                                onClick={() => handleResolve(dispute._id)}
                                                className="bg-orange text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-orange/80 transition-all"
                                            >
                                                Resolve Case
                                            </button>
                                        )}
                                        {dispute.status === 'Resolved' && (
                                            <div className="flex items-center gap-1.5 text-purple text-xs font-bold">
                                                <CheckCircle size={15} /> Resolved
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* ── ESCROWS TAB ──────────────────────────── */}
            {tab === 'escrows' && (
                <>
                    {/* Stats */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange/10 border border-orange/20">
                            <Wallet size={13} className="text-orange" />
                            <span className="text-xs font-bold text-white">{pendingEscrows.length} Pending Refunds</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple/10 border border-purple/20">
                            <CheckCircle size={13} className="text-purple" />
                            <span className="text-xs font-bold text-white">{refunded.length} Refunded</span>
                        </div>
                    </div>

                    {eStatus === 'failed' && (
                        <div className="bg-crimson/10 border border-crimson/30 text-white px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                            <AlertTriangle size={15} className="text-crimson shrink-0" /> Failed to load escrows
                        </div>
                    )}

                    {eStatus === 'loading' && (
                        <div className="flex justify-center py-16">
                            <RefreshCw className="animate-spin text-orange" size={22} />
                        </div>
                    )}

                    {eStatus !== 'loading' && allEscrows.length === 0 && (
                        <div className="text-center py-20 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
                            <Wallet size={28} className="text-white/20 mx-auto mb-3" />
                            <p className="text-white/40 text-sm">No cancelled order escrows found.</p>
                        </div>
                    )}

                    {/* Pending */}
                    {pendingEscrows.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                Pending Refunds ({pendingEscrows.length})
                            </p>
                            {pendingEscrows.map(e => (
                                <EscrowRow
                                    key={e._id}
                                    escrow={e}
                                    onReview={id => dispatch(getEscrowDetails(id))}
                                />
                            ))}
                        </div>
                    )}

                    {/* Refunded audit trail */}
                    {refunded.length > 0 && (
                        <div className="space-y-3 mt-6">
                            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
                                Recently Refunded ({refunded.length})
                            </p>
                            {refunded.map(e => (
                                <EscrowRow
                                    key={e._id}
                                    escrow={e}
                                    onReview={id => dispatch(getEscrowDetails(id))}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Escrow modal */}
            {selectedEscrow && (
                <EscrowModal
                    escrow={selectedEscrow}
                    onClose={() => dispatch(clearSelectedEscrow())}
                    onRefund={(escrowId, reason) => dispatch(refundToWallet({
                        escrowId,
                        reason: reason || 'Order cancelled — refund issued by admin',
                    }))}
                    refundStatus={refundStatus}
                    refundError={refundError}
                />
            )}
        </div>
    );
}