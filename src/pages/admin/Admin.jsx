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
  shipped:'#f59e0b', delivered:'#22c55e', cancelled:'#ef4444',
  refunded:'#6b7280', paid:'#22c55e', failed:'#ef4444'
}[s] || '#6b7280')

function Badge({ status }) {
  const c = statusColor(status)
  return <span className="adm-badge" style={{color:c, borderColor:c+'55', background:c+'18'}}>{status}</span>
}

// --- DASHBOARD ---
function Dashboard() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/charts')
    ]).then(([s, c]) => {
      setStats(s.data)
      setCharts(c.data)
    }).catch(() => toast.error('Failed to load dashboard'))
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="adm-center" style={{height:'60vh'}}><Spinner /></div>

  const statCards = [
    { label: 'Total Revenue', value: fmt(stats?.stats?.revenue ?? 0), icon: DollarSign, color: '#22c55e', bg: '#052e16' },
    { label: 'Total Orders', value: stats?.stats?.orders ?? 0, icon: ShoppingCart, color: '#f97316', bg: '#1c0a00' },
    { label: 'Products', value: stats?.stats?.products ?? 0, icon: Package, color: '#a855f7', bg: '#1a0533' },
    { label: 'Customers', value: stats?.stats?.users ?? 0, icon: Users, color: '#3b82f6', bg: '#0c1a3a' }
  ]

  const revenueData = charts?.revenueByDay || []
  const statusData = charts?.ordersByStatus || []
  const topProds = charts?.topProducts || []
  const maxRevenue = Math.max(...revenueData.map(d => d.revenue), 1)
  const maxSold = Math.max(...topProds.map(p => p.sold_count), 1)

  const statusColors = {
    pending:'#a855f7', confirmed:'#3b82f6', processing:'#f97316',
    shipped:'#f59e0b', delivered:'#22c55e', cancelled:'#ef4444', refunded:'#6b7280'
  }

  return (
    <div className="adm-page">
      <div style={{marginBottom:'2rem'}}>
        <h1 className="adm-page-title">Dashboard</h1>
        <p style={{color:'#6b6b8a',fontSize:'0.9rem'}}>Welcome back! Here's what's happening.</p>
      </div>

      <div className="adm-stat-grid" style={{marginBottom:'2rem'}}>
        {statCards.map(c => (
          <div key={c.label} className="adm-stat-card" style={{background:c.bg, borderColor:c.color+'33'}}>
            <div className="adm-stat-icon" style={{background:c.color+'22', color:c.color}}><c.icon size={22}/></div>
            <div>
              <p className="adm-stat-val" style={{color:c.color}}>{typeof c.value==='number'?c.value.toLocaleString():c.value}</p>
              <p className="adm-stat-label">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-two-col" style={{gap:'1.5rem'}}>
        <div className="adm-card" style={{padding:'1.5rem'}}>
          <h3 className="adm-card-title" style={{padding:0,border:'none',marginBottom:'1.5rem'}}>Revenue — Last 30 Days</h3>
          {revenueData.length === 0 ? (
            <div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b6b8a'}}>No data yet</div>
          ) : (
            <div>
              <svg width="100%" height="180" viewBox={`0 0 ${Math.max(revenueData.length*30,300)} 180`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4"/>
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <polyline fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"
                  points={revenueData.map((d,i)=>`${i*30+15},${180-(d.revenue/maxRevenue)*160}`).join(' ')}
                />
                <polygon fill="url(#revGrad)"
                  points={[
                    ...revenueData.map((d,i)=>`${i*30+15},${180-(d.revenue/maxRevenue)*160}`),
                    `${(revenueData.length-1)*30+15},180`, `15,180`
                  ].join(' ')}
                />
                {revenueData.map((d,i)=>(
                  <circle key={i} cx={i*30+15} cy={180-(d.revenue/maxRevenue)*160} r="3" fill="#a855f7"/>
                ))}
              </svg>
              <div style={{display:'flex',justifyContent:'space-between',marginTop:'8px'}}>
                {revenueData.filter((_,i)=>i%Math.ceil(revenueData.length/5)===0).map((d,i)=>(
                  <span key={i} style={{fontSize:'0.65rem',color:'#6b6b8a'}}>{new Date(d.date).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="adm-card" style={{padding:'1.5rem'}}>
          <h3 className="adm-card-title" style={{padding:0,border:'none',marginBottom:'1.5rem'}}>Orders by Status</h3>
          {statusData.length === 0 ? (
            <div style={{height:180,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b6b8a'}}>No orders yet</div>
          ) : (() => {
            const total = statusData.reduce((a,s)=>a+s.count,0)
            let offset = 0
            const r=60, cx=80, cy=80, circ=2*Math.PI*r
            return (
              <div style={{display:'flex',alignItems:'center',gap:'1.5rem'}}>
                <svg width="160" height="160" viewBox="0 0 160 160" style={{flexShrink:0}}>
                  {statusData.map((s,i)=>{
                    const pct=s.count/total
                    const dash=pct*circ
                    const gap=circ-dash
                    const el=(
                      <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={statusColors[s.status]||'#6b7280'}
                        strokeWidth="28"
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        style={{transform:'rotate(-90deg)',transformOrigin:'80px 80px'}}
                      />
                    )
                    offset+=dash
                    return el
                  })}
                  <text x="80" y="75" textAnchor="middle" fill="#f5f4ff" fontSize="22" fontWeight="800">{total}</text>
                  <text x="80" y="95" textAnchor="middle" fill="#6b6b8a" fontSize="11">orders</text>
                </svg>
                <div style={{display:'flex',flexDirection:'column',gap:'8px',flex:1}}>
                  {statusData.map(s=>(
                    <div key={s.status} style={{display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{width:10,height:10,borderRadius:'50%',background:statusColors[s.status]||'#6b7280',flexShrink:0}}/>
                      <span style={{fontSize:'0.8rem',color:'#b0b0cc',textTransform:'capitalize',flex:1}}>{s.status}</span>
                      <span style={{fontSize:'0.8rem',color:'#f5f4ff',fontWeight:700}}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })()}
        </div>
      </div>

      <div className="adm-card" style={{padding:'1.5rem',marginTop:'1.5rem'}}>
        <h3 className="adm-card-title" style={{padding:0,border:'none',marginBottom:'1.5rem'}}>Top Products by Sales</h3>
        {topProds.length === 0 ? (
          <div style={{height:80,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b6b8a'}}>No sales data yet</div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            {topProds.map((p,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'12px'}}>
                <span style={{fontSize:'0.8rem',color:'#6b6b8a',width:20,textAlign:'right',fontWeight:700}}>#{i+1}</span>
                <span style={{fontSize:'0.85rem',color:'#f5f4ff',width:150,flexShrink:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.name}</span>
                <div style={{flex:1,height:10,background:'#1e1e32',borderRadius:999,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${(p.sold_count/maxSold)*100}%`,background:'linear-gradient(90deg,#7c3aed,#a855f7)',borderRadius:999}}/>
                </div>
                <span style={{fontSize:'0.8rem',color:'#a855f7',fontWeight:700,width:30,textAlign:'right'}}>{p.sold_count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adm-card" style={{marginTop:'1.5rem'}}>
        <h3 className="adm-card-title">Recent Orders</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>#</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {(stats?.recentOrders||[]).map(o=>(
                <tr key={o.id}>
                  <td className="adm-mono">{o.order_number}</td>
                  <td>{o.full_name||'Guest'}</td>
                  <td>{fmt(o.total_amount)}</td>
                  <td><Badge status={o.status}/></td>
                </tr>
              ))}
              {(stats?.recentOrders||[]).length===0&&<tr><td colSpan={4} style={{textAlign:'center',color:'#6b6b8a',padding:'2rem'}}>No orders yet</td></tr>}
            </tbody>
          </table>
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
          <div style={{display:'flex',gap:'1.5rem'}}>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',color:'#b0b0cc'}}><input type="checkbox" checked={form.is_featured} onChange={e=>set('is_featured',e.target.checked)}/> Featured</label>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',color:'#b0b0cc'}}><input type="checkbox" checked={form.is_active} onChange={e=>set('is_active',e.target.checked)}/> Active</label>
            <label style={{display:'flex',alignItems:'center',gap:'6px',cursor:'pointer',color:'#b0b0cc'}}><input type="checkbox" checked={form.is_new} onChange={e=>set('is_new',e.target.checked)}/> New</label>
          </div>
        </div>
        <div className="adm-modal-footer">
          <button className="adm-btn adm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>{saving?<Spinner/>:<Save size={16}/>} Save</button>
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
                {products.map(p=>(
                  <tr key={p.id}>
                    <td><div className="adm-product-cell"><div className="adm-product-img">{firstImage(p.images)?<img src={firstImage(p.images)} alt=""/>:'📦'}</div>{p.name}</div></td>
                    <td>{fmt(p.price)}</td>
                    <td>{p.stock_quantity}</td>
                    <td><Badge status={p.is_active?'delivered':'cancelled'}/></td>
                    <td>
                      <div style={{display:'flex',gap:'8px'}}>
                        <button className="adm-icon-btn" onClick={()=>setModal(p)}><Pencil size={15}/></button>
                        <button className="adm-icon-btn" style={{color:'#ef4444'}} onClick={()=>deleteProduct(p.id)}><Trash2 size={15}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length===0&&<tr><td colSpan={5} style={{textAlign:'center',color:'#6b6b8a',padding:'3rem'}}>No products yet. Add your first product!</td></tr>}
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
      .then(({data})=>setOrders(data.orders||[]))
      .catch(()=>toast.error('Failed to load orders'))
      .finally(()=>setLoading(false))
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admin/orders/${id}/status`, { status })
      setOrders(orders.map(o=>o.id===id?{...o,status}:o))
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
                {orders.map(o=>(
                  <tr key={o.id}>
                    <td className="adm-mono">{o.order_number}</td>
                    <td>{o.full_name||'Guest'}</td>
                    <td>{fmt(o.total_amount)}</td>
                    <td><Badge status={o.status}/></td>
                    <td>
                      <select className="adm-input" style={{padding:'4px 8px',fontSize:'0.8rem'}} value={o.status} onChange={e=>updateStatus(o.id,e.target.value)}>
                        {ORDER_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length===0&&<tr><td colSpan={5} style={{textAlign:'center',color:'#6b6b8a',padding:'3rem'}}>No orders yet</td></tr>}
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
      .then(({data})=>setUsers(data.users||[]))
      .catch(()=>toast.error('Failed to load users'))
      .finally(()=>setLoading(false))
  }, [])

  const updateRole = async (id, role) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      setUsers(users.map(u=>u.id===id?{...u,role}:u))
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
                {users.map(u=>(
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
                {users.length===0&&<tr><td colSpan={5} style={{textAlign:'center',color:'#6b6b8a',padding:'3rem'}}>No users yet</td></tr>}
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
      await api.put(`/admin/banners/${banner.id}`, {...banner, is_active:!banner.is_active})
      fetchBanners()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="adm-page">
      <h1 className="adm-page-title">Banners</h1>
      <div className="adm-card" style={{padding:'1.5rem',marginBottom:'2rem'}}>
        <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,marginBottom:'1.25rem',color:'#f5f4ff'}}>Add New Banner</h3>
        <div className="adm-field-row">
          <div style={{flex:1}}><label className="adm-label">Title *</label><input className="adm-input adm-field-full" placeholder="Summer Sale" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
          <div style={{flex:1}}><label className="adm-label">Subtitle</label><input className="adm-input adm-field-full" placeholder="Up to 50% off" value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/></div>
        </div>
        <div style={{marginTop:'1rem'}}><label className="adm-label">Image URL</label><input className="adm-input adm-field-full" placeholder="https://..." value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})}/></div>
        <div style={{marginTop:'1rem'}}><label className="adm-label">Link URL</label><input className="adm-input adm-field-full" placeholder="/shop or https://..." value={form.link} onChange={e=>setForm({...form,link:e.target.value})}/></div>
        <button className="adm-btn adm-btn-primary" style={{marginTop:'1.25rem'}} onClick={addBanner} disabled={saving}>{saving?<Spinner/>:<Plus size={16}/>} Add Banner</button>
      </div>
      <div className="adm-card">
        <h3 className="adm-card-title">All Banners</h3>
        {loading ? <div className="adm-center" style={{padding:'2rem'}}><Spinner/></div> : banners.length===0 ? (
          <p style={{padding:'2rem',textAlign:'center',color:'#6b6b8a'}}>No banners yet</p>
        ) : banners.map(b=>(
          <div key={b.id} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem 1.5rem',borderBottom:'1px solid rgba(124,58,237,0.08)'}}>
            {b.image_url && <img src={b.image_url} alt={b.title} style={{width:60,height:40,objectFit:'cover',borderRadius:8}}/>}
            <div style={{flex:1}}>
              <p style={{fontWeight:600,color:'#f5f4ff',marginBottom:2}}>{b.title}</p>
              <p style={{fontSize:'0.8rem',color:'#6b6b8a'}}>{b.subtitle}</p>
            </div>
            <Badge status={b.is_active?'delivered':'cancelled'}/>
            <button className="adm-btn adm-btn-ghost" style={{fontSize:'0.8rem',padding:'0.4rem 0.8rem'}} onClick={()=>toggleBanner(b)}>{b.is_active?'Disable':'Enable'}</button>
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
      .then(({data})=>setSettings(data.settings||{}))
      .catch(()=>toast.error('Failed to load settings'))
      .finally(()=>setLoading(false))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', settings)
      toast.success('Settings saved!')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="adm-center" style={{height:'40vh'}}><Spinner/></div>

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
        {fields.map(f=>(
          <div key={f.key} style={{marginBottom:'1.5rem'}}>
            <label className="adm-label">{f.label}</label>
            {f.type==='color' ? (
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
      <div style={{height:'100vh',background:'#08080f',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',color:'white',gap:'1rem'}}>
        <p style={{fontSize:'1.2rem'}}>Access Denied: Admin Only</p>
        <button onClick={logout} className="adm-btn adm-btn-primary">Logout & Try Again</button>
      </div>
    )
  }

  const NAV_ITEMS = [
    { key:'dashboard', label:'Dashboard', icon:LayoutDashboard },
    { key:'products',  label:'Products',  icon:Package },
    { key:'orders',    label:'Orders',    icon:ShoppingBag },
    { key:'users',     label:'Users',     icon:Users },
    { key:'banners',   label:'Banners',   icon:Image },
    { key:'settings',  label:'Site Settings', icon:Settings },
  ]

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard/>
      case 'products':  return <Products/>
      case 'orders':    return <Orders/>
      case 'users':     return <UsersTab/>
      case 'banners':   return <Banners/>
      case 'settings':  return <SiteSettings/>
      default:          return <Dashboard/>
    }
  }

  return (
    <div className="adm-layout">
      <aside className={`adm-sidebar ${sidebarOpen?'open':'collapsed'}`}>
        <div className="adm-sidebar-header">
          <div className="adm-sidebar-logo">
            <span>D</span>
            {sidebarOpen && <span className="adm-sidebar-brand">DozzyData</span>}
          </div>
          <button className="adm-icon-btn" onClick={()=>setSidebarOpen(!sidebarOpen)}>
            <ArrowLeft size={18} style={{transform:sidebarOpen?'':'rotate(180deg)',transition:'0.3s'}}/>
          </button>
        </div>
        {sidebarOpen && (
          <div className="adm-sidebar-user">
            <div className="adm-sidebar-avatar">{user.full_name?.[0]||'A'}</div>
            <div>
              <p className="adm-sidebar-name">{user.full_name}</p>
              <p className="adm-sidebar-role">Administrator</p>
            </div>
          </div>
        )}
        <nav className="adm-nav">
          {NAV_ITEMS.map(item=>(
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
