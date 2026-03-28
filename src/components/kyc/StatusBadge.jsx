export default function StatusBadge({ status }) {
  const map = {
    pending_verification: { label: 'Pending',      color: 'text-[#fbbf24]', bg: 'bg-[#fbbf24]/10', border: 'border-[#fbbf24]/20' },
    approved_full:        { label: 'Approved',      color: 'text-[#c8ff00]', bg: 'bg-[#c8ff00]/10', border: 'border-[#c8ff00]/20' },
    approved_limited:     { label: 'Ltd. Approved', color: 'text-[#38bdf8]', bg: 'bg-[#38bdf8]/10', border: 'border-[#38bdf8]/20' },
    rejected:             { label: 'Rejected',      color: 'text-[#ff4757]', bg: 'bg-[#ff4757]/10', border: 'border-[#ff4757]/20' },
  };
  const s = map[status] || { label: status, color: 'text-[#44445a]', bg: 'bg-[#44445a]/10', border: 'border-[#44445a]/20' };
  return (
    <span className={`inline-flex items-center text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded-full border ${s.color} ${s.bg} ${s.border}`}>
      {s.label}
    </span>
  );
}