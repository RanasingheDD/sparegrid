const CONFIG = {
  // Request statuses
  pending_admin: { label: 'Pending Review', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  approved:      { label: 'Approved',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  rejected:      { label: 'Rejected',       cls: 'bg-rose-50 text-rose-700 border-rose-100' },
  processing:    { label: 'Processing',     cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  completed:     { label: 'Completed',      cls: 'bg-trust-50 text-trust-400 border-trust-100' },

  // Delivery statuses
  pending:             { label: 'Pending',          cls: 'bg-amber-50 text-amber-700 border-amber-100' },
  picked_from_seller:  { label: 'Picked Up',        cls: 'bg-violet-50 text-violet-700 border-violet-100' },
  in_delivery:         { label: 'In Delivery',      cls: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
  delivered:           { label: 'Delivered',        cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },

  // Product statuses
  active:  { label: 'Active',  cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  sold:    { label: 'Sold',    cls: 'bg-trust-50 text-trust-400 border-trust-100' },
}

export default function StatusBadge({ status }) {
  const cfg = CONFIG[status] || { label: status, cls: 'bg-trust-50 text-trust-400 border-trust-100' }
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}
