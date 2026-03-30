import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDisputes, resolveDispute } from '../Redux/disputeSlice';
import { AlertTriangle, Clock, CheckCircle, MessageSquare, RefreshCw } from 'lucide-react';

export default function Disputes() {
  const dispatch = useDispatch();
  const { list: rawList, loading = false, error = null } = useSelector(state => state.dispute || {});
  const list = Array.isArray(rawList) ? rawList : [];

  const [filter, setFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getAllDisputes());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getAllDisputes());
    } finally {
      setRefreshing(false);
    }
  };

  const handleResolve = (disputeId) => {
    const resolution = window.prompt("Enter resolution notes (e.g., 'Refund Issued'):");
    if (resolution) {
      dispatch(resolveDispute({
        disputeId,
        resolutionData: { status: 'Resolved', notes: resolution }
      }));
    }
  };

  const filteredDisputes = list.filter(d =>
    filter === 'All' ? true : d.status === filter
  );

  return (
    <div className="px-6 py-8 space-y-6 bg-navy min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">Disputes </h1>
          <p className="text-white/40 text-sm mt-1">Review and resolve order conflicts</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/80 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium self-start">
          {['All', 'Pending', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-lg transition-all ${
                filter === tab
                  ? 'bg-orange text-white'
                  : 'text-white/40 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <RefreshCw className="animate-spin text-orange" size={22} />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredDisputes.length === 0 && (
        <div className="text-center py-20 mx-1 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
          <AlertTriangle size={28} className="text-white/20 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No disputes found for this category.</p>
        </div>
      )}

      {/* Dispute cards */}
      <div className="grid gap-4">
        {filteredDisputes.map((dispute) => (
          <div
            key={dispute._id}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-orange/30 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-xl shrink-0 ${
                  dispute.status === 'Pending'
                    ? 'bg-crimson/10 text-crimson'
                    : 'bg-purple/10 text-purple'
                }`}>
                  <AlertTriangle size={22} />
                </div>

                {/* Info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-white font-semibold text-base">
                      {dispute.type || 'Order Issue'}
                    </h3>
                    <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/40 font-mono">
                      {dispute.orderId}
                    </span>
                  </div>

                  <p className="text-sm text-white/40 mt-1.5">
                    Raised by{' '}
                    <span className="text-white/80 font-medium">{dispute.reporterName}</span>
                    {' '}against{' '}
                    <span className="text-white/80 font-medium">{dispute.againstName}</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] font-medium text-white/30">
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {dispute.createdAt}
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
                    className="bg-orange/10 text-orange border border-orange/20 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-orange hover:text-white transition-all"
                  >
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
    </div>
  );
}