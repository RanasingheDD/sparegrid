import { useState, useEffect, useMemo } from 'react'
import { adminAPI } from '../services/api'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Truck, BarChart3, Users, Package, ShoppingCart, Layers, ArrowRight, Trash2, Search } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'

const REQUEST_STATUSES = ['pending_admin','approved','rejected','processing','completed']
const DELIVERY_STATUSES = ['pending','picked_from_seller','in_delivery','delivered']
const PRODUCT_STATUSES = ['pending', 'active', 'rejected', 'sold']

function StatCard({ label, value, Icon, colorClass }) {
  return (
    <div className="relative overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl transition-transform hover:-translate-y-1 duration-300">
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl ${colorClass}`}></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-white/60 font-body text-[10px] uppercase font-bold tracking-wider mb-1">{label}</p>
          <p className="font-display text-3xl text-white tracking-tight">{value ?? '—'}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/10 shadow-inner`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('products') // 'products' | 'orders' | 'users'
  
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [usersList, setUsersList] = useState([])
  const [stats, setStats] = useState(null)
  
  const [productFilter, setProductFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null) // { title, message, danger, confirmLabel, onConfirm }

  const loadProducts = async () => { setLoading(true); try { const { data } = await adminAPI.getProducts(productFilter); setProducts(data) } finally { setLoading(false) } }
  const loadOrders   = async () => { setLoading(true); try { const { data } = await adminAPI.getOrders(); setOrders(data) } finally { setLoading(false) } }
  const loadUsers    = async () => { setLoading(true); try { const { data } = await adminAPI.getUsers(); setUsersList(data) } finally { setLoading(false) } }
  
  const loadStats = async () => { const { data } = await adminAPI.getStats(); setStats(data) }

  useEffect(() => { loadStats() }, [])
  useEffect(() => { if (tab === 'products') loadProducts() }, [tab, productFilter])
  useEffect(() => { if (tab === 'orders')   loadOrders()   }, [tab])
  useEffect(() => { if (tab === 'users')    loadUsers()    }, [tab])

  const handleTabChange = (t) => { setTab(t); setSearchTerm(''); }

  // Action Handlers
  const approveProduct = async (id, status) => {
    try {
      await adminAPI.approveProduct(id, status)
      if (status === 'active') toast.success('✅ Product approved and is now live on the marketplace.')
      else toast.success('❌ Product listing has been rejected and removed from review queue.')
      loadProducts(); loadStats()
    } catch { toast.error('Failed to update product status. Please try again.') }
  }

  const deleteProduct = (id) => setConfirmAction({
    title: 'Delete Product',
    message: 'This will permanently remove the product listing from the marketplace. All associated data will be lost and this cannot be undone.',
    danger: true,
    confirmLabel: 'Delete Product',
    onConfirm: async () => {
      try { await adminAPI.deleteProduct(id); toast.success('Product removed from the platform.'); loadProducts(); loadStats() }
      catch { toast.error('Failed to delete product. Please try again.') }
      setConfirmAction(null)
    }
  })

  const updateOrder = async (id, delivery_status) => {
    try {
      await adminAPI.updateOrder(id, { delivery_status })
      const label = delivery_status.replace(/_/g, ' ')
      toast.success(`📦 Order status changed to "${label}".`)
      loadOrders()
    } catch { toast.error('Failed to update order status.') }
  }

  const deleteOrder = (id) => setConfirmAction({
    title: 'Delete Order',
    message: 'This will permanently delete this order record. The buyer and seller will lose all tracking history for this transaction.',
    danger: true,
    confirmLabel: 'Delete Order',
    onConfirm: async () => {
      try { await adminAPI.deleteOrder(id); toast.success('Order record deleted.'); loadOrders(); loadStats() }
      catch { toast.error('Failed to delete order.') }
      setConfirmAction(null)
    }
  })

  const deleteUser = (id) => setConfirmAction({
    title: 'Delete User Account',
    message: 'This will permanently delete this user account along with all their listings and order history. This action is irreversible.',
    danger: true,
    confirmLabel: 'Delete Account',
    onConfirm: async () => {
      try { await adminAPI.deleteUser(id); toast.success('User account successfully deleted.'); loadUsers(); loadStats() }
      catch { toast.error('Failed to delete user account.') }
      setConfirmAction(null)
    }
  })
  
  const updateEarnings = async (id, earnings) => {
    try {
      await adminAPI.updateUserEarnings(id, parseFloat(earnings))
      toast.success('Earnings updated')
      loadUsers()
    } catch {
      toast.error('Failed to update earnings')
    }
  }

  const toggleRestriction = async (user) => {
    try {
      const nextRestricted = !user.is_restricted
      let reason = null

      if (nextRestricted) {
        const enteredReason = window.prompt(
          'Enter the reason for restricting this seller account:',
          user.restriction_reason || 'Seller account restricted by SpareGrid admin due to policy violations or failed orders.'
        )

        if (enteredReason === null) {
          return
        }

        reason = enteredReason.trim()
        if (!reason) {
          toast.error('Restriction reason is required.')
          return
        }
      }

      await adminAPI.updateUserRestriction(user.id, nextRestricted, reason)
      toast.success(nextRestricted ? 'Seller account restricted and email notification sent.' : 'Seller restriction removed.')
      loadUsers()
    } catch {
      toast.error('Failed to update seller restriction.')
    }
  }

  // Local Memoized Filters
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products
    const l = searchTerm.toLowerCase()
    return products.filter(p => p.title.toLowerCase().includes(l) || p.seller?.name?.toLowerCase().includes(l))
  }, [products, searchTerm])

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders
    const l = searchTerm.toLowerCase()
    return orders.filter(o => o.id.toLowerCase().includes(l) || o.buyer?.name?.toLowerCase().includes(l) || o.buyer?.phone?.includes(l) || o.seller?.name?.toLowerCase().includes(l) || o.seller?.phone?.includes(l))
  }, [orders, searchTerm])

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return usersList
    const l = searchTerm.toLowerCase()
    return usersList.filter(u => u.name.toLowerCase().includes(l) || u.email.toLowerCase().includes(l) || u.phone?.includes(l))
  }, [usersList, searchTerm])

  return (
    <>
    <div className="min-h-screen bg-trust-50 pb-20">
      {/* Hero Header */}
      <div className="bg-trust-900 pt-10 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600 rounded-full mix-blend-screen filter blur-[120px] opacity-40"></div>
          <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
                <BarChart3 className="text-brand-300" size={20} />
             </div>
             <h1 className="text-2xl text-white font-display tracking-tight">Platform Command</h1>
          </div>
          <p className="text-trust-100/60 font-body text-sm mb-10 max-w-xl">
             Comprehensive administrative oversight. Manage the SpareGrid ecosystem with precision and security.
          </p>
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Live Inventory" value={stats.total_products} Icon={Layers} colorClass="bg-indigo-500" />
              <StatCard label="Pending Orders" value={stats.pending_orders} Icon={ShoppingCart} colorClass="bg-brand-500" />
              <StatCard label="In Delivery" value={stats.active_orders} Icon={Truck} colorClass="bg-emerald-500" />
              <StatCard label="Registered Members" value={stats.total_users} Icon={Users} colorClass="bg-blue-500" />
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-20 relative z-20">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-trust-900/10 border border-trust-100 min-h-[60vh] overflow-hidden">
          
          <div className="flex bg-trust-50/50 border-b border-trust-100 w-full overflow-x-auto no-scrollbar">
            {['products', 'orders', 'users'].map(t => (
              <button
                key={t}
                onClick={() => handleTabChange(t)}
                className={`flex-1 px-8 py-6 text-[11px] font-display tracking-[0.2em] uppercase transition-all duration-300 relative
                  ${tab === t ? 'text-brand-600 bg-white' : 'text-trust-400 hover:text-trust-800 hover:bg-white/50'}`}
              >
                {t.replace('_', ' ')}
                {tab === t && <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-500"></div>}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10">
            {/* Products Tab */}
            {tab === 'products' && (
              <div className="animate-fade-in">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex gap-2 flex-wrap">
                    {PRODUCT_STATUSES.map(s => (
                      <button key={s} onClick={() => setProductFilter(s)} className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all shadow-sm border ${productFilter === s ? 'bg-trust-900 text-white border-trust-900' : 'bg-white text-trust-500 border-trust-200 hover:border-trust-400'}`}>
                        {s.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-trust-300" />
                    <input className="input !py-2 !pl-10 !rounded-xl" placeholder="Search spares..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                </div>

                {loading ? ( <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-trust-50 rounded-2xl animate-pulse" />)}</div> ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20 text-trust-300"><Layers size={48} className="mx-auto mb-4 opacity-10" /><p className="font-body text-lg">No products found.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredProducts.map(p => (
                      <div key={p.id} className="border border-trust-100 bg-white p-5 rounded-2xl shadow-sm hover:border-brand-100 transition-all group flex flex-col justify-between">
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 bg-trust-50 rounded-xl overflow-hidden flex-shrink-0 border border-trust-100">
                            {p.images?.[0] ? <img src={p.images[0]} className="w-full h-full object-cover" /> : <Package className="w-full h-full p-4 text-trust-200" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-display font-bold text-trust-900 leading-tight mb-1">{p.title}</h3>
                            <p className="text-xs text-brand-600 font-mono font-bold">LKR {p.price.toLocaleString()}</p>
                            <p className="text-[10px] text-trust-400 font-body mt-1 uppercase tracking-wider font-bold">Seller: <span className="text-trust-800">{p.seller?.name}</span></p>
                          </div>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-trust-300 hover:bg-red-50 hover:text-red-500 rounded-lg transition"><Trash2 size={16} /></button>
                        </div>
                        <div className="mt-auto pt-4 flex gap-2">
                          <button onClick={() => setSelectedProduct(p)} className="flex-1 bg-trust-50 hover:bg-trust-100 text-trust-600 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition">View</button>
                          {p.status === 'pending' && <button onClick={() => approveProduct(p.id, 'active')} className="flex-1 btn-primary py-2 text-[10px]">Approve</button>}
                          {p.status !== 'pending' && <div className="flex-1 flex justify-end items-center px-2"><StatusBadge status={p.status} /></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders Tab */}
            {tab === 'orders' && (
              <div className="animate-fade-in">
                <div className="relative mb-6">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-trust-300" />
                  <input className="input !pl-12 !py-3" placeholder="Search orders by ID, buyer or seller name, phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                {loading ? ( <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-trust-50 rounded-2xl animate-pulse" />)}</div> ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-20 text-trust-300"><Truck size={48} className="mx-auto mb-4 opacity-10" /><p className="font-body text-lg">No orders found.</p></div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="border border-trust-100 bg-white p-6 rounded-2xl shadow-sm hover:border-brand-100 transition-all">
                        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-6">
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-4">
                              <span className="bg-trust-50 text-trust-400 px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-[0.1em]">Tracking ID</span>
                              <span className="font-mono text-brand-600 font-bold">{order.id}</span>
                            </div>
                            
                            <div className="flex gap-4">
                              <div className="flex-1 bg-trust-50 rounded-xl p-3 border border-trust-100 leading-tight">
                                <p className="text-[10px] uppercase text-trust-400 font-bold mb-1 tracking-wider">Buyer (Ship to)</p>
                                <p className="text-sm font-display font-bold text-trust-900">{order.buyer?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-brand-600 font-mono mt-0.5 font-bold">{order.buyer?.phone || 'No phone'}</p>
                              </div>
                              <ArrowRight className="text-trust-200 self-center" size={16} />
                              <div className="flex-1 bg-white rounded-xl p-3 border border-trust-100 leading-tight">
                                <p className="text-[10px] uppercase text-trust-400 font-bold mb-1 tracking-wider">Seller (Pickup from)</p>
                                <p className="text-sm font-display font-bold text-trust-900">{order.seller?.name || 'Unknown'}</p>
                                <p className="text-[10px] text-trust-500 font-mono mt-0.5 font-bold">{order.seller?.phone || 'No phone'}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3 min-w-[200px]">
                            <StatusBadge status={order.delivery_status} />
                            <p className="text-[10px] text-trust-400 font-mono text-right">
                              Created: {new Date(order.created_at).toLocaleString()}
                            </p>
                            
                            {order.delivery_status === 'pending_admin' ? (
                               <div className="flex gap-2 w-full mt-auto">
                                  <button onClick={() => updateOrder(order.id, 'pending')} className="flex-1 btn-primary py-2 text-[10px]">Approve</button>
                                  <button onClick={() => updateOrder(order.id, 'rejected')} className="flex-1 bg-trust-50 hover:bg-red-50 text-trust-500 hover:text-red-600 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition">Reject</button>
                               </div>
                            ) : (
                               <select
                                 className="input !py-2 !text-xs !rounded-xl cursor-pointer"
                                 value={order.delivery_status}
                                 onChange={e => updateOrder(order.id, e.target.value)}
                               >
                                 {DELIVERY_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                               </select>
                            )}
                          </div>
                        </div>

                        {/* Shipping Details in Order */}
                        <div className="mt-4 p-4 bg-trust-50 rounded-2xl border border-trust-100 space-y-3">
                           <div className="flex justify-between items-start">
                              <div className="flex-1">
                                 <p className="text-[10px] uppercase text-trust-400 font-bold mb-1 tracking-wider">Confirmed Shipping Address</p>
                                 <p className="text-xs text-trust-700 font-body leading-relaxed font-medium">
                                    {order.shipping_address || order.buyer?.address || 'Shipping details not provided'}
                                 </p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] uppercase text-trust-400 font-bold mb-1 tracking-wider">Ordered Item</p>
                                 <p className="text-xs font-bold text-trust-900 font-mono">{order.quantity || 1} PCS</p>
                              </div>
                           </div>
                           {order.message && (
                              <div className="pt-2 border-t border-trust-100">
                                 <p className="text-[10px] uppercase text-trust-400 font-bold mb-1 tracking-wider">Customer Message</p>
                                 <p className="text-xs italic text-trust-600 font-body">"{order.message}"</p>
                              </div>
                           )}
                        </div>

                        <div className="pt-4 border-t border-trust-100 flex justify-between items-center">
                          <p className="text-[10px] text-trust-400 font-mono font-bold uppercase tracking-widest">Ordered: {order.product?.title || 'Unknown'}</p>
                          <button onClick={() => deleteOrder(order.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold text-trust-300 hover:bg-red-50 hover:text-red-600 transition tracking-tighter">
                            <Trash2 size={12} /> Delete Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {tab === 'users' && (
              <div className="animate-fade-in">
                <div className="relative mb-6">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-trust-300" />
                  <input className="input !pl-12 !py-3" placeholder="Search users by name, email, or phone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>

                {loading ? ( <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-trust-50 rounded-xl animate-pulse" />)}</div> ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-20 text-trust-300"><Users size={48} className="mx-auto mb-4 opacity-10" /><p className="font-body text-lg">No users found.</p></div>
                ) : (
                  <div className="bg-white border border-trust-100 rounded-[2rem] overflow-hidden shadow-sm">
                    <table className="w-full text-left font-body text-sm">
                      <thead className="bg-trust-50/50 border-b border-trust-100 text-trust-400 uppercase text-[10px] font-bold tracking-widest">
                        <tr>
                          <th className="px-8 py-5">Verified User</th>
                          <th className="px-6 py-5">Access</th>
                          <th className="px-6 py-5">Communication</th>
                          <th className="px-6 py-5 text-right">Earnings (LKR)</th>
                          <th className="px-6 py-5">Restriction</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-trust-50 text-trust-900">
                        {filteredUsers.map(u => (
                          <tr key={u.id} className="hover:bg-trust-50/30 transition-colors">
                            <td className="px-8 py-5">
                               <div className="flex flex-col">
                                  <span className="font-display font-bold text-trust-900">{u.name}</span>
                                  <span className="text-[10px] text-trust-400 font-mono uppercase tracking-[0.1em]">UID: {u.id.split('-')[0]}</span>
                               </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${u.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-trust-100 text-trust-600'}`}>{u.role}</span>
                            </td>
                            <td className="px-6 py-5 leading-tight">
                              <p className="font-bold text-trust-700">{u.email}</p>
                              <div className="flex gap-2 mt-1">
                                <span className="text-[10px] text-brand-600 font-mono font-bold">{u.phone}</span>
                                {u.phone2 && <span className="text-[10px] text-trust-400 font-mono font-bold">{u.phone2}</span>}
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <input 
                                type="number" 
                                defaultValue={u.earnings || 0} 
                                onBlur={(e) => updateEarnings(u.id, e.target.value)}
                                className="w-28 bg-trust-50 border border-trust-100 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-right focus:border-brand-300 outline-none text-brand-600"
                              />
                            </td>
                            <td className="px-6 py-5">
                              {u.role !== 'admin' ? (
                                <button
                                  onClick={() => toggleRestriction(u)}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition ${
                                    u.is_restricted
                                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                                      : 'bg-trust-50 text-trust-700 border border-trust-200 hover:border-brand-300'
                                  }`}
                                >
                                  {u.is_restricted ? 'Restricted' : 'Restrict Seller'}
                                </button>
                              ) : (
                                <span className="text-[10px] uppercase font-bold tracking-wider text-trust-300">N/A</span>
                              )}
                            </td>
                            <td className="px-8 py-5 text-right">
                              {u.role !== 'admin' && (
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => deleteUser(u.id)} className="p-2 text-trust-200 hover:bg-red-50 hover:text-red-600 rounded-xl transition" title="Delete User">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-trust-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-trust-100 flex justify-between items-center text-trust-900 shrink-0">
              <h2 className="text-2xl font-display font-bold">Audit Product</h2>
              <button onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-trust-50 rounded-full transition-colors text-trust-400">
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto no-scrollbar grow">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {selectedProduct.images?.map((img, i) => {
                   const url = typeof img === 'object' ? img.url : img;
                   return (
                     <img key={i} src={url} className="w-full h-40 object-cover rounded-2xl shadow-sm border border-trust-100" alt={`Product ${i}`} />
                   );
                })}
              </div>

              <div className="space-y-6">
                 <div>
                   <h3 className="text-3xl font-display font-bold text-trust-900 mb-2">{selectedProduct.title}</h3>
                   <div className="flex items-center gap-4">
                     <span className="text-xl font-mono font-bold text-brand-600">LKR {selectedProduct.price?.toLocaleString()}</span>
                     <StatusBadge status={selectedProduct.status} />
                   </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-trust-50 p-4 rounded-2xl border border-trust-100">
                       <p className="text-[10px] uppercase text-trust-400 font-bold mb-1">Category</p>
                       <p className="text-sm font-bold text-trust-800">{selectedProduct.category}</p>
                    </div>
                    <div className="bg-trust-50 p-4 rounded-2xl border border-trust-100">
                       <p className="text-[10px] uppercase text-trust-400 font-bold mb-1">Model Number</p>
                       <p className="text-sm font-bold text-trust-800">{selectedProduct.model_number || 'N/A'}</p>
                    </div>
                 </div>

                 <div className="bg-trust-50 p-4 rounded-2xl border border-trust-100">
                    <p className="text-[10px] uppercase text-trust-400 font-bold mb-1">Seller Identity</p>
                    <p className="text-sm font-bold text-trust-800">{selectedProduct.seller?.name}</p>
                    <p className="text-xs text-trust-500 font-mono mt-1">{selectedProduct.seller?.email} | {selectedProduct.seller?.phone}</p>
                 </div>

                 <div>
                    <p className="text-[10px] uppercase text-trust-400 font-bold mb-2 tracking-widest">Technical Description</p>
                    <p className="text-sm text-trust-700 font-body leading-relaxed whitespace-pre-wrap">{selectedProduct.description}</p>
                 </div>
              </div>
            </div>
            <div className="p-8 bg-trust-50/50 border-t border-trust-100 flex gap-4 shrink-0">
               {selectedProduct.status === 'pending' ? (
                 <>
                   <button 
                    onClick={() => { approveProduct(selectedProduct.id, 'active'); setSelectedProduct(null); }} 
                    className="flex-1 btn-primary py-4"
                   >
                     Approve for Marketplace
                   </button>
                   <button 
                    onClick={() => { approveProduct(selectedProduct.id, 'rejected'); setSelectedProduct(null); }} 
                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-4 rounded-[1.5rem] font-bold uppercase tracking-wider transition"
                   >
                     Reject Listing
                   </button>
                 </>
               ) : (
                 <button onClick={() => setSelectedProduct(null)} className="w-full btn-primary py-4">Close Audit</button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>

    <ConfirmModal
      open={!!confirmAction}
      title={confirmAction?.title}
      message={confirmAction?.message}
      danger={confirmAction?.danger}
      confirmLabel={confirmAction?.confirmLabel}
      onConfirm={confirmAction?.onConfirm}
      onCancel={() => setConfirmAction(null)}
    />
  </>
  )
}
