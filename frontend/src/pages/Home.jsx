import { useState, useEffect } from 'react'
import { productsAPI } from '../services/api'
import ProductCard from '../components/ProductCard'
import {
  Search,
  SlidersHorizontal,
  ShieldCheck,
  Truck,
  Store,
  ArrowRight,
  CircuitBoard,
  ScanSearch,
  Layers3,
} from 'lucide-react'

const CATEGORIES = [
  'All',
  'TV',
  'POWER SUPPLY',
  'WASHING MACHINE',
  'LAPTOP',
  'MOBILE',
  'REFRIGIATOR',
  'OTHER',
]

const FEATURE_CARDS = [
  {
    icon: ShieldCheck,
    title: 'Trusted listings',
    text: 'A cleaner buying flow with reviewed marketplace inventory and clearer product presentation.',
  },
  {
    icon: ScanSearch,
    title: 'Faster sourcing',
    text: 'Search boards, modules, and spare parts quickly without digging through cluttered screens.',
  },
  {
    icon: Truck,
    title: 'Local marketplace flow',
    text: 'Built for buyers, sellers, and repair technicians who need a more practical sourcing experience.',
  },
]

const QUICK_LABELS = [
  'Real spare-part listings',
  'Cleaner marketplace search',
  'Made for repair workflows',
]

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [searchInput, setSearchInput] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (category !== 'All') params.category = category
      const { data } = await productsAPI.list(params)
      setProducts(data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [search, category])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f2f0ea]">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(242,240,234,0.4)_0%,rgba(242,240,234,0.92)_45%,#f2f0ea_100%)]" />

      <section className="relative isolate overflow-hidden border-b border-black/5 bg-[#181611] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90"
          style={{ backgroundImage: "url('/image-bg.png')" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,85,31,0.25),transparent_32%),linear-gradient(115deg,rgba(17,15,12,0.92)_18%,rgba(17,15,12,0.70)_52%,rgba(17,15,12,0.86)_100%)]" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
          <div className="flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                <CircuitBoard size={14} className="text-brand-300" />
                LankaParts Marketplace
              </div>

              <h1 className="mt-8 max-w-4xl font-display text-5xl font-bold leading-[0.92] text-white md:text-7xl">
                Spare parts,
                <span className="block text-[#f7b28d]">without the messy marketplace feel.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-white/72 md:text-lg">
                A cleaner electronics spare-parts marketplace for buyers, sellers, and repair technicians who want to
                search faster, compare better, and shop with more confidence.
              </p>

              <form
                onSubmit={handleSearch}
                className="mt-8 max-w-3xl rounded-[2rem] border border-white/10 bg-white/95 p-3 shadow-[0_24px_64px_rgba(0,0,0,0.22)]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-[1.35rem] bg-[#f6f2eb] px-4 py-4">
                    <Search size={22} className="text-brand-500" />
                    <input
                      className="w-full bg-transparent text-base font-medium text-trust-900 placeholder:text-trust-300 focus:outline-none"
                      placeholder="Search TV boards, modules, power supplies..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-primary px-8 py-4">
                    Search Now
                  </button>
                </div>
              </form>

              <div className="mt-7 flex flex-wrap gap-3">
                {QUICK_LABELS.map((label) => (
                  <div
                    key={label}
                    className="rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-semibold text-white/84 backdrop-blur-sm"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-end">
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-md">
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-300">Marketplace feel</div>
              <h2 className="mt-3 text-3xl font-bold text-white">A more grounded, realistic storefront.</h2>
              <p className="mt-4 text-sm leading-7 text-white/68">
                Less noise, better product focus, and a layout that feels closer to how real people browse for parts.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {FEATURE_CARDS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[1.7rem] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-300">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/68">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-7xl px-4 py-8 lg:py-12">
        <section className="grid gap-6 lg:grid-cols-[0.74fr_1.26fr]">
          <div className="rounded-[2rem] border border-black/5 bg-[#f7f4ee] p-7 shadow-[0_18px_54px_rgba(18,21,33,0.06)]">
            <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">
              <Store size={14} />
              Browse better
            </div>
            <h2 className="mt-4 text-3xl font-bold text-trust-900">Search by category, then move fast.</h2>
            <p className="mt-4 text-sm leading-7 text-trust-600">
              Pick a category and narrow the listing feed without losing the calm, clean layout of the storefront.
            </p>
          </div>

          <div className="rounded-[2rem] border border-black/5 bg-white/90 p-5 shadow-[0_18px_54px_rgba(18,21,33,0.06)] backdrop-blur-md md:p-6">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.18em] transition-all ${
                    category === cat
                      ? 'bg-trust-900 text-white shadow-[0_14px_28px_rgba(18,21,33,0.18)]'
                      : 'bg-[#f5eee4] text-trust-600 hover:bg-brand-50 hover:text-brand-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">Active listings</div>
              <h2 className="mt-2 text-3xl font-bold text-trust-900">Parts ready to browse</h2>
              <p className="mt-2 text-sm text-trust-500">
                {loading ? 'Refreshing inventory...' : `${products.length} listings currently available`}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/5 bg-white px-4 py-2 text-sm font-semibold text-trust-600 shadow-sm">
              <Layers3 size={16} className="text-brand-500" />
              Cleaner feed, easier scanning
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[320px] animate-pulse rounded-[2rem] bg-white shadow-sm" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="retail-panel py-20 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff2e9] text-brand-500">
                <SlidersHorizontal size={30} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-trust-900">No matching spares right now</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-trust-500">
                Try another search term or switch categories to see more available marketplace listings.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </section>

        <section className="mt-12 rounded-[2rem] border border-black/5 bg-[#14110d] px-6 py-8 text-white shadow-[0_22px_60px_rgba(18,21,33,0.12)] md:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.18)] backdrop-blur-md sm:h-20 sm:w-20">
                  <img src="/logo.png" alt="LankaParts logo" className="h-full w-full object-cover" />
                </div>
                <div className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-300">LankaParts</div>
              </div>
              <h2 className="mt-2 text-3xl font-bold text-white">A calmer marketplace for technical buyers and sellers.</h2>
            </div>
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-white/78">
              <ArrowRight size={16} className="text-brand-300" />
              Search, compare, and source more comfortably
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
