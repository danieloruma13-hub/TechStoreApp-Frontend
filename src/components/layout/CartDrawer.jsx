import { Link } from 'react-router-dom'
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import { useCartStore } from '../../context/store'
import { fmt, firstImage } from '../../utils/helpers'
import './CartDrawer.css'

export default function CartDrawer() {
  const { items, drawerOpen, closeDrawer, updateQty, removeItem, subtotal } = useCartStore()
  const shipping = subtotal >= 50000 ? 0 : 2500

  if (!drawerOpen) return null

  return (
    <>
      <div className="cd-backdrop" onClick={closeDrawer} />
      <aside className="cd">
        <div className="cd-header">
          <div className="cd-title">
            <ShoppingCart size={18} />
            <span>My Cart</span>
            {items.length > 0 && <span className="cd-count">{items.reduce((s,i)=>s+i.quantity,0)}</span>}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeDrawer}><X size={18}/></button>
        </div>

        <div className="cd-items">
          {items.length === 0 ? (
            <div className="cd-empty">
              <ShoppingBag size={52} strokeWidth={1.2} color="var(--text-muted)" />
              <p>Your cart is empty</p>
              <Link to="/shop" className="btn btn-primary btn-sm" onClick={closeDrawer}>Start Shopping</Link>
            </div>
          ) : items.map(item => (
            <div key={item.id} className="cd-item">
              <div className="cd-item-img">
                {firstImage(item.images) ? <img src={firstImage(item.images)} alt={item.name}/> : <span>📦</span>}
              </div>
              <div className="cd-item-body">
                <p className="cd-item-name">{item.name}</p>
                <p className="cd-item-price">{fmt(item.price)}</p>
                <div className="cd-item-controls">
                  <div className="qty-wrap">
                    <button className="qty-btn" onClick={()=>updateQty(item.id,item.quantity-1)}><Minus size={12}/></button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={()=>updateQty(item.id,item.quantity+1)}><Plus size={12}/></button>
                  </div>
                  <button className="cd-delete" onClick={()=>removeItem(item.id)}><Trash2 size={14}/></button>
                </div>
              </div>
              <span className="cd-item-total">{fmt(parseFloat(item.price)*item.quantity)}</span>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="cd-footer">
            <div className="cd-summary">
              <div className="summary-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
              <div className="summary-row"><span>Shipping</span><span className={shipping===0?'free-ship':''}>{shipping===0?'FREE':fmt(shipping)}</span></div>
              {subtotal > 0 && subtotal < 50000 && <p className="cd-tip">Add {fmt(50000-subtotal)} more for free shipping 🚀</p>}
              {shipping===0 && <p className="cd-tip" style={{color:'#4ade80'}}>🎉 You qualify for free shipping!</p>}
              <div className="divider" style={{margin:'0.6rem 0'}}/>
              <div className="summary-row summary-total"><span>Total</span><span>{fmt(subtotal+shipping)}</span></div>
            </div>
            <Link to="/checkout" className="btn btn-accent btn-lg" style={{width:'100%'}} onClick={closeDrawer}>
              Checkout <ArrowRight size={17}/>
            </Link>
            <Link to="/cart" className="btn btn-outline" style={{width:'100%',marginTop:'0.5rem'}} onClick={closeDrawer}>
              View Cart
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
