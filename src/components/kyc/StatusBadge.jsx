// components/kyc/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const map = {
    pending_verification: { label: 'Pending',      classes: 'text-orange bg-orange/10 border-orange/20' },
    approved_full:        { label: 'Approved',      classes: 'text-purple bg-purple/10 border-purple/20' },
    approved_limited:     { label: 'Ltd. Approved', classes: 'text-royal bg-royal/10 border-royal/20'   },
    rejected:             { label: 'Rejected',      classes: 'text-crimson bg-crimson/10 border-crimson/20' },
    banned:               { label: 'Banned',        classes: 'text-crimson bg-crimson/10 border-crimson/20' },
  };
  const s = map[status] || { label: status ?? 'Unknown', classes: 'text-white/40 bg-white/5 border-white/10' };
  return (
    <span className={`inline-flex items-center text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${s.classes}`}>
      {s.label}
    </span>
  );
}