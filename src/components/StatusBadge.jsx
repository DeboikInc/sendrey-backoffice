const StatusBadge = ({ status }) => {
  const styles = {
    pending_review: 'bg-secondary/20 text-secondary border-secondary/30',
    approved: 'bg-primary/20 text-primary border-primary/30',
    rejected: 'bg-red-500/20 text-red-500 border-red-500/30'
  };
  return (
    <span className={`px-2 py-0.5 border rounded text-[10px] font-bold uppercase ${styles[status]}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

export default StatusBadge;