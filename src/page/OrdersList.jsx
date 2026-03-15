// admin-dashboard/src/pages/OrdersList.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../Redux/orderSlice';
import { CheckCircle, Clock, RefreshCw } from 'lucide-react';

export default function OrdersList() {
    const dispatch = useDispatch();
    const { list: rawList, loading = false, error = null } = useSelector(state => state.orders || {});
const list = Array.isArray(rawList) ? rawList : [];
    const [refreshing, setRefreshing] = useState(false);  // ← local refresh state

    useEffect(() => { dispatch(getAllOrders()); }, [dispatch]);

    // ── Refresh handler (mirrors KYC handleRefresh) ──────────────────────────
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await dispatch(getAllOrders());
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Header ─────────────────────────────────────────────────────── */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-black italic">GLOBAL ORDERS</h1>
                    <p className="text-gray-400 text-sm">Monitor all platform orders</p>

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

            {/* ── Table ───────────────────────────────────────────────────────── */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-[10px] uppercase text-gray-500 font-black">
                        <tr>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Customer</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {list.map(order => (
                            <tr key={order.id} className="hover:bg-white/5">
                                <td className="p-4 font-mono text-primary">{order.orderId}</td>
                                <td className="p-4">{order.customerName}</td>
                                <td className="p-4 font-bold">₦{order.totalAmount}</td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-[10px] font-black uppercase">
                                        {order.status === 'completed'
                                            ? <CheckCircle size={14} className="text-green-400" />
                                            : <Clock size={14} className="text-yellow-400" />}
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Loading State ───────────────────────────────────────────── */}
                {loading && (
                    <div className="p-8 text-center text-gray-500">
                        Loading orders...
                    </div>
                )}

                {/* ── Empty State ─────────────────────────────────────────────── */}
                {!loading && !error && list.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No orders found
                    </div>
                )}
            </div>
        </div>
    );
}