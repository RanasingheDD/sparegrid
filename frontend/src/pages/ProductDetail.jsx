import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productsAPI, ordersAPI, policyAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import StatusBadge from '../components/StatusBadge'
import SiteNoticeModal, { NOTICE_KEY } from '../components/SiteNoticeModal'
import { resolvePlatformCosts } from '../config/platformCosts'
import toast from 'react-hot-toast'
import { ArrowLeft, Wrench, Tag, User, Phone, ShieldCheck } from 'lucide-react'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct]     = useState(null)
  const [loading, setLoading]     = useState(true)
  const [ordering, setOrdering] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [activeOrder, setActiveOrder] = useState(null)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [policies, setPolicies] = useState(null)
  const [showNotice, setShowNotice] = useState(false)
  
  const [reqForm, setReqForm] = useState({ 
    quantity: 1, 
    shipping_address: user?.address || '', 
    message: '' 
  })

  // Sync address when user changes or loads
  useEffect(() => {
    if (user?.address && !reqForm.shipping_address) {
        setReqForm(prev => ({ ...prev, shipping_address: user.address }))
    }
  }, [user])

  useEffect(() => {
    if (!showModal) return

    setReqForm((prev) => ({
      ...prev,
      quantity: 1,
      shipping_address: user?.address || '',
      message: '',
    }))
  }, [showModal, user])

  useEffect(() => {
    policyAPI.getPublic().then(({ data }) => setPolicies(data)).catch(() => {})
  }, [])

  useEffect(() => {
    productsAPI.get(id)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))

    if (user) {
      ordersAPI.checkStatus(id).then(r => {
        if (r.data.has_active_request) setActiveOrder(r.data.request)
      })
    }
  }, [id, user])

  const handleOrder = async (e) => {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setOrdering(true)
    try {
      await ordersAPI.create(id, reqForm)
      toast.success('Order submitted! We\'ll review it shortly.')
      setShowModal(false)
      // Re-check status to show "Order Pending"
      const r = await ordersAPI.checkStatus(id)
      if (r.data.has_active_request) setActiveOrder(r.data.request)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit order')
    } finally {
      setOrdering(false)
    }
  }

  const startOrderFlow = () => {
    if (!user) {
      navigate('/login')
      return
    }

    if (sessionStorage.getItem(NOTICE_KEY)) {
      setShowModal(true)
      return
    }

    setShowNotice(true)
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse bg-white min-h-screen">
      <div className="h-6 w-24 bg-trust-50 rounded-xl mb-8" />
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-trust-50 rounded-[2.5rem]" />
        <div className="space-y-6">
          <div className="h-10 bg-trust-50 rounded-2xl w-3/4" />
          <div className="h-6 bg-trust-50 rounded-2xl w-1/4" />
          <div className="h-32 bg-trust-50 rounded-3xl w-full" />
        </div>
      </div>
    </div>
  )

  if (!product) return null

  const costs = resolvePlatformCosts(policies)
  const shippingCost = costs.buyerShippingCost
  const orderQuantity = Number(reqForm.quantity) || 1
  const itemSubtotal = (product.price || 0) * orderQuantity
  const totalCost = itemSubtotal + shippingCost

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 min-h-screen bg-white">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-trust-400 hover:text-brand-600 text-[10px] font-bold uppercase tracking-widest mb-8 transition-all group">
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
      </button>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square bg-trust-50 rounded-[3rem] overflow-hidden border border-trust-100 shadow-inner">
            {product.images?.length > 0 ? (
              <img src={typeof product.images[activeImageIdx] === 'object' ? product.images[activeImageIdx].url : product.images[activeImageIdx]} alt={product.title} className="w-full h-full object-cover animate-in fade-in duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-trust-200">
                <Wrench size={80} strokeWidth={1} />
              </div>
            )}
          </div>
          
          {product.images?.length > 1 && (
            <div className="flex gap-4 px-2">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImageIdx === i ? 'border-brand-500 scale-105 shadow-lg shadow-brand-500/10' : 'border-trust-100 opacity-60 hover:opacity-100'}`}
                >
                  <img src={typeof img === 'object' ? img.url : img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={product.condition} />
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-trust-50 text-trust-500 border-trust-100 flex items-center gap-1.5">
                <Tag size={12} />{product.category}
              </span>
            </div>
            <h1 className="text-4xl font-display font-bold text-trust-900 leading-tight">{product.title}</h1>
          </div>

          <div className="font-mono text-4xl font-bold text-brand-600 tracking-tighter">
            LKR {product.price.toLocaleString()}
          </div>

          <div className="rounded-[2rem] border border-trust-100 bg-trust-50/70 p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-trust-400 mb-3">Buyer Cost Notice</p>
            <div className="space-y-2 text-sm text-trust-700">
              <div className="flex items-center justify-between">
                <span>Item price</span>
                <span className="font-mono font-bold text-trust-900">LKR {product.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping cost</span>
                <span className="font-mono font-bold text-trust-900">LKR {shippingCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between border-t border-trust-100 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Total payable</span>
                <span className="font-mono text-base font-bold text-brand-600">LKR {(product.price + shippingCost).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {product.model_number && (
            <div className="bg-trust-50 font-mono text-[10px] font-bold text-trust-400 px-3 py-1.5 rounded-lg border border-trust-100 w-fit">
              MODEL: {product.model_number}
            </div>
          )}

          {product.description && (
            <div className="bg-trust-50/50 p-6 rounded-3xl border border-trust-100/50 relative">
               <p className="whitespace-pre-wrap break-words text-trust-600 font-body text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Admin Broker Info */}
          <div className="p-6 flex items-start gap-4 bg-brand-50/50 border border-brand-100 rounded-[2rem] relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <ShieldCheck size={80} className="text-brand-600" />
            </div>
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-brand-100 flex items-center justify-center flex-shrink-0 relative z-10">
              <ShieldCheck size={20} className="text-brand-600" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-trust-400 mb-1">Guaranteed Secure Brokerage</p>
              <p className="text-xs text-brand-950 font-medium leading-relaxed">
                Every transaction and request is securely brokered by our administrative team to protect your privacy and ensure authenticity.
              </p>
            </div>
          </div>

          {/* Order button logic */}
          {product.status === 'active' && (!user || user.role === 'user') && (
            <div className="pt-4 border-t border-trust-50 mt-4">
              {activeOrder ? (
                <div className="flex flex-col gap-3">
                   <button disabled className="w-full bg-trust-50 text-trust-400 border border-trust-100 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                      Request {activeOrder.delivery_status?.replace('_', ' ')}
                   </button>
                   <p className="text-center text-[10px] text-trust-400 font-bold uppercase tracking-tighter">
                      You already have an active order for this item.
                   </p>
                </div>
              ) : (
                <button
                  onClick={startOrderFlow}
                  className="btn-primary w-full py-5 text-sm shadow-xl shadow-brand-500/20"
                >
                  Confirm Purchase Request
                </button>
              )}
            </div>
          )}

          {product.status === 'sold' && (
            <div className="text-center py-5 bg-trust-50 text-trust-400 font-bold text-xs uppercase tracking-widest border border-trust-100 rounded-2xl">
              Inventory Depleted (Sold)
            </div>
          )}

          {product.status === 'out_of_stock' && (
            <div className="text-center py-5 bg-rose-50 text-rose-600 font-bold text-xs uppercase tracking-widest border border-rose-100 rounded-2xl">
              Currently Unavailable
            </div>
          )}
        </div>
      </div>

      {/* Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-trust-950/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
           <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm max-h-[calc(100vh-2rem)] overflow-y-auto p-6 sm:p-8 md:p-10 animate-in fade-in zoom-in duration-300 border border-trust-100">
              <h2 className="text-3xl font-display font-bold text-trust-900 mb-2">Request Item</h2>
              <p className="text-xs text-trust-400 font-bold uppercase tracking-wider mb-8">Brokerage Management</p>
              
              <form onSubmit={handleOrder} className="space-y-6">
                 <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-trust-400 mb-2 px-1">Order Quantity (Units)</label>
                    <input 
                      type="number" 
                      className="input !py-4" 
                      min="1" 
                      max={product.stock_count || 999}
                      value={reqForm.quantity}
                      onChange={e => setReqForm({...reqForm, quantity: e.target.value})}
                      required
                    />
                    <div className="flex justify-between items-center mt-2 px-1">
                       <p className="text-[10px] text-brand-600 font-bold uppercase tracking-tighter">{product.stock_count || 1} units in inventory</p>
                       <p className="text-[10px] text-trust-300 font-mono">ID: {product.id.split('-')[0]}</p>
                    </div>
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-trust-400 mb-2 px-1">Delivery Destination</label>
                    <textarea 
                      className="input !py-4 resize-none !rounded-2xl" 
                      rows={2}
                      placeholder="Street, City, Province..."
                      value={reqForm.shipping_address}
                      onChange={e => setReqForm({...reqForm, shipping_address: e.target.value})}
                      required
                    />
                 </div>

                 <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-trust-400 mb-2 px-1">Order Message (Optional)</label>
                    <textarea 
                      className="input !py-4 resize-none !rounded-2xl" 
                      rows={2}
                      placeholder="Special instructions for our team..."
                      value={reqForm.message}
                      onChange={e => setReqForm({...reqForm, message: e.target.value})}
                    />
                 </div>

                 <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-600 mb-3">Order Cost Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between text-trust-700">
                        <span>Item subtotal</span>
                        <span className="font-mono font-bold text-trust-900">LKR {itemSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-trust-700">
                        <span>Shipping cost</span>
                        <span className="font-mono font-bold text-trust-900">LKR {shippingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between border-t border-brand-100 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-600">Total cost</span>
                        <span className="font-mono text-base font-bold text-brand-600">LKR {totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="w-full sm:flex-1 text-[10px] font-bold uppercase tracking-widest text-trust-400 hover:text-trust-900 transition-colors py-3">
                      Abort
                    </button>
                    <button type="submit" disabled={ordering} className="w-full sm:flex-[2] btn-primary py-4">
                       {ordering ? 'Processing...' : 'Place Request'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showNotice && (
        <SiteNoticeModal
          onAcknowledge={() => {
            setShowNotice(false)
            setShowModal(true)
          }}
          onClose={() => setShowNotice(false)}
        />
      )}
    </div>
  )
}
