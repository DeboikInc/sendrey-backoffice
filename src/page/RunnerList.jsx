import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Star, Trash2, ShieldAlert,
  Bike, RefreshCw, AlertTriangle, RotateCcw
} from 'lucide-react';
import {
  getRunners, searchRunners, getRunnerStats,
  deleteRunner, banRunner, unbanRunner, resetStrikeCount
} from '../Redux/runnersSlice';
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
    () => debounce((query) => { dispatch(searchRunners(query)); }, 500),
    [dispatch]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete ${name}? This action is permanent.`)) {
      dispatch(deleteRunner(id));
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'banned': return 'bg-crimson/10 text-crimson border-crimson/20';
      case 'approved_full': return 'bg-purple/10 text-purple border-purple/20';
      case 'approved_limited': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-5 bg-navy min-h-full">

      {/* Header */}
      <div>
        <h1 className="text-white text-xl font-bold tracking-tight">Runners</h1>
        <p className="text-white/40 text-sm mt-1">Manage and monitor runner accounts</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Total" value={stats.total} icon={<Bike size={16} />} color="text-orange" />
        <StatCard label="Active" value={stats.available} icon={<Star size={16} />} color="text-purple" />
        <StatCard label="Banned" value={stats.byStatus?.find(s => s._id === 'banned')?.count || 0} icon={<ShieldAlert size={16} />} color="text-crimson" />
      </div>

      {/* Error */}
      {error && (
        <div className="bg-crimson/10 border border-crimson/30 text-crimson px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={15} /> {typeof error === 'string' ? error : 'Something went wrong'}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-white/25" size={15} />
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
          <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="p-10 text-center text-white/30 text-sm">Loading runners...</div>
      )}

      {/* Empty */}
      {!loading && !error && list.length === 0 && (
        <div className="p-10 text-center text-white/30 text-sm">No runners found</div>
      )}

      {/* Desktop table — hidden on mobile */}
      {!loading && list.length > 0 && (
        <>
          <div className="hidden md:block bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
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
                      <div className="text-white/35 text-xs mt-0.5">{runner.completedOrders || 0} trips</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border ${statusStyle(runner.runnerStatus)}`}>
                        {runner.runnerStatus?.replace(/_/g, ' ') || '—'}
                      </span>
                      {runner.itemRejectionCount > 0 && (
                        <div className="text-[10px] text-crimson/70 mt-1">
                          {runner.itemRejectionCount} strike{runner.itemRejectionCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <RunnerActions runner={runner} dispatch={dispatch} handleDelete={handleDelete} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — hidden on desktop */}
          <div className="md:hidden space-y-3">
            {list.map(runner => (
              <div key={runner._id} className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">

                {/* Top row: name + status */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-white font-medium text-sm">{runner.firstName} {runner.lastName}</div>
                    <div className="text-white/35 text-xs mt-0.5">{runner.email}</div>
                    <div className="text-white/25 text-xs mt-0.5">{runner.phone}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border shrink-0 ${statusStyle(runner.runnerStatus)}`}>
                    {runner.runnerStatus?.replace(/_/g, ' ') || '—'}
                  </span>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 text-orange font-medium">
                    <Star size={12} fill="currentColor" /> {runner.rating || 'N/A'}
                  </div>
                  <div className="text-white/35">{runner.completedOrders || 0} trips</div>
                  {runner.itemRejectionCount > 0 && (
                    <div className="text-crimson/70">
                      {runner.itemRejectionCount} strike{runner.itemRejectionCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <RunnerActions runner={runner} dispatch={dispatch} handleDelete={handleDelete} mobile />
                </div>

              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RunnerActions({ runner, dispatch, handleDelete, mobile }) {
  return (
    <div className={`flex items-center gap-2 ${mobile ? 'w-full' : 'justify-end'}`}>
      {runner.runnerStatus === 'banned' ? (
        <button
          onClick={() => {
            if (window.confirm(`Unban ${runner.firstName}?`)) {
              dispatch(unbanRunner(runner._id));
            }
          }}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border border-orange/30 text-orange hover:bg-orange/10 transition-colors ${mobile ? 'flex-1' : ''}`}
        >
          Raise Ban
        </button>
      ) : (
        <button
          onClick={() => {
            if (window.confirm(`Ban ${runner.firstName}? They will be prevented from taking orders.`)) {
              dispatch(banRunner(runner._id));
            }
          }}
          className={`text-[11px] font-medium px-3 py-1.5 rounded-lg border border-crimson/30 text-crimson hover:bg-crimson/10 transition-colors ${mobile ? 'flex-1' : ''}`}
        >
          Ban Runner
        </button>
      )}

      {runner.itemRejectionCount > 0 && (
        <button
          onClick={() => {
            if (window.confirm(`Reset ${runner.firstName}'s strike count?`)) {
              dispatch(resetStrikeCount(runner._id));
            }
          }}
          title="Reset strikes"
          className="p-1.5 text-white/25 hover:text-orange transition-colors rounded-lg hover:bg-orange/10"
        >
          <RotateCcw size={15} />
        </button>
      )}

      <button
        onClick={() => handleDelete(runner._id, runner.firstName)}
        className="p-1.5 text-white/25 hover:text-crimson transition-colors rounded-lg hover:bg-crimson/10"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-white/[0.03] border border-white/10 p-4 rounded-2xl">
      <div className={`mb-2 ${color}`}>{icon}</div>
      <div className="text-white text-xl font-bold">{value ?? '—'}</div>
      <div className="text-white/35 text-[10px] font-medium uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}