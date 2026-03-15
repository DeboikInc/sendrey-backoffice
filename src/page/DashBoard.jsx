import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Eye, RefreshCw, Clock, UserCheck, ChevronLeft,
  FileText, Camera, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, MoreHorizontal, Shield, X
} from 'lucide-react';
import {
  getPendingKYC, getRunnerKYCDetails, approveDocument,
  rejectDocument, approveSelfie, rejectSelfie,
  clearSelectedRunner, getVerifiedRunners
} from '../Redux/kycSlice';

// ── Status badge ─────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending_verification: { label: 'Pending',       color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/20' },
    approved_full:        { label: 'Approved',       color: 'text-[#c8ff00]', bg: 'bg-[#c8ff00]/10', border: 'border-[#c8ff00]/20' },
    approved_limited:     { label: 'Ltd. Approved',  color: 'text-[#38bdf8]', bg: 'bg-[#38bdf8]/10', border: 'border-[#38bdf8]/20' },
    rejected:             { label: 'Rejected',       color: 'text-[#ff4757]', bg: 'bg-[#ff4757]/10', border: 'border-[#ff4757]/20' },
  };
  const s = map[status] || { label: status, color: 'text-[#44445a]', bg: 'bg-[#44445a]/10', border: 'border-[#44445a]/20' };
  return (
    <span className={`inline-flex items-center text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
      {s.label}
    </span>
  );
}

// ── Doc status pill ───────────────────────────────────────
function DocPill({ label }) {
  return (
    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 tracking-wide">
      {label}
    </span>
  );
}

// ── Verification card ─────────────────────────────────────
function VerifCard({ title, data, type, onApprove, onReject, rejectReason, setRejectReason }) {
  const isPending = data?.status === 'pending_review';
  const isApproved = data?.status === 'approved';
  const isRejected = data?.status === 'rejected';

  return (
    <div className={`rounded-xl border bg-[#0c0c12] overflow-hidden transition-all
      ${isPending ? 'border-[#fbbf24]/30' : isApproved ? 'border-[#c8ff00]/20' : isRejected ? 'border-[#ff4757]/20' : 'border-[#1a1a2e]'}`}>

      {/* Card header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-2">
          {type === 'id' ? <FileText size={14} className="text-[#44445a]" /> : <Camera size={14} className="text-[#44445a]" />}
          <span className="text-xs font-bold text-[#d0d0e8] tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</span>
        </div>
        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border
          ${isPending ? 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20'
          : isApproved ? 'text-[#c8ff00] bg-[#c8ff00]/10 border-[#c8ff00]/20'
          : isRejected ? 'text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/20'
          : 'text-[#44445a] bg-[#44445a]/10 border-[#44445a]/20'}`}>
          {data?.status?.replace('_', ' ') || 'Unknown'}
        </span>
      </div>

      {/* Image preview */}
      {data?.imageUrl && (
        <div className="relative bg-[#0a0a0f] border-b border-[#1a1a2e]">
          <img src={data.imageUrl} alt={title} className="w-full h-40 object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/60 to-transparent" />
        </div>
      )}

      {/* Doc details */}
      <div className="p-4 space-y-2">
        {data?.number && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#44445a] tracking-wider uppercase">Doc Number</span>
            <span className="text-[11px] text-[#b0b0c8] font-medium">{data.number}</span>
          </div>
        )}
        {data?.submittedAt && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#44445a] tracking-wider uppercase">Submitted</span>
            <span className="text-[11px] text-[#b0b0c8]">{new Date(data.submittedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {isPending && (
        <div className="px-4 pb-4 space-y-2">
          <input
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Rejection reason (required to reject)..."
            className="w-full bg-[#13131f] border border-[#1a1a2e] rounded-lg px-3 py-2 text-[11px] text-[#b0b0c8] placeholder-[#44445a] outline-none focus:border-[#2a2a3e]"
          />
          <div className="flex gap-2">
            <button onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] text-[11px] font-bold hover:bg-[#c8ff00]/20 transition-all">
              <CheckCircle size={12} /> Approve
            </button>
            <button onClick={onReject}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-[11px] font-bold hover:bg-[#ff4757]/20 transition-all">
              <XCircle size={12} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Runner detail modal ───────────────────────────────────
function RunnerModal({ runner, onClose, onApproveDoc, onRejectDoc, onApproveSelfie, onRejectSelfie }) {
  const [rejectReason, setRejectReason] = useState('');
  const docs = runner.documents || runner.verificationDocuments || {};
  const biometrics = runner.biometrics || runner.biometricVerification || {};

  const docTypes = ['nin', 'driverLicense'];
  let idDoc = null;
  for (const t of docTypes) {
    if (docs[t]) {
      idDoc = { title: t === 'nin' ? 'NIN Document' : "Driver's License", data: docs[t], type: t };
      break;
    }
  }
  const selfieDoc = biometrics?.status !== 'not_submitted' ? { data: biometrics } : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl border border-[#1a1a2e] bg-[#0c0c12] overflow-hidden"
        style={{ fontFamily: "'DM Mono', monospace" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a2e] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#13131f] border border-[#1a1a2e] flex items-center justify-center text-[#44445a] hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all">
              <ChevronLeft size={14} />
            </button>
            <div>
              <h2 className="text-white font-black text-sm tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                {runner.firstName} {runner.lastName}
              </h2>
              <p className="text-[#44445a] text-[10px] tracking-wide mt-0.5">{runner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={runner.runnerStatus} />
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#13131f] border border-[#1a1a2e] flex items-center justify-center text-[#44445a] hover:text-[#ff4757] hover:border-[#ff4757]/30 transition-all">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Runner info strip */}
        <div className="flex items-center gap-6 px-6 py-3 bg-[#0f0f1a] border-b border-[#1a1a2e] shrink-0">
          {[['Phone', runner.phone], ['ID', runner.id?.slice(-8)]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] text-[#44445a] uppercase tracking-widest">{k}</p>
              <p className="text-[11px] text-[#b0b0c8] font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {idDoc && (
              <VerifCard
                title={idDoc.title} data={idDoc.data} type="id"
                rejectReason={rejectReason} setRejectReason={setRejectReason}
                onApprove={() => onApproveDoc(runner.id, idDoc.type)}
                onReject={() => onRejectDoc(runner.id, idDoc.type, rejectReason)}
              />
            )}
            {selfieDoc && (
              <VerifCard
                title="Selfie Image" data={selfieDoc.data} type="selfie"
                rejectReason={rejectReason} setRejectReason={setRejectReason}
                onApprove={() => onApproveSelfie(runner.id)}
                onReject={() => onRejectSelfie(runner.id, rejectReason)}
              />
            )}
            {!idDoc && !selfieDoc && (
              <div className="col-span-2 py-12 text-center text-[#44445a] text-sm">
                No documents submitted yet
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1a1a2e] flex justify-end shrink-0">
          <button onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#13131f] border border-[#1a1a2e] text-[#b0b0c8] text-xs font-bold hover:border-[#2a2a3e] transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main KYC Dashboard ────────────────────────────────────
export default function KycDashboard() {
  const [view, setView] = useState('pending');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const dispatch = useDispatch();

  const { pendingRunners, totalPending, verifiedRunners, selectedRunner, status, error } =
    useSelector(state => state.adminKyc);

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

  const handleApproveDoc = (runnerId, docType) => dispatch(approveDocument({ runnerId, documentType: docType }));
  const handleRejectDoc = (runnerId, docType, reason) => {
    if (!reason?.trim()) return alert('Please provide a rejection reason');
    dispatch(rejectDocument({ runnerId, documentType: docType, reason }));
  };
  const handleApproveSelfie = (runnerId) => dispatch(approveSelfie(runnerId));
  const handleRejectSelfie = (runnerId, reason) => {
    if (!reason?.trim()) return alert('Please provide a rejection reason');
    dispatch(rejectSelfie({ runnerId, reason }));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0c12]"
      style={{ fontFamily: "'DM Mono', monospace" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800;900&display=swap');
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.35s ease forwards; }
      `}</style>

      {/* Topbar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#1a1a2e] shrink-0">
        <div>
          <h1 className="text-white font-black text-lg tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
            KYC Verification
          </h1>
          <p className="text-[#44445a] text-[11px] tracking-wide mt-0.5">
            Runner identity &amp; document compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Stats pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#fbbf24]/10 border border-[#fbbf24]/20">
              <Clock size={11} className="text-[#fbbf24]" />
              <span className="text-[10px] font-bold text-[#fbbf24]">{totalPending ?? 0} Pending</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/20">
              <UserCheck size={11} className="text-[#c8ff00]" />
              <span className="text-[10px] font-bold text-[#c8ff00]">{(verifiedRunners || []).length} Verified</span>
            </div>
          </div>
          <button onClick={handleRefresh} disabled={refreshing || status === 'loading'}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#13131f] border border-[#1a1a2e] text-[#44445a] hover:text-[#c8ff00] hover:border-[#c8ff00]/30 text-[11px] font-bold transition-all disabled:opacity-40">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[#1a1a2e] shrink-0">
        {/* View toggle */}
        <div className="flex bg-[#0f0f1a] border border-[#1a1a2e] rounded-lg p-0.5 gap-0.5">
          {[
            { key: 'pending',  label: 'Pending',  icon: Clock,     count: totalPending },
            { key: 'verified', label: 'Verified', icon: UserCheck, count: (verifiedRunners || []).length },
          ].map(({ key, label, icon: Icon, count }) => (
            <button key={key} onClick={() => setView(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-[11px] font-bold transition-all
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
        <div className="flex items-center gap-2 bg-[#13131f] border border-[#1a1a2e] rounded-lg px-3 py-2 w-56">
          <Search size={12} className="text-[#44445a] shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search runners..."
            className="bg-transparent text-[11px] text-[#b0b0c8] placeholder-[#44445a] outline-none w-full" />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-[11px]">
          <AlertTriangle size={13} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-6 py-4">
        <div className="rounded-xl border border-[#1a1a2e] bg-[#0f0f1a] overflow-hidden">
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
                <tr key={runner.id}
                  className="border-b border-[#1a1a2e]/50 hover:bg-[#13131f] transition-colors fade-up"
                  style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-[9px] font-black text-white shrink-0"
                        style={{ fontFamily: "'Syne', sans-serif" }}>
                        {runner.firstName?.[0]}{runner.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[11px] text-[#d0d0e8] font-medium">{runner.firstName} {runner.lastName}</p>
                        <p className="text-[9px] text-[#44445a] mt-0.5 font-mono">{runner.id?.slice(-10)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-[11px] text-[#b0b0c8]">{runner.email}</p>
                    <p className="text-[10px] text-[#44445a] mt-0.5">{runner.phone}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    {runner.pendingItems?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {runner.pendingItems.map((item, idx) => <DocPill key={idx} label={item} />)}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#44445a]">
                        {view === 'verified' ? 'All verified' : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge status={runner.runnerStatus} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => dispatch(getRunnerKYCDetails(runner.id))}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] text-[10px] font-bold hover:bg-[#c8ff00]/20 transition-all">
                      <Eye size={11} /> Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {displayData.length === 0 && (
            <div className="py-16 flex flex-col items-center gap-3 text-[#44445a]">
              <Shield size={28} className="opacity-30" />
              <p className="text-xs">
                {status === 'loading' ? 'Loading runners...' : `No ${view} runners found`}
              </p>
            </div>
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