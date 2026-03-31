// pages/OrdersList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../Redux/orderSlice';
import {
    CheckCircle, Clock, RefreshCw, ShoppingBag,
    XCircle, ChevronDown, ChevronUp, AlertTriangle,
    MapPin, Bike,
} from 'lucide-react';

const STATUS_CONFIG = {
    completed:       { color: 'text-purple  bg-purple/10  border-purple/20',  icon: CheckCircle },
    paid:            { color: 'text-royal   bg-royal/10   border-royal/20',   icon: CheckCircle },
    delivered:       { color: 'text-purple  bg-purple/10  border-purple/20',  icon: CheckCircle },
    items_approved:  { color: 'text-purple  bg-purple/10  border-purple/20',  icon: CheckCircle },
    items_submitted: { color: 'text-orange  bg-orange/10  border-orange/20',  icon: Clock       },
    pending_payment: { color: 'text-orange  bg-orange/10  border-orange/20',  icon: Clock       },
    cancelled:       { color: 'text-crimson bg-crimson/10 border-crimson/20', icon: XCircle     },
    disputed:        { color: 'text-crimson bg-crimson/10 border-crimson/20', icon: AlertTriangle },
};

function StatusPill({ status }) {
    const cfg = STATUS_CONFIG[status] || { color: 'text-white/40 bg-white/5 border-white/10', icon: Clock };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${cfg.color}`}>
            <Icon size={10} /> {status?.replace(/_/g, ' ')}
        </span>
    );
}

function OrderRow({ order }) {
    const [expanded, setExpanded] = useState(false);

    const customer = order.userId;
    const runner   = order.runnerId;
    const location = order.deliveryLocation?.address || order.marketLocation?.address || '—';

    return (
        <>
            <tr
                className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                onClick={() => setExpanded(e => !e)}
            >
                {/* Order ID */}
                <td className="px-4 py-3.5">
                    <p className="text-xs font-mono text-orange">{order.orderId}</p>
                    <p className="text-[9px] text-white/30 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                </td>

                {/* Customer */}
                <td className="px-4 py-3.5">
                    <p className="text-xs text-white/80 font-medium">{customer?.firstName ?? '—'}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{customer?.phone}</p>
                </td>

                {/* Runner */}
                <td className="px-4 py-3.5">
                    <p className="text-xs text-white/80 font-medium">{runner?.firstName ?? '—'}</p>
                    <p className="text-[10px] text-white/40 mt-0.5">{runner?.phone}</p>
                </td>

                {/* Service + location */}
                <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 text-[10px] text-white/50">
                        <Bike size={11} className="text-orange shrink-0" />
                        <span className="capitalize">{order.serviceType?.replace(/-/g, ' ')}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-white/30">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate max-w-[120px]">{location}</span>
                    </div>
                </td>

                {/* Financials */}
                <td className="px-4 py-3.5">
                    <p className="text-xs font-bold text-white/80">&#x20A6;{order.totalAmount?.toLocaleString()}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">Budget: &#x20A6;{order.itemBudget?.toLocaleString()}</p>
                </td>

                {/* Status */}
                <td className="px-4 py-3.5">
                    <StatusPill status={order.status} />
                    {order.hasDispute && (
                        <span className="mt-1 inline-flex items-center gap-1 text-[9px] text-crimson">
                            <AlertTriangle size={9} /> Dispute
                        </span>
                    )}
                </td>

                {/* Expand toggle */}
                <td className="px-4 py-3.5 text-right">
                    <button className="text-white/30 hover:text-orange transition-colors">
                        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                </td>
            </tr>

            {/* Expanded detail row */}
            {expanded && (
                <tr className="border-b border-white/5 bg-white/[0.02]">
                    <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                            {/* Financials breakdown */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Financials</p>
                                {[
                                    ['Total',        `₦${order.totalAmount?.toLocaleString()}`],
                                    ['Item Budget',  `₦${order.itemBudget?.toLocaleString()}`],
                                    ['Delivery Fee', `₦${order.deliveryFee?.toLocaleString()}`],
                                    ['Platform Fee', `₦${order.platformFee?.toLocaleString()}`],
                                    ['Runner Payout',`₦${order.runnerPayout?.toLocaleString()}`],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center py-0.5">
                                        <span className="text-[10px] text-white/40">{k}</span>
                                        <span className="text-[10px] text-white/70 font-medium">{v}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Order info */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Order Info</p>
                                {[
                                    ['Fleet',         order.fleetType],
                                    ['Payment',       order.paymentStatus],
                                    ['Approval',      order.approvalStatus],
                                    ['Rated',         order.isRated ? 'Yes' : 'No'],
                                    ['Confirmed By',  order.deliveryConfirmedBy ?? '—'],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center py-0.5">
                                        <span className="text-[10px] text-white/40">{k}</span>
                                        <span className="text-[10px] text-white/70 font-medium capitalize">{v}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Customer */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Customer</p>
                                <p className="text-xs text-white/70 font-medium">{customer?.firstName}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{customer?.email}</p>
                                <p className="text-[10px] text-white/40">{customer?.phone}</p>
                            </div>

                            {/* Runner */}
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-2">Runner</p>
                                <p className="text-xs text-white/70 font-medium">{runner?.firstName}</p>
                                <p className="text-[10px] text-white/40 mt-0.5">{runner?.email}</p>
                                <p className="text-[10px] text-white/40">{runner?.phone}</p>
                            </div>
                        </div>

                        {/* Status history timeline */}
                        {order.statusHistory?.length > 0 && (
                            <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                                <p className="text-[9px] text-white/30 uppercase tracking-widest mb-3">Status History</p>
                                <div className="flex flex-col gap-2">
                                    {order.statusHistory.map((h, idx) => (
                                        <div key={h._id} className="flex items-start gap-3">
                                            <div className="flex flex-col items-center shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-orange mt-0.5" />
                                                {idx < order.statusHistory.length - 1 && (
                                                    <div className="w-px h-4 bg-white/10 mt-1" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                                                <div>
                                                    <span className="text-[10px] text-white/70 font-medium capitalize">
                                                        {h.status?.replace(/_/g, ' ')}
                                                    </span>
                                                    {h.note && (
                                                        <p className="text-[9px] text-white/30 mt-0.5">{h.note}</p>
                                                    )}
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[9px] text-white/30">
                                                        {new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                    <p className="text-[9px] text-white/20 capitalize">{h.triggeredBy}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

export default function OrdersList() {
    const dispatch = useDispatch();
    const { list: rawList, count = rawList.length , loading = false, error = null } = useSelector(state => state.orders || {});
    const list = Array.isArray(rawList) ? rawList : [];

    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => { dispatch(getAllOrders()); }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try { await dispatch(getAllOrders()); }
        finally { setRefreshing(false); }
    };

    const filtered = statusFilter === 'all' ? list : list.filter(o => o.status === statusFilter);

    const statuses = ['all', 'completed', 'paid', 'items_submitted', 'cancelled'];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-black italic">ORDERS</h1>
                    <p className="text-gray-400 text-sm">Track and manage customer orders</p>
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
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <ShoppingBag size={12} className="text-gray-400" />
                    <span className="text-[11px] font-bold text-gray-400">{count} Orders</span>
                </div>
            </div>

            {/* Status filter tabs */}
            <div className="flex gap-1 flex-wrap">
                {statuses.map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all
                            ${statusFilter === s
                                ? 'bg-orange/10 text-orange border border-orange/20'
                                : 'bg-white/5 text-white/40 border border-white/10 hover:text-white/70'}`}
                    >
                        {s === 'all' ? `All (${list.length})` : s.replace(/_/g, ' ')}
                    </button>
                ))}
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-sm">
                    Error: {typeof error === 'string' ? error : 'Failed to load orders'}
                </div>
            )}

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-black border-b border-white/5">
                        <tr>
                            <th className="px-4 py-3">Order ID</th>
                            <th className="px-4 py-3">Customer</th>
                            <th className="px-4 py-3">Runner</th>
                            <th className="px-4 py-3">Service</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(order => (
                            <OrderRow key={order._id} order={order} />
                        ))}
                    </tbody>
                </table>

                {loading && <div className="p-8 text-center text-gray-500">Loading orders...</div>}
                {!loading && !error && filtered.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders found</div>
                )}
            </div>
        </div>
    );
}