import { AlertTriangle } from 'lucide-react'

/**
 * A reusable, accessible confirmation modal that replaces window.confirm().
 * Usage:
 * <ConfirmModal
 *   open={isOpen}
 *   title="Delete Product"
 *   message="Are you sure you want to permanently delete this product? This action cannot be undone."
 *   confirmLabel="Delete"
 *   danger
 *   onConfirm={handleConfirm}
 *   onCancel={() => setIsOpen(false)}
 * />
 */
export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-trust-950/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl border border-trust-100 animate-in zoom-in-95 duration-150 overflow-hidden">
        <div className="p-8">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${danger ? 'bg-red-50' : 'bg-trust-50'}`}>
            <AlertTriangle size={24} className={danger ? 'text-red-500' : 'text-trust-400'} />
          </div>
          <h2 className="text-xl font-display font-bold text-trust-900 mb-2">{title}</h2>
          <p className="text-sm font-body text-trust-500 leading-relaxed">{message}</p>
        </div>
        <div className="px-8 pb-8 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-trust-500 bg-trust-50 hover:bg-trust-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider text-white transition-colors ${danger ? 'bg-red-500 hover:bg-red-600' : 'bg-trust-900 hover:bg-trust-800'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
