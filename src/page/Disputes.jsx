// pages/Disputes.jsx
import  { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDisputes, resolveDispute } from '../Redux/disputeSlice';
import {
    getCancelledEscrows, getEscrowDetails,
    refundToWallet, clearSelectedEscrow, clearRefundStatus
} from '../Redux/escrowSlice';
import {
    AlertTriangle, Clock, CheckCircle, MessageSquare,
    RefreshCw, Wallet, X,
    ShieldAlert
} from 'lucide-react';

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
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
                    <div>
                        <h2 className="text-white font-bold text-sm">Escrow Review</h2>
                        <p className="text-white/40 text-[10px] font-mono mt-0.5">{order.orderId ?? escrow.taskId}</p>
                    </div>
                    <button onClick={onClose}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-crimson hover:border-crimson/30 transition-all">
                        <X size={14} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ scrollbarWidth: 'none' }}>

                    {/* Status banner */}
                    <div className={`px-4 py-3 rounded-xl border flex items-center gap-2
                        ${isRefunded
                            ? 'bg-purple/10 border-purple/20 text-purple'
                            : 'bg-orange/10 border-orange/20 text-orange'}`}>
                        {isRefunded ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                        <span className="text-xs font-bold uppercase tracking-wide">
                            {isRefunded ? 'Already Refunded' : 'Pending Refund'}
                        </span>
                    </div>

                    {/* Financials */}
                    <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">Financials</p>
                        <div className="space-y-1.5">
                            {[
                                ['Total Amount',   `₦${escrow.totalAmount?.toLocaleString()}`],
                                ['Item Budget',    `₦${escrow.itemBudget?.toLocaleString()}`],
                                ['Delivery Fee',   `₦${escrow.deliveryFee?.toLocaleString()}`],
                                ['Platform Fee',   `₦${escrow.platformFee?.toLocaleString()}`],
                                ['Runner Payout',  `₦${escrow.runnerPayout?.toLocaleString()}`],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <span className="text-[10px] text-white/40">{k}</span>
                                    <span className="text-[10px] text-white/70 font-medium">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User + Runner */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-xl border border-white/5 p-3">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Customer</p>
                            <p className="text-xs text-white/80 font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{user.email}</p>
                            <p className="text-[10px] text-white/40">{user.phone}</p>
                        </div>
                        <div className="bg-white/5 rounded-xl border border-white/5 p-3">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Runner</p>
                            <p className="text-xs text-white/80 font-medium">{runner.firstName} {runner.lastName}</p>
                            <p className="text-[10px] text-white/40 mt-0.5">{runner.email}</p>
                            <p className="text-[10px] text-white/40">{runner.phone}</p>
                        </div>
                    </div>

                    {/* Order info */}
                    <div className="bg-white/5 rounded-xl border border-white/5 p-4">
                        <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">Order Info</p>
                        <div className="space-y-1.5">
                            {[
                                ['Task Type',      escrow.taskType],
                                ['Order Status',   order.status],
                                ['Cancel Reason',  order.cancellationReason ?? '—'],
                                ['Cancelled By',   order.cancelledBy ?? '—'],
                                ['Escrow Status',  escrow.status],
                                ['Created',        new Date(escrow.createdAt).toLocaleString()],
                            ].map(([k, v]) => (
                                <div key={k} className="flex justify-between">
                                    <span className="text-[10px] text-white/40">{k}</span>
                                    <span className="text-[10px] text-white/70 font-medium capitalize">{v}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Refund action */}
                    {!isRefunded && (
                        <div className="space-y-2">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Refund Reason</p>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="Add a reason for the refund (optional)..."
                                rows={2}
                                className="w-full bg-black-100 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/25 outline-none focus:border-orange/40 transition-colors resize-none"
                            />
                            {refundError && (
                                <p className="text-xs text-crimson">{refundError}</p>
                            )}
                            <button
                                onClick={() => onRefund(escrow._id, reason)}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange/10 border border-orange/20 text-orange font-bold text-sm hover:bg-orange/20 transition-all disabled:opacity-50"
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
                        <div className="px-4 py-3 rounded-xl bg-purple/10 border border-purple/20 space-y-1">
                            <p className="text-[9px] text-white/30 uppercase tracking-widest">Refund Details</p>
                            <p className="text-xs text-white/70">
                                ₦{escrow.metadata.refundAmount?.toLocaleString()} refunded on{' '}
                                {new Date(escrow.metadata.refundedAt).toLocaleString()}
                            </p>
                            {escrow.metadata.refundReason && (
                                <p className="text-[10px] text-white/40">{escrow.metadata.refundReason}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-4 border-t border-white/5 flex justify-end shrink-0">
                    <button onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:border-white/20 transition-all">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Escrow row ────────────────────────────────────────────
function EscrowRow({ escrow, onReview }) {
    const user  = escrow.userId  || {};
    const order = escrow.orderId || {};
    const isRefunded = escrow.status === 'refunded';

    return (
        <div className={`bg-white/[0.03] border rounded-2xl p-5 transition-all
            ${isRefunded ? 'border-purple/20' : 'border-orange/20 hover:border-orange/40'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl shrink-0
                        ${isRefunded ? 'bg-purple/10 text-purple' : 'bg-orange/10 text-orange'}`}>
                        {isRefunded ? <CheckCircle size={20} /> : <Wallet size={20} />}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-white/80 font-semibold text-sm">
                                {user.firstName} {user.lastName}
                            </p>
                            <span className="text-[10px] font-mono bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40">
                                {order.orderId ?? escrow.taskId}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border
                                ${isRefunded
                                    ? 'text-purple bg-purple/10 border-purple/20'
                                    : 'text-orange bg-orange/10 border-orange/20'}`}>
                                {isRefunded ? 'Refunded' : 'Pending'}
                            </span>
                        </div>
                        <p className="text-white/40 text-xs mt-1">{user.email}</p>
                        <div className="flex flex-wrap gap-3 mt-2 text-[11px] text-white/30">
                            <span>Total: <span className="text-white/60 font-medium">₦{escrow.totalAmount?.toLocaleString()}</span></span>
                            <span>Budget: <span className="text-white/60 font-medium">₦{escrow.itemBudget?.toLocaleString()}</span></span>
                            <span>Fee: <span className="text-white/60 font-medium">₦{escrow.deliveryFee?.toLocaleString()}</span></span>
                            <span className="flex items-center gap-1">
                                <Clock size={10} /> {new Date(escrow.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onReview(escrow._id)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs font-semibold border transition-all
                        ${isRefunded
                            ? 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                            : 'bg-orange/10 border-orange/20 text-orange hover:bg-orange hover:text-white'}`}
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

    // Disputes state
    const { list: rawList, loading: dLoading = false, error: dError = null } =
        useSelector(state => state.dispute || {});
    const disputeList = Array.isArray(rawList) ? rawList : [];

    // Escrow state
    const {
        list: escrowList = [], refunded = [],
        selectedEscrow, status: eStatus, refundStatus, refundError
    } = useSelector(state => state.escrow || {});

    const [tab, setTab]           = useState('disputes');
    const [filter, setFilter]     = useState('All');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(getAllDisputes());
        dispatch(getCancelledEscrows());
    }, [dispatch]);

    // Close modal and show success after refund
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

    const handleReview = (escrowId) => {
        dispatch(getEscrowDetails(escrowId));
    };

    const handleRefund = (escrowId, reason) => {
        dispatch(refundToWallet({ escrowId, reason: reason || 'Order cancelled — refund issued by admin' }));
    };

    const filteredDisputes = disputeList.filter(d =>
        filter === 'All' ? true : d.status === filter
    );

    const pendingEscrows  = escrowList.filter(e => e.status !== 'refunded');
    const allEscrows      = [...escrowList, ...refunded];

    return (
        <div className="px-4 sm:px-6 py-8 space-y-6 bg-navy min-h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-white text-xl font-bold tracking-tight">
                        {tab === 'disputes' ? 'Disputes' : 'Escrow Refunds'}
                    </h1>
                    <p className="text-white/40 text-sm mt-1">
                        {tab === 'disputes'
                            ? 'Review and resolve order conflicts'
                            : 'Refund cancelled order escrows to user wallets'}
                    </p>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing || dLoading || eStatus === 'loading'}
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/80 disabled:opacity-50 transition-all"
                    >
                        <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Tab switcher */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium self-start gap-0.5">
                    <button
                        onClick={() => setTab('disputes')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                            ${tab === 'disputes' ? 'bg-orange text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        <ShieldAlert size={13} /> Disputes
                        {disputeList.filter(d => d.status === 'Pending').length > 0 && (
                            <span className="bg-crimson text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {disputeList.filter(d => d.status === 'Pending').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setTab('escrows')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                            ${tab === 'escrows' ? 'bg-orange text-white' : 'text-white/40 hover:text-white'}`}
                    >
                        <Wallet size={13} /> Escrow Refunds
                        {pendingEscrows.length > 0 && (
                            <span className="bg-crimson text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                {pendingEscrows.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* ── DISPUTES TAB ─────────────────────────────── */}
            {tab === 'disputes' && (
                <>
                    {/* Filter + error */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium gap-0.5">
                            {['All', 'Pending', 'Resolved'].map(t => (
                                <button key={t} onClick={() => setFilter(t)}
                                    className={`px-4 py-2 rounded-lg transition-all
                                        ${filter === t ? 'bg-orange text-white' : 'text-white/40 hover:text-white'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {dError && (
                        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangle size={15} /> {dError}
                        </div>
                    )}

                    {dLoading && <div className="flex justify-center py-16"><RefreshCw className="animate-spin text-orange" size={22} /></div>}

                    {!dLoading && filteredDisputes.length === 0 && (
                        <div className="text-center py-20 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
                            <AlertTriangle size={28} className="text-white/20 mx-auto mb-3" />
                            <p className="text-white/30 text-sm">No disputes found.</p>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {filteredDisputes.map(dispute => (
                            <div key={dispute._id}
                                className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-orange/30 transition-all">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                                    <div className="flex gap-4">
                                        <div className={`p-3 rounded-xl shrink-0
                                            ${dispute.status === 'Pending' ? 'bg-crimson/10 text-crimson' : 'bg-purple/10 text-purple'}`}>
                                            <AlertTriangle size={22} />
                                        </div>
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-white font-semibold text-base">{dispute.type || 'Order Issue'}</h3>
                                                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 font-mono">
                                                    {dispute.orderId}
                                                </span>
                                            </div>
                                            <p className="text-sm text-white/40 mt-1.5">
                                                Raised by <span className="text-white/80 font-medium">{dispute.reporterName}</span>
                                                {' '}against <span className="text-white/80 font-medium">{dispute.againstName}</span>
                                            </p>
                                            <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-medium text-white/30">
                                                <span className="flex items-center gap-1.5"><Clock size={12} />{dispute.createdAt}</span>
                                                <span className="flex items-center gap-1.5 text-royal">
                                                    <MessageSquare size={12} />{dispute.messagesCount || 0} messages
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        {dispute.status === 'Pending' && (
                                            <button onClick={() => handleResolve(dispute._id)}
                                                className="bg-orange/10 text-orange border border-orange/20 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-orange hover:text-white transition-all">
                                                Resolve case
                                            </button>
                                        )}
                                        {dispute.status === 'Resolved' && (
                                            <div className="flex items-center gap-1.5 text-purple text-xs font-semibold">
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

            {/* ── ESCROWS TAB ───────────────────────────────── */}
            {tab === 'escrows' && (
                <>
                    {/* Stats */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange/10 border border-orange/20">
                            <Wallet size={12} className="text-orange" />
                            <span className="text-[11px] font-bold text-orange">{pendingEscrows.length} Pending Refunds</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple/10 border border-purple/20">
                            <CheckCircle size={12} className="text-purple" />
                            <span className="text-[11px] font-bold text-purple">{refunded.length} Refunded</span>
                        </div>
                    </div>

                    {eStatus === 'failed' && (
                        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangle size={15} /> Failed to load escrows
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
                            <p className="text-white/30 text-sm">No cancelled order escrows found.</p>
                        </div>
                    )}

                    {/* Pending refunds */}
                    {pendingEscrows.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest">Pending Refunds ({pendingEscrows.length})</p>
                            {pendingEscrows.map(e => (
                                <EscrowRow key={e._id} escrow={e} onReview={handleReview} />
                            ))}
                        </div>
                    )}

                    {/* Already refunded */}
                    {refunded.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">Recently Refunded ({refunded.length})</p>
                            {refunded.map(e => (
                                <EscrowRow key={e._id} escrow={e} onReview={handleReview} />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Escrow detail modal */}
            {selectedEscrow && (
                <EscrowModal
                    escrow={selectedEscrow}
                    onClose={() => dispatch(clearSelectedEscrow())}
                    onRefund={handleRefund}
                    refundStatus={refundStatus}
                    refundError={refundError}
                />
            )}
        </div>
    );
}