// components/kyc/RunnerModal.jsx
import { useState } from 'react';
import { ChevronLeft, X, CheckCircle, XCircle } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerifCard from './VerifCard';

export default function RunnerModal({ runner, onClose, onApproveDoc, onRejectDoc, onApproveSelfie, onRejectSelfie }) {
  const [rejectReason, setRejectReason] = useState('');
  const [confirming, setConfirming] = useState(null); // 'approve' | 'reject' | null
  const [submitting, setSubmitting] = useState(false);

  const docs       = runner.documents  || {};
  const biometrics = runner.biometrics || {};

  const idDocs = [];
  if (docs.nin)           idDocs.push({ title: 'NIN Document',      data: docs.nin,           type: 'nin' });
  if (docs.driverLicense) idDocs.push({ title: "Driver's License",  data: docs.driverLicense,  type: 'driverLicense' });
  if (docs.passport)      idDocs.push({ title: 'Passport',          data: docs.passport,       type: 'passport' });

  const hasSelfie = biometrics?.status && biometrics.status !== 'not_submitted';

  const handleApproveAll = async () => {
    setSubmitting(true);
    try {
      for (const doc of idDocs) {
        await onApproveDoc(runner._id, doc.type);
      }
      if (hasSelfie) await onApproveSelfie(runner._id);
      onClose();
    } finally {
      setSubmitting(false);
      setConfirming(null);
    }
  };

  const handleRejectAll = async () => {
    if (!rejectReason.trim()) return;
    setSubmitting(true);
    try {
      for (const doc of idDocs) {
        await onRejectDoc(runner._id, doc.type, rejectReason);
      }
      if (hasSelfie) await onRejectSelfie(runner._id, rejectReason);
      onClose();
    } finally {
      setSubmitting(false);
      setConfirming(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black-200/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl sm:max-h-[88vh] max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-white/10 bg-black-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange hover:border-orange/30 transition-all">
              <ChevronLeft size={14} />
            </button>
            <div>
              <h2 className="text-white font-bold text-sm tracking-tight">{runner.firstName} {runner.lastName}</h2>
              <p className="text-white/40 text-[10px] mt-0.5 truncate max-w-[160px] sm:max-w-none">{runner.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusBadge status={runner.runnerStatus} />
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-crimson hover:border-crimson/30 transition-all">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/5 shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {[['Phone', runner.phone], ['ID', runner._id?.slice(-8)], ['Email', runner.email]].map(([k, v]) => (
            <div key={k} className="shrink-0">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">{k}</p>
              <p className="text-[11px] text-white/70 font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Body — read-only doc display */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4" style={{ scrollbarWidth: 'none' }}>
          {idDocs.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Identity Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {idDocs.map(doc => (
                  <VerifCard
                    key={doc.type}
                    title={doc.title}
                    data={doc.data}
                    type={doc.type}
                    readOnly
                  />
                ))}
              </div>
            </div>
          )}

          {hasSelfie && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Biometric Verification</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VerifCard
                  title="Selfie Image"
                  data={biometrics}
                  type="selfie"
                  readOnly
                />
              </div>
            </div>
          )}

          {idDocs.length === 0 && !hasSelfie && (
            <div className="py-12 text-center text-white/30 text-sm">No documents submitted yet</div>
          )}

          {/* Single rejection reason input — only shown when rejecting */}
          {confirming === 'reject' && (
            <div className="mt-2">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Rejection Reason</p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain why these documents are being rejected..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/25 outline-none resize-none focus:border-crimson/40 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Footer — all or nothing actions */}
        <div className="px-4 sm:px-6 py-4 border-t border-white/5 shrink-0">
          {(idDocs.length > 0 || hasSelfie) && (
            confirming === null ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirming('reject')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-crimson/10 border border-crimson/20 text-crimson text-xs font-bold hover:bg-crimson/20 transition-all"
                >
                  <XCircle size={13} /> Reject All
                </button>
                <button
                  onClick={() => setConfirming('approve')}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-all"
                >
                  <CheckCircle size={13} /> Approve All
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => { setConfirming(null); setRejectReason(''); }}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-bold hover:border-white/20 transition-all disabled:opacity-40"
                >
                  Back
                </button>
                <button
                  onClick={confirming === 'approve' ? handleApproveAll : handleRejectAll}
                  disabled={submitting || (confirming === 'reject' && !rejectReason.trim())}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-40
                    ${confirming === 'approve'
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20'
                      : 'bg-crimson/10 border border-crimson/20 text-crimson hover:bg-crimson/20'
                    }`}
                >
                  {submitting ? 'Submitting...' : confirming === 'approve' ? 'Confirm Approve All' : 'Confirm Reject All'}
                </button>
              </div>
            )
          )}

          {idDocs.length === 0 && !hasSelfie && (
            <button onClick={onClose} className="w-full px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:border-white/20 transition-all">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}