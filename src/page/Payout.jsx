// admin-dashboard/src/pages/PayoutManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getPayoutReceipts } from '../Redux/payoutSlice';
import { FileText, Check, X, RefreshCw, Clock, AlertTriangle } from 'lucide-react';

export default function Payout() {
    const dispatch = useDispatch();
    const { receipts: rawReceipts, count = 0, loading = false, error = null } = useSelector(state => state.payout || state.payouts || {});
    const receipts = Array.isArray(rawReceipts) ? rawReceipts : [];

    const [refreshing, setRefreshing] = useState(false);

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

    const statusConfig = {
        pending:  { cls: 'bg-orange/10 text-orange border-orange/20',      icon: <Clock size={11} /> },
        approved: { cls: 'bg-green-400/10 text-green-400 border-green-400/20', icon: <Check size={11} /> },
        rejected: { cls: 'bg-crimson/10 text-crimson border-crimson/20',    icon: <X size={11} /> },
    };

    return (
        <div className="px-6 py-8 space-y-6 bg-navy min-h-full">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-white text-xl font-bold tracking-tight">Payout Receipts</h1>
                    <p className="text-white/40 text-sm mt-1">Review and approve runner payout receipts</p>
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
                    <FileText size={12} className="text-white/40" />
                    <span className="text-xs font-medium text-white/40">{count} receipts</span>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <AlertTriangle size={15} />
                    {typeof error === 'string' ? error : 'Failed to load receipts'}
                </div>
            )}

            {/* Table */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/5">
                            {['Receipt ID', 'Runner', 'Vendor', 'Amount Spent', 'Change', 'Status'].map((h, i) => (
                                <th key={i} className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {receipts.map(receipt => {
                            const status = statusConfig[receipt.status] || {
                                cls: 'bg-white/5 text-white/40 border-white/10',
                                icon: <Clock size={11} />,
                            };
                            return (
                                <tr key={receipt.receiptId} className="hover:bg-white/5 transition-all">
                                    <td className="px-5 py-4 font-mono text-orange text-xs">
                                        {receipt.receiptId ?? '—'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-white font-medium text-sm">
                                            {receipt.runnerName || '—'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-white font-medium text-sm">
                                            {receipt.vendorName || '—'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-white font-medium text-sm">
                                            &#x20A6;{receipt.amountSpent?.toLocaleString() ?? '—'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-green-400 font-medium text-sm">
                                            {receipt.changeAmount != null
                                                ? `₦${receipt.changeAmount.toLocaleString()}`
                                                : <span className="text-white/25">—</span>}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-lg border ${status.cls}`}>
                                            {status.icon}
                                            {receipt.status}
                                        </span>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {loading && (
                    <div className="p-10 text-center text-white/30 text-sm">Loading receipts...</div>
                )}

                {!loading && !error && receipts.length === 0 && (
                    <div className="p-10 text-center text-white/30 text-sm">No payout receipts found</div>
                )}
            </div>
        </div>
    );
}