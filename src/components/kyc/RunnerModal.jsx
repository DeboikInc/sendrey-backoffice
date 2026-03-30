// components/kyc/RunnerModal.jsx
import { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';
import StatusBadge from './StatusBadge';
import VerifCard from './VerifCard';

export default function RunnerModal({ runner, onClose, onApproveDoc, onRejectDoc, onApproveSelfie, onRejectSelfie }) {
  const [rejectReason, setRejectReason] = useState('');

  const docs       = runner.documents || runner.verificationDocuments || {};
  const biometrics = runner.biometrics || runner.biometricVerification || {};

  const idDocs = [
    docs.nin           && { title: 'NIN Document',     data: docs.nin,           type: 'nin' },
    docs.driverLicense && { title: "Driver's License", data: docs.driverLicense, type: 'driverLicense' },
  ].filter(Boolean);

  const selfieDoc = biometrics?.status && biometrics.status !== 'not_submitted'
    ? { data: biometrics }
    : null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl sm:max-h-[88vh] max-h-[92vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-gray-800 bg-black-100 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black-100 border border-gray-800 flex items-center justify-center text-gray-500 transition-all"
            >
              <ChevronLeft size={15} />
            </button>
            <div>
              <h2 className="text-white font-bold text-sm tracking-tight">
                {runner.firstName} {runner.lastName}
              </h2>
              <p className="text-gray-500 text-[10px] mt-0.5 truncate max-w-[160px] sm:max-w-none">
                {runner.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={runner.runnerStatus} />
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-black-100 border border-gray-800 flex items-center justify-center text-gray-500 transition-all"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Info strip */}
        <div className="flex items-center gap-6 px-4 sm:px-6 py-3 bg-black-100 border-b border-gray-800 shrink-0 overflow-x-auto">
          {[
            ['Phone',  runner.phone],
            ['ID',     runner._id?.slice(-8)],
            ['Status', runner.runnerStatus],
          ].map(([k, v]) => (
            <div key={k} className="shrink-0">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest">{k}</p>
              <p className="text-[11px] text-gray-300 font-medium mt-0.5">{v ?? '—'}</p>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {idDocs.map(doc => (
              <VerifCard
                key={doc.type}
                title={doc.title}
                data={doc.data}
                type="id"
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                onApprove={() => onApproveDoc(runner._id, doc.type)}
                onReject={() => onRejectDoc(runner._id, doc.type, rejectReason)}
              />
            ))}
            {selfieDoc && (
              <VerifCard
                title="Selfie"
                data={selfieDoc.data}
                type="selfie"
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
                onApprove={() => onApproveSelfie(runner._id)}
                onReject={() => onRejectSelfie(runner._id, rejectReason)}
              />
            )}
            {idDocs.length === 0 && !selfieDoc && (
              <div className="col-span-2 py-12 text-center text-gray-600 text-sm">
                No documents submitted yet
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-black-100 border border-gray-800 text-gray-400 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}