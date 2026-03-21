import { useState, useEffect } from 'react'
import { productsAPI, ordersAPI, authAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, Package, ShoppingCart, Truck, ExternalLink, Store, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import ConfirmModal from '../components/ConfirmModal'

const EMPTY_FORM = { title: '', description: '', price: '', category: 'TV', images: [], stock_count: 1, condition: 'Used', model_number: '' }
const SERVICE_CHARGE = 200
const isAdminAcceptedOrder = (status) => status && !['pending_admin', 'rejected'].includes(status)

export default function UserDashboard() {
  const { user, refreshUser } = useAuth()
  if (!user) return null // Guard against null user
  const [activeTab, setActiveTab] = useState('inventory') // 'inventory' | 'purchases' | 'sales'

  const [products, setProducts] = useState([])
  const [buying, setBuying] = useState([])
  const [selling, setSelling] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutForm, setPayoutForm] = useState({ bank_name: '', bank_branch: '', account_number: '', account_name: '' })
  const [updatingPayout, setUpdatingPayout] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const setPayoutField = (key, value) => {
    setPayoutForm((prev) => ({ ...prev, [key]: value.toUpperCase() }))
  }

  const loadData = async () => {
    setLoading(true)
    try {
      await refreshUser()
      if (activeTab === 'inventory') {
        const r = await productsAPI.myProducts()
        setProducts(r.data)
      } else if (activeTab === 'purchases') {
        const r = await ordersAPI.getBuying()
        setBuying(r.data)
      } else if (activeTab === 'sales') {
        const r = await ordersAPI.getSelling()
        setSelling(r.data)
      }
    } catch (err) {
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [activeTab])

  const handleEdit = (p) => {
    setForm({
      title: p.title,
      description: p.description || '',
      price: p.price,
      category: p.category,
      images: p.images || [],
      stock_count: p.stock_count || 1,
      condition: p.condition || 'Used',
      model_number: p.model_number || ''
    })
    setEditingId(p.id)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!editingId && (!user.bank_name || !user.account_number)) {
      setPayoutForm({
        bank_name: user.bank_name || '',
        bank_branch: user.bank_branch || '',
        account_number: user.account_number || '',
        account_name: user.account_name || ''
      })
      setShowPayoutModal(true)
      toast.error('Please complete your payout profile first')
      return
    }

    if (form.images.length === 0) {
      toast.error('Please upload at least one image')
      return
    }

    setSaving(true)
    try {
      // Normalize images to URLs for backend compatibility (List[str] expected)
      const sanitizedImages = form.images.map(img =>
        typeof img === 'object' ? img.url : img
      )

      const payload = {
        ...form,
        images: sanitizedImages,
        price: editingId ? parseFloat(form.price) : parseFloat(form.price) + SERVICE_CHARGE
      }

      if (editingId) {
        await productsAPI.update(editingId, payload)
        toast.success('✏️ Listing updated successfully.')
      } else {
        await productsAPI.create(payload)
        toast.success(`🎉 Your listing has been submitted with a LKR ${SERVICE_CHARGE} service charge added. It will appear on the marketplace after admin review — usually within 24 hours.`)
      }
      setEditingId(null)
      setForm(EMPTY_FORM)
      loadData()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed')
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length + form.images.length > 3) {
      toast.error('Maximum 3 images total')
      return
    }

    setUploading(true)
    const t = toast.loading('Uploading images...')
    try {
      const results = await productsAPI.uploadImages(files)
      // Store the objects so we have public_id for deletion
      setForm(prev => ({
        ...prev,
        images: [...prev.images, ...results]
      }))
      toast.success('Upload complete', { id: t })
    } catch (err) {
      toast.error('Upload failed', { id: t })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async (index) => {
    const img = form.images[index]
    const publicId = typeof img === 'object' ? img.public_id : null

    // Optimistic UI update
    const newImages = form.images.filter((_, i) => i !== index)
    setForm({ ...form, images: newImages })

    if (publicId) {
      try {
        await productsAPI.deleteImage(publicId)
      } catch (err) {
        console.error('Remote deletion failed', err)
      }
    }
  }

  const handleDelete = (id) => {
    setConfirmAction({
      title: 'Remove Listing',
      message: 'This will permanently delete this product listing. Any associated images stored in the cloud will not be removed. Are you sure?',
      danger: true,
      confirmLabel: 'Delete Listing',
      onConfirm: async () => {
        try {
          await productsAPI.delete(id)
          toast.success('Listing removed from your inventory.')
          loadData()
        } catch {
          toast.error('Failed to remove listing. Please try again.')
        }
        setConfirmAction(null)
      }
    })
  }

  const updateQuickStock = async (id, stock_count, status) => {
    try {
      await productsAPI.updateStock(id, stock_count, status)
      toast.success('Stock updated')
      loadData()
    } catch (err) {
      toast.error('Failed to update stock')
    }
  }

  const handleUpdatePayout = async (e) => {
    e.preventDefault()
    setUpdatingPayout(true)
    try {
      const { data } = await authAPI.updateProfile(payoutForm)
      toast.success('Payout profile updated')
      setShowPayoutModal(false)
      refreshUser()
    } catch {
      toast.error('Failed to update payout profile')
    } finally {
      setUpdatingPayout(false)
    }
  }

  const enteredPrice = Number(form.price) || 0
  const finalListingPrice = editingId ? enteredPrice : enteredPrice + SERVICE_CHARGE

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-display text-trust-900 mb-2">My Dashboard</h1>
            <p className="text-trust-500 font-body text-sm mb-4">Manage inventory, track purchases, and monitor earnings.</p>
            <button
              onClick={() => {
                setPayoutForm({
                  bank_name: user.bank_name || '',
                  bank_branch: user.bank_branch || '',
                  account_number: user.account_number || '',
                  account_name: user.account_name || ''
                })
                setShowPayoutModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-trust-200 rounded-2xl text-[10px] uppercase font-bold text-trust-600 hover:border-brand-500 hover:text-brand-600 transition-all shadow-sm"
            >
              <History size={14} /> {user.bank_name ? 'View Payout Profile' : 'Setup Payout Profile'}
            </button>
          </div>

          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-500/20 min-w-[240px] relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <p className="text-[10px] uppercase font-bold tracking-widest opacity-80 mb-1">Available Earnings</p>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium opacity-80">LKR</span>
              <h2 className="text-3xl font-display font-bold">{(user?.earnings || 0.0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-trust-100 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-trust-50 rounded-2xl flex items-center justify-center border border-trust-100">
                  <Store className="text-trust-900" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-display font-bold text-trust-900">Central Warehouse</h3>
                  <p className="text-xs font-body text-trust-400 uppercase tracking-tighter">Official Logistics Point</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest">Office Address</p>
                  <p className="text-sm font-body text-trust-700 leading-relaxed">No 72/181, Alaswaththa, Kirimatimulla, Matara</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-trust-400 uppercase tracking-widest">Logistics Hotline</p>
                  <p className="text-sm font-display font-bold text-trust-900">+94 76 326 1558</p>
                  <p className="text-[9px] text-brand-600 font-bold uppercase py-0.5 px-3 bg-brand-50 rounded-full w-fit">24/7 Logistics Support</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col justify-center">
            <p className="text-xs font-body text-trust-500 leading-relaxed text-center lg:text-left">
              Registration details and bank payouts are processed every Friday.
              Contact our warehouse for emergency delivery coordination or inventory verification.
            </p>
          </div>
        </div>

        {/* Order Detail Modal - Global Level */}
        {showPayoutModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-trust-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-trust-100 flex justify-between items-center bg-trust-50/50">
                <h2 className="text-2xl font-display text-trust-900">{user.bank_name ? 'Payout Profile' : 'Setup Payout Profile'}</h2>
                <button onClick={() => setShowPayoutModal(false)} className="p-2 hover:bg-trust-100 rounded-full transition-colors text-trust-400">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-xs text-trust-500 font-body leading-relaxed">
                  {user.bank_name
                    ? "Your verified payout details. These cannot be changed for security purposes. Contact support if you need to update them."
                    : "Provide your bank account information to receive payments from sales. This is a one-time setup."}
                </p>

                {user.bank_name ? (
                  <div className="space-y-4 bg-trust-50 rounded-3xl p-6 border border-trust-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-trust-400 mb-1">Bank</p>
                        <p className="text-sm font-display font-bold text-trust-900">{user.bank_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-trust-400 mb-1">Branch</p>
                        <p className="text-sm font-display font-bold text-trust-900">{user.bank_branch}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-trust-400 mb-1">A/C Number</p>
                      <p className="text-sm font-mono font-bold text-brand-600">{user.account_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-trust-400 mb-1">A/C Holder</p>
                      <p className="text-sm font-display font-medium text-trust-700">{user.account_name}</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePayout} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body">Bank Name</label>
                        <input type="text" className="input text-xs uppercase" value={payoutForm.bank_name} onChange={e => setPayoutField('bank_name', e.target.value)} placeholder="E.G. HNB" required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body">Branch</label>
                        <input type="text" className="input text-xs uppercase" value={payoutForm.bank_branch} onChange={e => setPayoutField('bank_branch', e.target.value)} placeholder="E.G. GALLE" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body">Account Number</label>
                      <input type="text" className="input text-xs font-mono uppercase" value={payoutForm.account_number} onChange={e => setPayoutField('account_number', e.target.value)} placeholder="0012345678" required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body">Account Holder Name</label>
                      <input type="text" className="input text-xs uppercase" value={payoutForm.account_name} onChange={e => setPayoutField('account_name', e.target.value)} placeholder="E.G. J.D. SILVA" required />
                    </div>
                    <button type="submit" disabled={updatingPayout} className="w-full btn-primary py-4 mt-2">
                      {updatingPayout ? 'Saving...' : 'Confirm Payout Profile'}
                    </button>
                  </form>
                )}

                {user.bank_name && (
                  <button onClick={() => setShowPayoutModal(false)} className="w-full btn-ghost py-4 border-trust-200">Got it</button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Detail Modal - Global Level */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-trust-950/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-trust-100 flex justify-between items-center text-trust-900">
                <h2 className="text-2xl font-display font-bold">Order Details</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-trust-50 rounded-full transition-colors text-trust-400">
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>
              <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="flex gap-6 mb-8">
                  <img src={selectedOrder.product?.images?.[0]} className="w-24 h-24 rounded-3xl object-cover shrink-0 shadow-sm" />
                  <div>
                    <h3 className="text-2xl font-display font-bold text-trust-900 mb-1">{selectedOrder.product?.title}</h3>
                    <p className="text-sm font-mono font-bold text-brand-600 mb-2">LKR {selectedOrder.product?.price?.toLocaleString()}</p>
                    <StatusBadge status={selectedOrder.delivery_status} />
                  </div>
                </div>

                <div className="space-y-6">
                  <section className="bg-trust-50 rounded-3xl p-6 border border-trust-100">
                    <h4 className="text-[10px] uppercase font-bold text-trust-400 mb-4 tracking-widest">Metadata</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-trust-500 font-body">Order ID</span>
                        <span className="font-mono text-brand-600 text-[10px] font-bold">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-trust-500 font-body">Transaction Date</span>
                        <span className="font-bold text-trust-900">{new Date(selectedOrder.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-trust-500 font-body">Transaction Time</span>
                        <span className="font-bold text-trust-900">{new Date(selectedOrder.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-trust-500 font-body">Quantity</span>
                        <span className="font-bold text-brand-600">{selectedOrder.quantity || 1} PCS</span>
                      </div>
                    </div>
                  </section>

                  <section className="px-2">
                    <h4 className="text-[10px] uppercase font-bold text-trust-400 mb-3 tracking-widest">Shipping Destination</h4>
                    <p className="text-sm font-body text-trust-700 leading-relaxed font-medium">{selectedOrder.shipping_address}</p>
                  </section>

                  {isAdminAcceptedOrder(selectedOrder.delivery_status) && (
                    <section className="bg-brand-50 border border-brand-100 rounded-3xl p-6">
                      <h4 className="text-[10px] uppercase font-bold text-brand-600 mb-2 tracking-widest">Delivery Update</h4>
                      <p className="text-sm font-body text-trust-700 leading-relaxed">
                        Your order has been accepted by admin. Delivery time is <span className="font-bold text-brand-700">3-5 working days</span>.
                      </p>
                      <p className="text-xs font-body text-trust-500 leading-relaxed mt-3">
                        For any concern, please contact us and our team will assist you.
                      </p>
                    </section>
                  )}

                  {(selectedOrder.message || selectedOrder.tracking_notes) && (
                    <section className="bg-brand-50 border border-brand-100 rounded-3xl p-6">
                      {selectedOrder.message && (
                        <div className="mb-4">
                          <h4 className="text-[10px] uppercase font-bold text-brand-600 mb-2 tracking-widest">Your Note</h4>
                          <p className="text-xs italic text-brand-700 font-body">"{selectedOrder.message}"</p>
                        </div>
                      )}
                      {selectedOrder.tracking_notes && (
                        <div>
                          <h4 className="text-[10px] uppercase font-bold text-brand-600 mb-2 tracking-widest">Admin Response</h4>
                          <p className="text-xs font-body text-brand-700">{selectedOrder.tracking_notes}</p>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              </div>
              <div className="p-8 bg-trust-50/50">
                <button onClick={() => setSelectedOrder(null)} className="w-full btn-primary py-4">Close View</button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-trust-100 overflow-x-auto no-scrollbar">
          {[
            { id: 'inventory', label: 'My Inventory', icon: <Package size={18} /> },
            { id: 'purchases', label: 'My Purchases', icon: <ShoppingCart size={18} /> },
            { id: 'sales', label: 'Incoming Sales', icon: <Truck size={18} /> }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-display tracking-widest uppercase transition-all relative whitespace-nowrap
              ${activeTab === t.id ? 'text-brand-600' : 'text-trust-400 hover:text-trust-600'}`}
            >
              {t.icon}
              {t.label}
              {activeTab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500"></div>}
            </button>
          ))}
        </div>

        <div className="animate-in fade-in duration-300">
          {activeTab === 'inventory' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 lg:sticky lg:top-24 h-fit">
                <div className="bg-white rounded-3xl border border-trust-100 p-8 shadow-sm">
                  <h2 className="text-xl font-display text-trust-900 mb-6">{editingId ? 'Edit Spare' : 'New Listing'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Title</label>
                      <input type="text" className="input" placeholder="e.g. SAMSUNG TV BOARD" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Model Number (Optional)</label>
                      <input type="text" className="input" placeholder="e.g. BN44-00622B" value={form.model_number} onChange={e => setForm({ ...form, model_number: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Price</label>
                        <input type="number" className="input" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Stock</label>
                        <input type="number" className="input" value={form.stock_count} onChange={e => setForm({ ...form, stock_count: e.target.value })} required />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Category</label>
                        <select className="input appearance-none" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
                          <option value="TV">TV</option>
                          <option value="LAPTOP">LAPTOP</option>
                          <option value="POWER SUPPLY">POWER SUPPLY</option>
                          <option value="MOBILE">MOBILE</option>
                          <option value="COMPUTER">COMPUTER</option>
                          <option value="AC">AC</option>
                          <option value="REFRIGIATOR">REFRIGIATOR</option>
                          <option value="WASHING MACHINE">WASHING MACHINE</option>                          <option value="OTHER">OTHER</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Condition</label>
                        <select className="input appearance-none" value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} required>
                          <option value="New">New</option>
                          <option value="Used">Used</option>
                          <option value="Reconditioned">Reconditioned</option>
                        </select>
                      </div>
                    </div>
                    {!editingId && (
                      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-4">
                        <p className="text-[10px] uppercase font-bold tracking-widest text-brand-700 mb-3">Listing Price Summary</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between text-trust-600">
                            <span>Your entered price</span>
                            <span className="font-mono font-bold text-trust-900">LKR {enteredPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between text-trust-600">
                            <span>Service charge</span>
                            <span className="font-mono font-bold text-trust-900">LKR {SERVICE_CHARGE.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between border-t border-brand-100 pt-2">
                            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-700">Final listing price</span>
                            <span className="font-mono text-base font-bold text-brand-700">LKR {finalListingPrice.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Images (Max 3)</label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          disabled={uploading}
                          onChange={handleImageChange}
                          className="block w-full text-[10px] text-trust-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-brand-50 file:text-brand-600 hover:file:bg-brand-100 transition-all cursor-pointer disabled:opacity-50"
                        />

                        {form.images.length > 0 && (
                          <div className="flex gap-2 p-3 bg-brand-50/30 rounded-2xl border border-brand-100/50">
                            {form.images.map((img, i) => {
                              const url = typeof img === 'object' ? img.url : img
                              return (
                                <div key={i} className="relative group w-12 h-12">
                                  <img src={url} className="w-full h-full object-cover rounded-lg shadow-sm border border-brand-200" />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(i)}
                                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  >
                                    <Plus className="rotate-45" size={10} />
                                  </button>
                                </div>
                              )
                            })}
                            {uploading && (
                              <div className="w-12 h-12 border border-dashed border-brand-300 rounded-lg flex items-center justify-center animate-pulse">
                                <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-trust-400 mb-1.5 font-body tracking-wider">Description</label>
                      <textarea rows="3" className="input resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                    </div>
                    <div className="flex gap-2 pt-2">
                      {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }} className="flex-1 btn-ghost">Cancel</button>}
                      <button type="submit" disabled={saving} className="flex-[2] btn-primary">{saving ? '...' : editingId ? 'Update' : 'Post'}</button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-8">
                {loading && products.length === 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-trust-50 rounded-3xl" />)}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-24 bg-trust-50 rounded-3xl border-2 border-dashed border-trust-200">
                    <Package className="mx-auto mb-4 text-trust-300" size={48} />
                    <p className="text-trust-400 font-body">Empty inventory.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {products.map(p => (
                      <div key={p.id} className="bg-white rounded-3xl border border-trust-100 p-4 shadow-sm hover:border-brand-200 transition-all group">
                        <div className="h-40 rounded-2xl overflow-hidden relative mb-4">
                          <img src={typeof p.images?.[0] === 'object' ? p.images[0].url : p.images?.[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-2 left-2"><StatusBadge status={p.status} /></div>
                        </div>
                        <h3 className="font-display font-bold text-trust-900 truncate">{p.title}</h3>
                        <p className="text-brand-600 font-mono font-bold mb-4">LKR {p.price?.toLocaleString()}</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(p)} className="flex-1 btn-ghost py-2 text-xs"><Edit size={12} /> Edit</button>
                          <button onClick={() => handleDelete(p.id)} className="px-3 btn-ghost text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buying.map(o => (
                <div
                  key={o.id}
                  className="bg-white rounded-3xl border border-trust-100 p-6 shadow-sm hover:border-brand-200 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => setSelectedOrder(o)}
                >
                  <div className="flex gap-4 mb-4">
                    <img src={typeof o.product?.images?.[0] === 'object' ? o.product.images[0].url : o.product?.images?.[0]} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-trust-900 truncate group-hover:text-brand-600 transition-colors uppercase text-xs">{o.product?.title}</h3>
                      <p className="text-[10px] text-trust-400 font-mono">ORDER #{o.id.split('-')[0]}</p>
                    </div>
                  </div>
                  <div className="bg-trust-50 rounded-2xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-trust-400 uppercase">Status</span>
                      <StatusBadge status={o.delivery_status} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-trust-400 uppercase">Price</span>
                      <span className="text-sm font-bold text-trust-900">LKR {o.product?.price?.toLocaleString()}</span>
                    </div>
                  </div>
                  {isAdminAcceptedOrder(o.delivery_status) && (
                    <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-4 mb-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-1">Delivery Time</p>
                      <p className="text-xs font-body text-trust-700 leading-relaxed">
                        3-5 working days. For any concern, contact us.
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-trust-400 uppercase tracking-widest group-hover:text-brand-500 transition-colors">
                    View Details <Plus size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selling.map(o => (
                <div
                  key={o.id}
                  className="bg-white rounded-3xl border border-trust-100 p-6 shadow-sm border-l-4 border-l-brand-400 hover:border-brand-200 transition-all cursor-pointer group"
                  onClick={() => setSelectedOrder(o)}
                >
                  <h3 className="font-display font-bold text-trust-900 mb-1 group-hover:text-brand-600 transition-colors">{o.product?.title}</h3>
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-brand-600 font-mono font-bold">LKR {o.product?.price?.toLocaleString()}</span>
                    <StatusBadge status={o.delivery_status} />
                  </div>
                  <div className="bg-brand-50 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-brand-600 uppercase mb-1">Destination Address</p>
                    <p className="text-xs font-body text-trust-700 leading-relaxed font-medium truncate">{o.shipping_address}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
