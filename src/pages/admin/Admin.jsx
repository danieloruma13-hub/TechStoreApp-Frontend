import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../context/store'
import api from '../../utils/api'
import { fmt, firstImage } from '../../utils/helpers'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Plus,
  Pencil, Trash2, X, Save, LogOut, ArrowLeft,
  DollarSign, ShoppingCart, Image, Settings
} from 'lucide-react'
import './Admin.css'

function Spinner() { return <div className="adm-spinner"/> }

const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded']

const statusColor = (s) => ({
  pending:'#a855f7', confirmed:'#3b82f6', processing:'#f97316',
  shipped:'#f97316', delivered:'#22c55e', cancelled:'#ef4444',
  refunded:'#ef4444', paid:'#22c55e', failed:'#ef4444'
}[s] || '#6b7280')

function Badge({ status }) {
  const c = statusColor(status)
  return <span className="adm-badge" style={{color:c, borderColor:c+'55', background:c+'18'}}>{status}</span>
}

// --- DASHBOARD ---
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
            <div className="adm-stat-icon" style={{ background: c.color+'18', color: c.color }}><c.icon size={22}/></div>
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
                    <td><Badge status={o.status}/></td>
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
                <span className="adm-top-rank">#{i+1}</span>
                <div className="adm-top-img">
                  {firstImage(p.images) ? <img src={firstImage(p.images)} alt={p.name}/> : <span>📦</span>}
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

// --- PRODUCT MODAL ---
function ProductModal({ product, onClose, onSave }) {
  const blank = { name:'', slug:'', brand:'', price:'', compare_price:'', stock_quantity:'0', category_id:'', short_description:'', description:'', images:'', specs:'', tags:'', is_featured:false, is_new:false, is_active:true }
  const toForm = (p) => ({ ...blank, ...p, price:String(p.price||''), compare_price:String(p.compare_price||''), stock_quantity:String(p.stock_quantity??0), images:Array.isArray(p.images)?p.images.map(i=>i.url||i).join('\n'):'', specs:typeof p.specs==='object'?JSON.stringify(p.specs,null,2):(p.specs||''), tags:Array.isArray(p.tags)?p.tags.join(', '):'' })
  const [form, setForm] = useState(product ? toForm(product) : blank)
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({...f, [k]:v}))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name is required'); return }
    if (!form.price) { toast.error('Price is required'); return }
    let parsedSpecs = {}
    try { parsedSpecs = form.specs.trim() ? JSON.parse(form.specs) : {} } catch { toast.error('Specs must be valid JSON'); return }
    setSaving(true)
    try {
      const payload = { ...form, price:parseFloat(form.price), compare_price:form.compare_price?parseFloat(form.compare_price):null, stock_quantity:parseInt(form.stock_quantity)||0, specs:parsedSpecs, images:form.images.split('\n').map(url=>({url:url.trim(),alt:form.name})).filter(img=>img.url), tags:form.tags.split(',').map(t=>t.trim()).filter(Boolean) }
      if (product) await api.put(`/admin/products/${product.id}`, payload)
      else await api.post('/admin/products', payload)
      toast.success('Saved!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="adm-modal-overlay" onClick={onClose}>
      <div className="adm-modal" onClick={e=>e.stopPropagation()}>
        <div className="adm-modal-header"><h2>{product ? 'Edit Product' : 'Add New Product'}</h2><button className="adm-icon-btn" onClick={onClose}><X size={20}/></button></div>
        <div className="adm-modal-body">
          <div><label className="adm-label">Product Name *</label><input className="adm-input adm-field-full" value={form.name} onChange={e=>{set('name',e.target.value); if(!product) set('slug',e.target.value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''))}}/></div>
          <div className="adm-field-row">
            <div><label className="adm-label">Price (₦) *</label><input className="adm-input" type="number" value={form.price} onChange={e=>set('price',e.target.value)}/></div>
            <div><label className="adm-label">Stock</label><input className="adm-input" type="number" value={form.stock_quantity} onChange={e=>set('stock_quantity',e.target.value)}/></div>
          </div>
          <div><label className="adm-label">Brand</label><input className="adm-input adm-field-full" value={form.brand} onChange={e=>set('brand',e.target.value)}/></div>
          <div><label className="adm-label">Short Description</label><input className="adm-input adm-field-full" value={form.short_description} onChange={e=>set('short_description',e.target.value)}/></div>
          <div><label className="adm-label">Image URLs (one per line)</label><textarea className="adm-input adm-field-full adm-textarea" rows={3} value={form.images} onChange={e=>set('images',e.target.value)}/></div>
          <div style={{display:'flex',gap:'1rem'}}>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer'}}><input type="checkbox" checked={form.is_featured} onChange={e=>set('is_featured',e.target.checked)}/> Featured</label>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer'}}><input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)}/> Active</label>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer'}}><input type="checkbox" checked={form.is_new} onChange={e=>set('is_new',e.target.checked)}/> New</label>
          </div>
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn adm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>{saving ? <Spinner/> : <Save size={16}/>} Save</button>
        </div>
      </div>
    </div>
  )
}

