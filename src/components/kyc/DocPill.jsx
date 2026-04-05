// components/kyc/DocPill.jsx
export default function DocPill({ label }) {
  return (
    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full bg-orange/10 text-orange border border-orange/20 tracking-wide">
      {label}
    </span>
  );
}