import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Star, Trash2, ShieldAlert, Bike, RefreshCw, AlertTriangle } from 'lucide-react';
import { getRunners, searchRunners, getRunnerStats, updateRunnerStatus, deleteRunner } from '../Redux/runnersSlice';
import debounce from 'lodash/debounce';

export default function RunnersList() {
  const dispatch = useDispatch();
  const { list: rawList, stats = {}, loading = false, error = null } = useSelector(state => state.runners || {});
  const list = Array.isArray(rawList) ? rawList : [];

  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(getRunners());
    dispatch(getRunnerStats());
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getRunners());
      await dispatch(getRunnerStats());
    } finally {
      setRefreshing(false);
    }
  };

 const debouncedSearch = useMemo(
  () => 
    debounce((query) => {
      dispatch(searchRunners(query));
    }, 500),
  [dispatch] // Tell React to only recreate this if 'dispatch' changes
);

// Your handler stays simple
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
  debouncedSearch(value);
};
  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    if (window.confirm(`Change runner status to ${newStatus}?`)) {
      dispatch(updateRunnerStatus({ runnerId: id, status: newStatus }));
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure? This action is permanent.')) {
      dispatch(deleteRunner(id));
    }
  };

  return (
    <div className="px-6 py-8 space-y-6 bg-navy min-h-full">

      {/* Header */}
      <div>
        <h1 className="text-white text-xl font-bold tracking-tight">Runners</h1>
        <p className="text-white/40 text-sm mt-1">Manage and monitor runner accounts</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Runners" value={stats.total}     icon={<Bike size={18} />}       color="text-orange" />
        <StatCard label="Active"        value={stats.active}    icon={<Star size={18} />}        color="text-purple" />
        <StatCard label="Suspended"     value={stats.suspended} icon={<ShieldAlert size={18} />} color="text-crimson" />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {error}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-white/5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-2.5 text-white/25" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search runners..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder-white/25 outline-none focus:border-orange/40 transition-colors"
            />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-medium hover:bg-orange/80 disabled:opacity-50 transition-all shrink-0"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Runner</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Performance</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium">Status</th>
              <th className="px-5 py-3 text-[10px] text-white/30 tracking-widest uppercase font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {list.map(runner => (
              <tr key={runner._id} className="hover:bg-white/5 transition-all">
                <td className="px-5 py-4">
                  <div className="text-white font-medium text-sm">{runner.firstName} {runner.lastName}</div>
                  <div className="text-white/35 text-xs mt-0.5">{runner.email}</div>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1 text-orange font-medium text-sm">
                    <Star size={13} fill="currentColor" /> {runner.rating || 'N/A'}
                  </div>
                  <div className="text-white/35 text-xs mt-0.5">{runner.tripsCount || 0} trips</div>
                </td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => handleToggleStatus(runner._id, runner.status)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                      runner.status === 'Active'
                        ? 'bg-purple/10 text-purple border-purple/20 hover:bg-purple/20'
                        : 'bg-crimson/10 text-crimson border-crimson/20 hover:bg-crimson/20'
                    }`}
                  >
                    {runner.status}
                  </button>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => handleDelete(runner._id)}
                    className="p-1.5 text-white/25 hover:text-crimson transition-colors rounded-lg hover:bg-crimson/10"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {loading && (
          <div className="p-10 text-center text-white/30 text-sm">Loading runners...</div>
        )}

        {!loading && !error && list.length === 0 && (
          <div className="p-10 text-center text-white/30 text-sm">No runners found</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl">
      <div className={`mb-3 ${color}`}>{icon}</div>
      <div className="text-white text-2xl font-bold">{value ?? '—'}</div>
      <div className="text-white/35 text-xs font-medium uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}