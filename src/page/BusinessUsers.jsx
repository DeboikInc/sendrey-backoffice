import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBusinessAccounts, getSuggestions, convertToBusiness, revokeBusiness } from '../Redux/businessSlice';
import { UserPlus, RefreshCw, AlertTriangle } from 'lucide-react';

export default function BusinessDashboard() {
  const dispatch = useDispatch();
  const { accounts: rawAccounts, suggestions: rawSuggestions, loading = false, error = null } = useSelector(state => state.business || {});
  const accounts    = Array.isArray(rawAccounts)    ? rawAccounts    : [];
  const suggestions = Array.isArray(rawSuggestions) ? rawSuggestions : [];

  const [view, setView]             = useState('accounts');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getBusinessAccounts());
    dispatch(getSuggestions());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getBusinessAccounts());
      await dispatch(getSuggestions());
    } finally {
      setRefreshing(false);
    }
  };

  const activeList = view === 'accounts' ? accounts : suggestions;

  return (
    <div className="px-6 py-8 space-y-6 bg-navy min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-white text-xl font-bold tracking-tight">Business Ecosystem</h1>
          <p className="text-white/40 text-sm mt-1">Manage corporate accounts and conversion leads</p>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/80 disabled:opacity-50 transition-all"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* View toggle */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 text-xs font-medium self-start">
          <button
            onClick={() => setView('accounts')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'accounts' ? 'bg-orange text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Active Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setView('suggestions')}
            className={`px-4 py-2 rounded-lg transition-all ${
              view === 'suggestions' ? 'bg-orange text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            Suggestions ({suggestions.length})
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Entity / User</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Type</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activeList.map(item => (
              <tr key={item._id} className="hover:bg-white/5 transition-all">
                <td className="px-5 py-4">
                  <div className="text-white font-medium text-sm">{item.businessName || item.name}</div>
                  <div className="text-white/35 text-xs mt-0.5">{item.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-medium border ${
                    view === 'accounts'
                      ? 'bg-royal/10 text-royal border-royal/20'
                      : 'bg-purple/10 text-purple border-purple/20'
                  }`}>
                    {view === 'accounts' ? 'Corporate' : 'Lead'}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {view === 'accounts' ? (
                    <button
                      onClick={() => dispatch(revokeBusiness(item._id))}
                      className="text-crimson/70 hover:text-crimson text-xs font-medium transition-colors"
                    >
                      Revoke
                    </button>
                  ) : (
                    <button
                      onClick={() => dispatch(convertToBusiness(item._id))}
                      className="inline-flex items-center gap-1.5 bg-orange/10 text-orange border border-orange/20 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-orange hover:text-white transition-all"
                    >
                      <UserPlus size={13} /> Convert
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Loading */}
        {loading && (
          <div className="p-10 text-center text-white/30 text-sm">
            Loading {view === 'accounts' ? 'accounts' : 'suggestions'}...
          </div>
        )}

        {/* Empty */}
        {!loading && !error && activeList.length === 0 && (
          <div className="p-10 text-center text-white/30 text-sm">
            No {view === 'accounts' ? 'business accounts' : 'suggestions'} found
          </div>
        )}
      </div>
    </div>
  );
}