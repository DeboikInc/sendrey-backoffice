// components/kyc/VerifCard.jsx
import { FileText, Camera, CheckCircle, XCircle } from 'lucide-react';

export default function VerifCard({ title, data, type, onApprove, onReject, rejectReason, setRejectReason }) {
  const isPending  = data?.status === 'pending_review';
  const isApproved = data?.status === 'approved';
  const isRejected = data?.status === 'rejected';

  return (
    <div className={`rounded-xl border bg-[#0c0c12] overflow-hidden transition-all
      ${isPending ? 'border-[#fbbf24]/30' : isApproved ? 'border-[#c8ff00]/20' : isRejected ? 'border-[#ff4757]/20' : 'border-[#1a1a2e]'}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a2e]">
        <div className="flex items-center gap-2">
          {type === 'id'
            ? <FileText size={14} className="text-[#44445a]" />
            : <Camera   size={14} className="text-[#44445a]" />}
          <span className="text-xs font-bold text-[#d0d0e8] tracking-wide" style={{ fontFamily: "'Syne', sans-serif" }}>
            {title}
          </span>
        </div>
        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border
          ${isPending  ? 'text-[#fbbf24] bg-[#fbbf24]/10 border-[#fbbf24]/20'
          : isApproved ? 'text-[#c8ff00] bg-[#c8ff00]/10 border-[#c8ff00]/20'
          : isRejected ? 'text-[#ff4757] bg-[#ff4757]/10 border-[#ff4757]/20'
          :               'text-[#44445a] bg-[#44445a]/10 border-[#44445a]/20'}`}>
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

      {/* Details */}
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

      {/* Actions — only shown when pending */}
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