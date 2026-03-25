// pages/KycDashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RefreshCw, Clock, UserCheck, AlertTriangle, Search, Shield } from 'lucide-react';
import {
  getPendingKYC, getRunnerKYCDetails, approveDocument,
  rejectDocument, approveSelfie, rejectSelfie,
  clearSelectedRunner, getVerifiedRunners,
} from '../Redux/kycSlice';

import StatusBadge from '../components/kyc/StatusBadge';
import RunnerRow   from '../components/kyc/RunnerRow';
import RunnerCard  from '../components/kyc/RunnerCard';
import RunnerModal from '../components/kyc/RunnerModal';

export default function KycDashboard() {
  const [view, setView]             = useState('pending');
  const [search, setSearch]         = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  
  const { pendingRunners = [], totalPending = 0, verifiedRunners = [], selectedRunner = null, status = 'idle', error = '' } =
    useSelector(state => state.adminKyc || {});

  useEffect(() => {
    dispatch(getPendingKYC());
    dispatch(getVerifiedRunners());
  }, [dispatch]);

  const displayData = useMemo(() => {
    const base = (view === 'pending' ? pendingRunners : verifiedRunners) || [];
    if (!search) return base;
    const q = search.toLowerCase();
    return base.filter(r =>
      `${r.firstName} ${r.lastName} ${r.email} ${r.phone}`.toLowerCase().includes(q)
    );
  }, [view, pendingRunners, verifiedRunners, search]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getPendingKYC());
      await dispatch(getVerifiedRunners());
    } finally {
      setRefreshing(false);
    }
  };

  const handleApproveDoc    = (runnerId, docType) => dispatch(approveDocument({ runnerId, documentType: docType }));
  const handleRejectDoc     = (runnerId, docType, reason) => {
    if (!reason?.trim()) return alert('Please provide a rejection reason');
    dispatch(rejectDocument({ runnerId, documentType: docType, reason }));
  };
  const handleApproveSelfie = (runnerId) => dispatch(approveSelfie({ runnerId })); // ✅ wrapped in object
  const handleRejectSelfie  = (runnerId, reason) => {
    if (!reason?.trim()) return alert('Please provide a rejection reason');
    dispatch(rejectSelfie({ runnerId, reason }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c12]" style={{ fontFamily: "'DM Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800;900&display=swap');
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      {/* ── Topbar ─────────────────────────────────────── */}
      <header className="px-4 sm:px-6 py-4 border-b border-[#1a1a2e] shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-white font-black text-base sm:text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
              KYC Verification
            </h1>
            <p className="text-[#44445a] text-[11px] tracking-wide mt-0.5">
              Runner identity &amp; document compliance
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing || status === 'loading'}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#13131f] border border-[#1a1a2e] text-[#44445a] hover:text-[#c8ff00] hover:border-[#c8ff00]/30 text-[11px] font-bold transition-all disabled:opacity-40 shrink-0"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/20">
            <Clock size={11} className="text-[#fbbf24]" />
            <span className="text-[10px] font-bold text-[#fbbf24]">{totalPending ?? 0} Pending</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/20">
            <UserCheck size={11} className="text-[#c8ff00]" />
            <span className="text-[10px] font-bold text-[#c8ff00]">{(verifiedRunners || []).length} Verified</span>
          </div>
        </div>
      </header>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-3 border-b border-[#1a1a2e] shrink-0 flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
        {/* View toggle */}
        <div className="flex bg-[#0f0f1a] border border-[#1a1a2e] rounded-lg p-0.5 gap-0.5 w-full sm:w-auto">
          {[
            { key: 'pending',  label: 'Pending',  icon: Clock,      count: totalPending },
            { key: 'verified', label: 'Verified', icon: UserCheck,  count: (verifiedRunners || []).length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setView(key)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold transition-all
                ${view === key ? 'bg-[#c8ff00]/10 text-[#c8ff00] border border-[#c8ff00]/20' : 'text-[#44445a] hover:text-[#b0b0c8]'}`}>
              <Icon size={12} /> {label}
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold
                ${view === key ? 'bg-[#c8ff00] text-[#0a0a0f]' : 'bg-[#1a1a2e] text-[#44445a]'}`}>
                {count ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#13131f] border border-[#1a1a2e] rounded-lg px-3 py-2 w-full sm:w-56">
          <Search size={12} className="text-[#44445a] shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search runners..."
            className="bg-transparent text-[11px] text-[#b0b0c8] placeholder-[#44445a] outline-none w-full"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 sm:mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-[11px]">
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {/* ── Content ─────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-4 sm:px-6 py-4">

        {/* Desktop table */}
        <div className="hidden md:block rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1a1a2e]">
                {['Runner', 'Contact', 'Pending Items', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3 text-[9px] text-[#44445a] tracking-widest uppercase font-normal ${i === 4 ? 'text-right' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayData.map((runner, i) => (
                <RunnerRow
                  key={runner._id}
                  runner={runner}
                  view={view}
                  i={i}
                  onReview={() => dispatch(getRunnerKYCDetails(runner._id))}
                />
              ))}
            </tbody>
          </table>
          {displayData.length === 0 && <EmptyState status={status} view={view} />}
        </div>

        {/* Mobile card list */}
        <div className="md:hidden rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] overflow-hidden">
          {displayData.length === 0 ? (
            <EmptyState status={status} view={view} />
          ) : (
            displayData.map((runner, i) => (
              <RunnerCard
                key={runner._id}
                runner={runner}
                view={view}
                i={i}
                onReview={() => dispatch(getRunnerKYCDetails(runner._id))}
              />
            ))
          )}
        </div>
      </div>

      {/* Detail modal */}
      {selectedRunner && (
        <RunnerModal
          runner={selectedRunner}
          onClose={() => dispatch(clearSelectedRunner())}
          onApproveDoc={handleApproveDoc}
          onRejectDoc={handleRejectDoc}
          onApproveSelfie={handleApproveSelfie}
          onRejectSelfie={handleRejectSelfie}
        />
      )}
    </div>
  );
}

// ── Empty / loading state ─────────────────────────────────
function EmptyState({ status, view }) {
  return (
    <div className="py-16 flex flex-col items-center gap-3 text-[#44445a]">
      <Shield size={28} className="opacity-30" />
      <p className="text-xs">
        {status === 'loading' ? 'Loading runners...' : `No ${view} runners found`}
      </p>
    </div>
  );
}