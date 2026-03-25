// admin-dashboard/src/pages/OrdersList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../Redux/orderSlice';
import { CheckCircle, Clock, RefreshCw, ShoppingBag, Bike, XCircle } from 'lucide-react';

export default function OrdersList() {
    const dispatch = useDispatch();
    const { list: rawList, count = 0, loading = false, error = null } = useSelector(state => state.orders || {});
    const list = Array.isArray(rawList) ? rawList : [];

    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => { dispatch(getAllOrders()); }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getAllOrders());
        } finally {
            setRefreshing(false);
        }
    };

    const statusConfig = {
        paid:            { color: 'bg-blue-400/10 text-blue-400',   icon: <CheckCircle size={11} /> },
        completed:       { color: 'bg-green-400/10 text-green-400', icon: <CheckCircle size={11} /> },
        cancelled:       { color: 'bg-red-400/10 text-red-400',     icon: <XCircle size={11} /> },
        pending_payment: { color: 'bg-yellow-400/10 text-yellow-400', icon: <Clock size={11} /> },
    };

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
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
                    <span className="text-[11px] font-bold text-gray-400">{list.length} Orders</span>
                </div>
            </div>

            {/* ── Error Banner ────────────────────────────────────────────────── */}
            {error && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">
                    Error: {typeof error === 'string' ? error : 'Failed to load orders'}
                </div>
            )}

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-black border-b border-white/5">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Runner</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Type</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.map(order => {
                            const status = statusConfig[order.status] || {
                                color: 'bg-gray-400/10 text-gray-400',
                                icon: <Clock size={11} />
                            };
                            return (
                                <tr key={order._id} className="hover:bg-white/5 transition"> {/* ✅ _id */}
                                    {/* Order ID */}
                                    <td className="p-4 font-mono text-primary text-xs">
                                        {order.orderId}
                                    </td>

                                    {/* Customer — server populates userId, not user */}
                                    <td className="p-4">
                                        {/* ✅ order.userId (populated ref), only firstName — no lastName in response */}
                                        <div className="font-medium">{order.userId?.firstName ?? '—'}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{order.userId?.email}</div>
                                    </td>

                                    {/* Runner — server populates runnerId */}
                                    <td className="p-4">
                                        {/* ✅ order.runnerId (populated ref) */}
                                        <div className="font-medium">{order.runnerId?.firstName ?? '—'}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{order.runnerId?.phone}</div>
                                    </td>

                                    {/* Amount */}
                                    <td className="p-4">
                                        <div className="font-bold">
                                            &#x20A6;{order.totalAmount?.toLocaleString() ?? '—'}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                            Fee: &#x20A6;{order.deliveryFee?.toLocaleString()}
                                        </div>
                                    </td>

                                    {/* Service type */}
                                    <td className="p-4">
                                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400">
                                            <Bike size={12} /> {order.serviceType ?? '—'}
                                        </span>
                                    </td>

                                    {/* Status */}
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-full ${status.color}`}>
                                            {status.icon}
                                            {order.status?.replace('_', ' ')}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* ── Loading State ───────────────────────────────────────────── */}
                {loading && (
                    <div className="p-8 text-center text-gray-500">Loading orders...</div>
                )}

                {/* ── Empty State ─────────────────────────────────────────────── */}
                {!loading && !error && list.length === 0 && (
                    <div className="p-8 text-center text-gray-500">No orders found</div>
                )}
            </div>
        </div>
    );
}