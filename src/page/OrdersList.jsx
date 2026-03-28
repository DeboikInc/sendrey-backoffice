import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders } from '../Redux/orderSlice';
import { CheckCircle, Clock, RefreshCw, ShoppingBag, Bike, XCircle, AlertTriangle } from 'lucide-react';

export default function OrdersList() {
  const dispatch = useDispatch();
  const { list: rawList, loading = false, error = null } = useSelector(state => state.orders || {});
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
    paid:            { cls: 'bg-royal/10 text-royal border-royal/20',     icon: <CheckCircle size={11} /> },
    completed:       { cls: 'bg-purple/10 text-purple border-purple/20',   icon: <CheckCircle size={11} /> },
    cancelled:       { cls: 'bg-crimson/10 text-crimson border-crimson/20', icon: <XCircle size={11} /> },
    pending_payment: { cls: 'bg-orange/10 text-orange border-orange/20',   icon: <Clock size={11} /> },
  };

  return (
    <div className="px-6 py-8 space-y-6 bg-navy min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">Orders</h1>
          <p className="text-white/40 text-sm mt-1">Track and manage customer orders</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/80 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="self-start flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
          <ShoppingBag size={12} className="text-white/40" />
          <span className="text-xs font-medium text-white/40">{list.length} orders</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} />
          {typeof error === 'string' ? error : 'Failed to load orders'}
        </div>
      )}

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['Order ID', 'Customer', 'Runner', 'Amount', 'Type', 'Status', 'Date'].map((h, i) => (
                <th key={i} className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {list.map(order => {
              const status = statusConfig[order.status] || {
                cls: 'bg-white/5 text-white/40 border-white/10',
                icon: <Clock size={11} />,
              };
              return (
                <tr key={order._id} className="hover:bg-white/5 transition-all">
                  <td className="px-5 py-4 font-mono text-orange text-xs">
                    {order.orderId}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white font-medium text-sm">{order.userId?.firstName ?? '—'}</div>
                    <div className="text-white/35 text-xs mt-0.5">{order.userId?.email}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white font-medium text-sm">{order.runnerId?.firstName ?? '—'}</div>
                    <div className="text-white/35 text-xs mt-0.5">{order.runnerId?.phone}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white font-medium text-sm">
                      &#x20A6;{order.totalAmount?.toLocaleString() ?? '—'}
                    </div>
                    <div className="text-white/35 text-xs mt-0.5">
                      Fee: &#x20A6;{order.deliveryFee?.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-[10px] font-medium text-white/40">
                      <Bike size={12} /> {order.serviceType ?? '—'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg border ${status.cls}`}>
                      {status.icon}
                      {order.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-white/50 text-xs">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </div>
                    <div className="text-white/25 text-xs mt-0.5">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="p-10 text-center text-white/30 text-sm">Loading orders...</div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="p-10 text-center text-white/30 text-sm">No orders found</div>
        )}
      </div>
    </div>
  );
}