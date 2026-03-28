// components/kyc/RunnerRow.jsx
import { Eye } from 'lucide-react';
import StatusBadge from './StatusBadge';
import DocPill from './DocPill';

export default function RunnerRow({ runner, view, i, onReview }) {
  return (
    <tr
      className="border-b border-[#1a1a2e]/50 hover:bg-[#13131f] transition-colors fade-up"
      style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}
    >
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-md bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-[9px] font-black text-white shrink-0"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {runner.firstName?.[0]}{runner.lastName?.[0]}
          </div>
          <div>
            <p className="text-[11px] text-[#d0d0e8] font-medium">{runner.firstName} {runner.lastName}</p>
            <p className="text-[9px] text-[#44445a] mt-0.5 font-mono">{runner._id?.slice(-10)}</p>
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
          onClick={onReview}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8ff00]/10 border border-[#c8ff00]/20 text-[#c8ff00] text-[10px] font-bold hover:bg-[#c8ff00]/20 transition-all"
        >
          <Eye size={11} /> Review
        </button>
      </td>
    </tr>
  );
}