// --- PRODUCTS ---
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

  const deleteProduct = async (id) => {
    if (!confirm('Deactivate this product?')) return
    try {
      await api.delete(`/admin/products/${id}`)
      toast.success('Product deactivated')
      fetchProducts()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h1 className="adm-page-title">Products <span className="adm-count">{products.length}</span></h1>
        <button className="adm-btn adm-btn-primary" onClick={()=>setModal('new')}><Plus size={16}/> Add Product</button>
      </div>
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? <div className="adm-center"><Spinner/></div> : (
            <table className="adm-table">
              <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><div className="adm-product-cell"><div className="adm-product-img">{firstImage(p.images)?<img src={firstImage(p.images)} alt=""/>:'📦'}</div>{p.name}</div></td>
                    <td>{fmt(p.price)}</td>
                    <td>{p.stock_quantity}</td>
                    <td><Badge status={p.is_active?'delivered':'cancelled'}/></td>
                    <td style={{display:'flex',gap:'8px'}}>
                      <button className="adm-icon-btn" onClick={()=>setModal(p)}><Pencil size={15}/></button>
                      <button className="adm-icon-btn" style={{color:'#ef4444'}} onClick={()=>deleteProduct(p.id)}><Trash2 size={15}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modal && <ProductModal product={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={()=>{setModal(null);fetchProducts()}}/>}
    </div>
  )
}

// --- ORDERS ---
function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/orders')
      .then(({data}) => setOrders(data.orders || []))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status })
      setOrders(orders.map(o => o.id===id ? {...o, status} : o))
      toast.success('Status updated')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="adm-page">
      <h1 className="adm-page-title">Orders</h1>
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? <div className="adm-center"><Spinner/></div> : (
            <table className="adm-table">
              <thead><tr><th>#</th><th>Customer</th><th>Amount</th><th>Status</th><th>Update</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="adm-mono">{o.order_number}</td>
                    <td>{o.full_name || 'Guest'}</td>
                    <td>{fmt(o.total_amount)}</td>
                    <td><Badge status={o.status}/></td>
                    <td>
                      <select className="adm-input" style={{padding:'4px 8px',fontSize:'0.8rem'}} value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// --- USERS ---
function UsersTab() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/users')
      .then(({data}) => setUsers(data.users || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      setUsers(users.map(u => u.id===id ? {...u, role} : u))
      toast.success('Role updated')
    } catch { toast.error('Failed') }
  }

  return (
    <div className="adm-page">
      <h1 className="adm-page-title">Users</h1>
      <div className="adm-card">
        <div className="adm-table-wrap">
          {loading ? <div className="adm-center"><Spinner/></div> : (
            <table className="adm-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Action</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td><Badge status={u.role}/></td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td>
                      <select className="adm-input" style={{padding:'4px 8px',fontSize:'0.8rem'}} value={u.role} onChange={e=>updateRole(u.id,e.target.value)}>
                        <option value="customer">customer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

// --- BANNERS ---
function Banners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title:'', subtitle:'', image_url:'', link:'', sort_order:0 })
  const [saving, setSaving] = useState(false)

  const fetchBanners = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/banners')
      setBanners(data.banners || [])
    } catch { toast.error('Failed to load banners') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBanners() }, [fetchBanners])

  const addBanner = async () => {
    if (!form.title) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      await api.post('/admin/banners', form)
      toast.success('Banner added!')
      setForm({ title:'', subtitle:'', image_url:'', link:'', sort_order:0 })
      fetchBanners()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const deleteBanner = async (id) => {
    if (!confirm('Delete this banner?')) return
    try {
      await api.delete(`/admin/banners/${id}`)
      toast.success('Deleted')
      fetchBanners()
    } catch { toast.error('Failed') }
  }

  const toggleBanner = async (banner) => {
    try {
      await api.put(`/admin/banners/${banner.id}`, {...banner, is_active: !banner.is_active})
      fetchBanners()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="adm-page">
      <h1 className="adm-page-title">Banners</h1>
      <div className="adm-card" style={{padding:'1.5rem',marginBottom:'2rem'}}>
        <h3 className="adm-card-title" style={{padding:0,marginBottom:'1rem',border:'none'}}>Add New Banner</h3>
        <div className="adm-field-row">
          <div><label className="adm-label">Title *</label><input className="adm-input adm-field-full" placeholder="Banner title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div><label className="adm-label">Subtitle</label><input className="adm-input adm-field-full" placeholder="Optional subtitle" value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/></div>
        </div>
        <div style={{marginTop:'1rem'}}><label className="adm-label">Image URL</label><input className="adm-input adm-field-full" placeholder="https://..." value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/></div>
        <div style={{marginTop:'1rem'}}><label className="adm-label">Link URL</label><input className="adm-input adm-field-full" placeholder="/shop or https://..." value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/></div>
        <button className="adm-btn adm-btn-primary" style={{marginTop:'1rem'}} onClick={addBanner} disabled={saving}>{saving?<Spinner/>:<Plus size={16}/>} Add Banner</button>
      </div>
      <div className="adm-card">
        <h3 className="adm-card-title">Active Banners</h3>
        {loading ? <div className="adm-center"><Spinner/></div> : banners.length === 0 ? (
          <p style={{padding:'2rem',textAlign:'center',color:'#6b6b8a'}}>No banners yet</p>
        ) : banners.map(b => (
          <div key={b.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem 1.5rem',borderBottom:'1px solid rgba(124,58,237,0.08)'}}>
            {b.image_url && <img src={b.image_url} alt={b.title} style={{width:60,height:40,objectFit:'cover',borderRadius:8}}/>}
            <div style={{flex:1}}>
              <p style={{fontWeight:600,color:'#f5f4ff'}}>{b.title}</p>
              <p style={{fontSize:'0.8rem',color:'#6b6b8a'}}>{b.subtitle}</p>
            </div>
            <Badge status={b.is_active ? 'delivered' : 'cancelled'}/>
            <button className="adm-btn adm-btn-ghost" style={{fontSize:'0.8rem'}} onClick={()=>toggleBanner(b)}>{b.is_active?'Disable':'Enable'}</button>
            <button className="adm-icon-btn" style={{color:'#ef4444'}} onClick={()=>deleteBanner(b.id)}><Trash2 size={15}/></button>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- SITE SETTINGS ---
function SiteSettings() {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/admin/settings')
      .then(({data}) => setSettings(data.settings || {}))
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', settings)
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="adm-center"><Spinner/></div>

  const fields = [
    { key:'site_name', label:'Site Name' },
    { key:'site_logo', label:'Logo URL' },
    { key:'hero_title', label:'Hero Title' },
    { key:'hero_subtitle', label:'Hero Subtitle' },
    { key:'primary_color', label:'Primary Color', type:'color' },
    { key:'secondary_color', label:'Secondary Color', type:'color' },
  ]

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <h1 className="adm-page-title">Site Settings</h1>
        <button className="adm-btn adm-btn-primary" onClick={save} disabled={saving}>{saving?<Spinner/>:<Save size={16}/>} Save Changes</button>
      </div>
      <div className="adm-card" style={{padding:'2rem'}}>
        {fields.map(f => (
          <div key={f.key} style={{marginBottom:'1.5rem'}}>
            <label className="adm-label">{f.label}</label>
            {f.type === 'color' ? (
              <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                <input type="color" value={settings[f.key]||'#a855f7'} onChange={e=>setSettings({...settings,[f.key]:e.target.value})} style={{width:50,height:40,border:'none',borderRadius:8,cursor:'pointer',background:'none'}}/>
                <input className="adm-input" value={settings[f.key]||''} onChange={e=>setSettings({...settings,[f.key]:e.target.value})} style={{flex:1}}/>
              </div>
            ) : (
              <input className="adm-input adm-field-full" value={settings[f.key]||''} onChange={e=>setSettings({...settings,[f.key]:e.target.value})}/>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- MAIN LAYOUT ---
export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user, logout } = useAuthStore()

  if (!user || user.role !== 'admin') {
    return (
      <div style={{height:'100vh',background:'#08080f',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white'}}>
        <p>Access Denied: Admin Only</p>
        <button onClick={logout} className="adm-btn adm-btn-primary">Logout</button>
      </div>
    )
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard/>
      case 'products': return <Products/>
      case 'orders': return <Orders/>
      case 'users': return <UsersTab/>
      case 'banners': return <Banners/>
      case 'settings': return <SiteSettings/>
      default: return <Dashboard/>
    }
  }

  const NAV_ITEMS = [
    { key:'dashboard', label:'Dashboard', icon:LayoutDashboard },
    { key:'products', label:'Products', icon:Package },
    { key:'orders', label:'Orders', icon:ShoppingBag },
    { key:'users', label:'Users', icon:Users },
    { key:'banners', label:'Banners', icon:Image },
    { key:'settings', label:'Site Settings', icon:Settings },
  ]

  return (
    <div className="adm-layout">
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-logo">
            <span>T</span>
            {sidebarOpen && <span className="adm-sidebar-brand">TechStore</span>}
          </div>
          <button className="adm-icon-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>
            <ArrowLeft size={18} style={{transform: sidebarOpen?'':'rotate(180deg)'}}/>
          </button>
        </div>
        <nav className="adm-nav">
          {NAV_ITEMS.map(item => (
            <button key={item.key} className={`adm-nav-item ${activeTab===item.key?'active':''}`} onClick={()=>setActiveTab(item.key)}>
              <item.icon size={18}/> {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-footer">
          <button className="adm-nav-item danger" onClick={logout}>
            <LogOut size={18}/> {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
      <main className="adm-main">{renderContent()}</main>
    </div>
  )
}
