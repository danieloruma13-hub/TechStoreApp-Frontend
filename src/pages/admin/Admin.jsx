import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../context/store'
import api from '../../utils/api'
import { fmt, firstImage } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { 
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Plus, 
  Pencil, Trash2, X, Search, ChevronDown, DollarSign, 
  ShoppingCart, ArrowLeft, Save, LogOut, Eye 
} from 'lucide-react'
import './Admin.css'

// --- HELPER COMPONENTS ---
function Spinner() { return <div className="adm-spinner"/> }

const ORDER_STATUSES   = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']
const PAYMENT_STATUSES = ['pending','paid','failed','refunded']

const statusColor = (s) => ({
  pending:'#a855f7', confirmed:'#3b82f6', processing:'#f97316', 
  shipped:'#f97316', delivered:'#22c55e', cancelled:'#ef4444', 
  refunded:'#ef4444', paid:'#22c55e', failed:'#ef4444'
}[s] || '#6b7280')

function Badge({ status }) {
  const c = statusColor(status)
  return <span className="adm-badge" style={{color:c, borderColor:c+'55', background:c+'18'}}>{status}</span>
}

// --- SUB-PAGES ---

function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="adm-center"><Spinner /></div>

  // Safety checks for card values
  const cards = [
    { label: 'Total Revenue', value: fmt(data?.stats?.revenue ?? 0), icon: DollarSign, color: '#22c55e' },
    { label: 'Total Orders', value: data?.stats?.orders ?? 0, icon: ShoppingCart, color: '#f97316' },
    { label: 'Products', value: data?.stats?.products ?? 0, icon: Package, color: '#7c3aed' },
    { label: 'Customers', value: data?.stats?.users ?? 0, icon: Users, color: '#3b82f6' }
  ]

  return (
    <div className="adm-page">
      <h1 className="adm-page-title">Dashboard</h1>
      <div className="adm-stat-grid">
        {cards.map(c => (
          <div key={c.label} className="adm-stat-card">
            <div className="adm-stat-icon" style={{ background: c.color + '18', color: c.color }}><c.icon size={22} /></div>
            <div>
              <p className="adm-stat-val">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</p>
              <p className="adm-stat-label">{c.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="adm-two-col">
        <div className="adm-card">
          <h3 className="adm-card-title">Recent Orders</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>#</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {(data?.recentOrders || []).map(o => (
                  <tr key={o.id}>
                    <td className="adm-mono">{o.order_number}</td>
                    <td>{o.full_name || 'Guest'}</td>
                    <td>{fmt(o.total_amount)}</td>
                    <td><Badge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="adm-card">
          <h3 className="adm-card-title">Top Products</h3>
          <div className="adm-top-products">
            {(data?.topProducts || []).map((p, i) => (
              <div key={p.slug || i} className="adm-top-product">
                <span className="adm-top-rank">#{i + 1}</span>
                <div className="adm-top-img">
                  {firstImage(p.images) ? <img src={firstImage(p.images)} alt={p.name} /> : <span>📦</span>}
                </div>
                <div className="adm-top-info">
                  <p className="adm-top-name">{p.name}</p>
                  <p className="adm-top-price">{fmt(p.price)}</p>
                </div>
                <span className="adm-top-sold">{p.sold_count ?? 0} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductModal({ product, categories, onClose, onSave }) {
  const blank = { name: '', slug: '', brand: '', model: '', price: '', compare_price: '', sku: '', stock_quantity: '0', category_id: '', short_description: '', description: '', images: '', specs: '', tags: '', is_featured: false, is_new: false, is_active: true }
  
  const toForm = (p) => ({
    ...blank, 
    ...p, 
    price: String(p.price || ''), 
    compare_price: String(p.compare_price || ''), 
    stock_quantity: String(p.stock_quantity ?? 0), 
    images: Array.isArray(p.images) ? p.images.map(i => i.url || i).join('\n') : '', 
    specs: typeof p.specs === 'object' ? JSON.stringify(p.specs, null, 2) : (p.specs || ''), 
    tags: Array.isArray(p.tags) ? p.tags.join(', ') : '' 
  })

  const [form, setForm] = useState(product ? toForm(product) : blank)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const onName = (v) => {
    set('name', v)
    if (!product) set('slug', v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.price) { toast.error('Price is required'); return }
    let parsedSpecs = {}
    try { parsedSpecs = form.specs.trim() ? JSON.parse(form.specs) : {} } catch { toast.error('Specs must be valid JSON'); return }
    
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
        stock_quantity: parseInt(form.stock_quantity) || 0,
        specs: parsedSpecs,
        images: form.images.split('\n').map(url => ({ url: url.trim(), alt: form.name })).filter(img => img.url),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      }
      if (product) await api.put(`/admin/products/${product.id}`, payload)
      else await api.post('/admin/products', payload)
      toast.success('Success!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e => e.stopPropagation()}>
        <div className="adm-modal-header"><h2>{product ? 'Edit Product' : 'Add New Product'}</h2><button className="adm-icon-btn" onClick={onClose}><X size={20} /></button></div>
        <div className="adm-modal-body">
          <div className="adm-field-full"><label className="adm-label">Product Name *</label><input className="adm-input" value={form.name} onChange={e => onName(e.target.value)} /></div>
          <div className="adm-field-row">
            <div><label className="adm-label">Price (₦) *</label><input className="adm-input" type="number" value={form.price} onChange={e => set('price', e.target.value)} /></div>
            <div><label className="adm-label">Stock</label><input className="adm-input" type="number" value={form.stock_quantity} onChange={e => set('stock_quantity', e.target.value)} /></div>
          </div>
          <div className="adm-field-full"><label className="adm-label">Image URLs (one per line)</label><textarea className="adm-input adm-textarea adm-mono-text" rows={3} value={form.images} onChange={e => set('images', e.target.value)} /></div>
        </div>
        <div className="adm-modal-footer"><button className="adm-btn adm-btn-ghost" onClick={onClose}>Cancel</button><button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner /> : <Save size={16} />} Save</button></div>
      </div>
    </div>
  )
}

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/products?limit=50')
      setProducts(data.products || [])
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h1 className="adm-page-title">Products <span className="adm-count">{products.length}</span></h1>
        <button className="adm-btn adm-btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Add Product</button>
      </div>
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? <div className="adm-center"><Spinner /></div> : (
            <table className="adm-table">
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><div className="adm-product-cell"><div className="adm-product-img">{firstImage(p.images) ? <img src={firstImage(p.images)} alt="" /> : '📦'}</div>{p.name}</div></td>
                    <td>{fmt(p.price)}</td>
                    <td>{p.stock_quantity}</td>
                    <td><Badge status={p.is_active ? 'paid' : 'cancelled'} /></td>
                    <td><button className="adm-icon-btn" onClick={() => setModal(p)}><Pencil size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && <ProductModal product={modal === 'new' ? null : modal} categories={[]} onClose={() => setModal(null)} onSave={() => { setModal(null); fetchProducts() }} />}
    </div>
  )
}

// --- MAIN LAYOUT ---

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()

  // Guard: If there is no user or user is not admin, show black or redirect
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ height: '100vh', background: '#08080f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <p>Access Denied: Admin Only</p>
        <button onClick={logout} className="adm-btn adm-btn-primary">Logout & Try Again</button>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'products': return <Products />
      default: return <Dashboard />
    }
  }

  const NAV_ITEMS = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package }
  ]

  return (
    <div className="adm-layout">
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-logo"><span>T</span>{sidebarOpen && <span className="adm-sidebar-brand">TechStore</span>}</div>
          <button className="adm-icon-btn" onClick={() => setSidebarOpen(!sidebarOpen)}><ArrowLeft size={18} style={{ transform: sidebarOpen ? '' : 'rotate(180deg)' }} /></button>
        </div>
        <nav className="adm-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`adm-nav-item ${activeTab === item.key ? 'active' : ''}`} onClick={() => setActiveTab(item.key)}>
              <item.icon size={18} /> {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-nav-item danger" onClick={logout}><LogOut size={18} /> {sidebarOpen && <span>Sign Out</span>}</button>
        </div>
      </aside>
      <main className="adm-main">
        {renderContent()}
      </main>
    </div>
  )
}
