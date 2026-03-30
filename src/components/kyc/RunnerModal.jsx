// components/kyc/RunnerModal.jsx
import { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerifCard from './VerifCard';

export default function RunnerModal({ runner, onClose, onApproveDoc, onRejectDoc, onApproveSelfie, onRejectSelfie }) {
  const [rejectReason, setRejectReason] = useState('');

  // ✅ Server returns runner.documents and runner.biometrics
  const docs       = runner.documents       || {};
  const biometrics = runner.biometrics      || {};

  // Build list of submitted ID documents
  const idDocs = [];
  if (docs.nin)          idDocs.push({ title: 'NIN Document',     data: docs.nin,          type: 'nin' });
  if (docs.driverLicense) idDocs.push({ title: "Driver's License", data: docs.driverLicense, type: 'driverLicense' });
  if (docs.passport)     idDocs.push({ title: 'Passport',          data: docs.passport,      type: 'passport' });

  // ✅ Selfie uses biometrics.selfieImage — show if submitted
  const hasSelfie = biometrics?.status && biometrics.status !== 'not_submitted';

  return (
    <div className="fixed inset-0 bg-black-200/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl sm:max-h-[88vh] max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-white/10 bg-black-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-orange hover:border-orange/30 transition-all"
            >
              <ChevronLeft size={14} />
            </button>
            <div>
              <h2 className="text-white font-bold text-sm tracking-tight">
                {runner.firstName} {runner.lastName}
              </h2>
              <p className="text-white/40 text-[10px] mt-0.5 truncate max-w-[160px] sm:max-w-none">
                {runner.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <StatusBadge status={runner.runnerStatus} />
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-crimson hover:border-crimson/30 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div
          className="flex items-center gap-4 sm:gap-8 px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/5 shrink-0 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {[
            ['Phone', runner.phone],
            ['ID',    runner._id?.slice(-8)],
            ['Email', runner.email],
          ].map(([k, v]) => (
            <div key={k} className="shrink-0">
              <p className="text-[9px] text-white/30 uppercase tracking-widest">{k}</p>
              <p className="text-[11px] text-white/70 font-medium mt-0.5">{v}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* ID documents */}
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
                    rejectReason={rejectReason}
                    setRejectReason={setRejectReason}
                    onApprove={() => onApproveDoc(runner._id, doc.type)}
                    onReject={() => onRejectDoc(runner._id, doc.type, rejectReason)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Selfie */}
          {hasSelfie && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-3">Biometric Verification</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <VerifCard
                  title="Selfie Image"
                  data={biometrics}
                  type="selfie"
                  rejectReason={rejectReason}
                  setRejectReason={setRejectReason}
                  onApprove={() => onApproveSelfie(runner._id)}
                  onReject={() => onRejectSelfie(runner._id, rejectReason)}
                />
              </div>
            </div>
          )}

          {/* Nothing submitted */}
          {idDocs.length === 0 && !hasSelfie && (
            <div className="py-12 text-center text-white/30 text-sm">
              No documents submitted yet
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-white/5 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs font-bold hover:border-white/20 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}