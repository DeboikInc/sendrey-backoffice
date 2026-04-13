// components/kyc/VerifCard.jsx
import { FileText, Camera, CheckCircle, XCircle } from 'lucide-react';

export default function VerifCard({ title, data, type, onApprove, onReject, rejectReason, setRejectReason, readOnly }) {
  const isPending  = data?.status === 'pending_review';
  const isApproved = data?.status === 'approved';
  const isRejected = data?.status === 'rejected';

  const borderClass = isPending  ? 'border-orange/30'
                    : isApproved ? 'border-purple/20'
                    : isRejected ? 'border-crimson/20'
                    :              'border-white/10';

  const pillClass   = isPending  ? 'text-orange  bg-orange/10  border-orange/20'
                    : isApproved ? 'text-purple  bg-purple/10  border-purple/20'
                    : isRejected ? 'text-crimson bg-crimson/10 border-crimson/20'
                    :              'text-white/40 bg-white/5   border-white/10';

  // ✅ Server uses documentPath for ID docs, selfieImage for selfie
  const imageUrl = type === 'selfie' ? data?.selfieImage : data?.documentPath;

  return (
    <div className={`rounded-xl border bg-white/5 overflow-hidden transition-all ${borderClass}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          {type === 'id' || type === 'nin' || type === 'driverLicense'
            ? <FileText size={14} className="text-white/30" />
            : <Camera   size={14} className="text-white/30" />}
          <span className="text-xs font-bold text-white/80 tracking-wide">{title}</span>
        </div>
        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${pillClass}`}>
          {data?.status?.replace(/_/g, ' ') || 'Unknown'}
        </span>
      </div>

      {/* Image preview */}
      {imageUrl ? (
        <div className="relative bg-black-200 border-b border-white/5">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-48 object-cover opacity-90"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black-200/40 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="h-24 bg-white/[0.02] border-b border-white/5 flex items-center justify-center">
          <span className="text-xs text-white/20 italic">No image submitted</span>
        </div>
      )}

      {/* Details */}
      <div className="p-4 space-y-2">
        {data?.submittedAt && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30 tracking-wider uppercase">Submitted</span>
            <span className="text-[11px] text-white/60">{new Date(data.submittedAt).toLocaleDateString()}</span>
          </div>
        )}
        {data?.verified !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30 tracking-wider uppercase">Verified</span>
            <span className={`text-[11px] font-medium ${data.verified ? 'text-purple' : 'text-white/40'}`}>
              {data.verified ? 'Yes' : 'No'}
            </span>
          </div>
        )}
        {data?.rejectionReason && (
          <div className="mt-1 px-3 py-2 rounded-lg bg-crimson/10 border border-crimson/20">
            <p className="text-[10px] text-crimson/80">Rejection reason: {data.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Actions — only shown when pending */}
      {isPending && !readOnly && (
        <div className="px-4 pb-4 space-y-2">
          <input
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Rejection reason (required to reject)..."
            className="w-full bg-black-100 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/70 placeholder-white/25 outline-none focus:border-orange/40 transition-colors"
          />
          <div className="flex gap-2">
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-purple/10 border border-purple/20 text-purple text-xs font-bold hover:bg-purple/20 transition-all"
            >
              <CheckCircle size={12} /> Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-crimson/10 border border-crimson/20 text-crimson text-xs font-bold hover:bg-crimson/20 transition-all"
            >
              <XCircle size={12} /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}