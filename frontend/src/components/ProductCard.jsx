import { Link } from 'react-router-dom'
import { Tag, Wrench, ArrowRight, Star } from 'lucide-react'

const CONDITION_STYLES = {
  New: {
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  Used: {
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  Reconditioned: {
    pill: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
  },
}

export default function ProductCard({ product }) {
  const condition = CONDITION_STYLES[product.condition] || {
    pill: 'bg-trust-50 text-trust-600 border-trust-200',
    dot: 'bg-trust-400',
  }

  return (
    <Link
      to={`/products/${product.id}`}
      className="group overflow-hidden rounded-[2rem] border border-[#f0dfd0] bg-white shadow-[0_18px_42px_rgba(18,21,33,0.08)] transition-all duration-300 hover:-translate-y-2 hover:border-brand-200 hover:shadow-[0_28px_52px_rgba(242,85,31,0.16)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#fff0e6] via-[#fff8f2] to-[#ffe5d4]">
        {product.images?.[0] ? (
          <img
            src={typeof product.images[0] === 'object' ? product.images[0].url : product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-trust-400">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-[0_16px_32px_rgba(18,21,33,0.08)]">
              <Wrench size={26} className="text-brand-500" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-[0.24em]">Image Coming Soon</span>
          </div>
        )}

        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700 shadow-sm">
          <Star size={12} className="fill-brand-400 text-brand-400" />
          Featured
        </div>

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-trust-900/88 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
          <Tag size={11} className="text-brand-300" />
          {product.category}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-trust-900 transition-colors group-hover:text-brand-700">
            {product.title}
          </h3>
          <div className="flex items-end gap-1">
            <span className="pb-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-trust-400">LKR</span>
            <span className="font-mono text-2xl font-bold text-brand-600">
              {product.price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-surface-200 pt-4">
          <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] ${condition.pill}`}>
            <span className={`h-2 w-2 rounded-full ${condition.dot}`} />
            {product.condition}
          </span>

          <div className="flex items-center gap-2 text-sm font-bold text-trust-500 transition-colors group-hover:text-brand-600">
            View Deal
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </Link>
  )
}
