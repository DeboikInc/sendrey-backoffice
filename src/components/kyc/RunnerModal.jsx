// components/kyc/RunnerModal.jsx
import { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerifCard from './VerifCard';

export default function RunnerModal({ runner, onClose, onApproveDoc, onRejectDoc, onApproveSelfie, onRejectSelfie }) {
  const [rejectReason, setRejectReason] = useState('');

  const docs       = runner.documents || runner.verificationDocuments || {};
  const biometrics = runner.biometrics || runner.biometricVerification || {};

  // Pick first available ID document
  let idDoc = null;
  for (const t of ['nin', 'driverLicense']) {
    if (docs[t]) {
      idDoc = { title: t === 'nin' ? 'NIN Document' : "Driver's License", data: docs[t], type: t };
      break;
    }
  }
  const selfieDoc = biometrics?.status !== 'not_submitted' ? { data: biometrics } : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="w-full sm:max-w-2xl sm:max-h-[88vh] max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-[#1a1a2e] bg-[#0c0c12] overflow-hidden"
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[#1a1a2e] shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#13131f] border border-[#1a1a2e] flex items-center justify-center text-[#44445a] hover:text-[#c8ff00] hover:border-[#c8ff00]/30 transition-all">
              <ChevronLeft size={14} />
            </button>
            <div>
              <h2 className="text-white font-black text-sm tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                {runner.firstName} {runner.lastName}
              </h2>
              <p className="text-[#44445a] text-[10px] tracking-wide mt-0.5 truncate max-w-[160px] sm:max-w-none">
                {runner.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusBadge status={runner.runnerStatus} />
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-[#13131f] border border-[#1a1a2e] flex items-center justify-center text-[#44445a] hover:text-[#ff4757] hover:border-[#ff4757]/30 transition-all">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 bg-[#0f0f1a] border-b border-[#1a1a2e] shrink-0 overflow-x-auto scrollbar-none">
          {[['Phone', runner.phone], ['ID', runner._id?.slice(-8)]].map(([k, v]) => (
            <div key={k} className="shrink-0">
              <p className="text-[9px] text-[#44445a] uppercase tracking-widest">{k}</p>
              <p className="text-[11px] text-[#b0b0c8] font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {idDoc && (
              <VerifCard
                title={idDoc.title} data={idDoc.data} type="id"
                rejectReason={rejectReason} setRejectReason={setRejectReason}
                onApprove={() => onApproveDoc(runner._id, idDoc.type)}
                onReject={() => onRejectDoc(runner._id, idDoc.type, rejectReason)}
              />
            )}
            {selfieDoc && (
              <VerifCard
                title="Selfie Image" data={selfieDoc.data} type="selfie"
                rejectReason={rejectReason} setRejectReason={setRejectReason}
                onApprove={() => onApproveSelfie(runner._id)}
                onReject={() => onRejectSelfie(runner._id, rejectReason)}
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
        <div className="px-4 sm:px-6 py-4 border-t border-[#1a1a2e] flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 rounded-lg bg-[#13131f] border border-[#1a1a2e] text-[#b0b0c8] text-xs font-bold hover:border-[#2a2a3e] transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}