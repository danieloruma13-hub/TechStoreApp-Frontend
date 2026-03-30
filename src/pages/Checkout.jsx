import React, { useState } from 'react'
import { ShieldCheck, Truck, CreditCard, Lock, ArrowLeft, CheckCircle } from 'lucide-react'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { useCartStore, useAuthStore } from '../context/store'
import { fmt } from '../utils/helpers'
import styles from './Checkout.module.css'

const PAYSTACK_PUBLIC_KEY = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxx'
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxxxxx'

export default function Checkout() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCartStore()
  const { user, token } = useAuthStore()
  const shipping = subtotal >= 50000 ? 0 : 2500
  const total = subtotal + shipping

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    paymentMethod: 'paystack'
  })

  const set = (k, v) => setFormData(f => ({...f, [k]: v}))

  if (items.length === 0) return <Navigate to="/cart" />

  const placeOrder = async (paymentRef = null) => {
    setLoading(true)
    try {
      const payload = {
        items: items.map(i => ({ product_id: i.id, quantity: i.quantity })),
        shipping_address: {
          address_line1: formData.address,
          city: formData.city,
          state: formData.state,
          phone: formData.phone,
          full_name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email
        },
        payment_method: formData.paymentMethod,
        payment_reference: paymentRef,
        notes: ''
      }

      const res = await fetch('https://techstoreapp-gobr.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (data.success) {
        clearCart()
        navigate('/orders?success=true')
      } else {
        alert(data.message || 'Order failed')
      }
    } catch (err) {
      alert('Network error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaystack = () => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: formData.email,
      amount: total * 100,
      currency: 'NGN',
      ref: 'PS_' + Date.now(),
      callback: (response) => {
        placeOrder(response.reference)
      },
      onClose: () => {
        alert('Payment cancelled')
      }
    })
    handler.openIframe()
  }

  const handleFlutterwave = () => {
    window.FlutterwaveCheckout({
      public_key: FLUTTERWAVE_PUBLIC_KEY,
      tx_ref: 'FW_' + Date.now(),
      amount: total,
      currency: 'NGN',
      payment_options: 'card,banktransfer,ussd',
      customer: {
        email: formData.email,
        phone_number: formData.phone,
        name: `${formData.firstName} ${formData.lastName}`
      },
      customizations: {
        title: 'DozzyData Teleglobal',
        description: 'Payment for your order',
        logo: 'https://techstoreapp-frontend.onrender.com/favicon.ico'
      },
      callback: (response) => {
        if (response.status === 'successful') {
          placeOrder(response.transaction_id)
        }
      },
      onclose: () => {}
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    if (formData.paymentMethod === 'paystack') {
      handlePaystack()
    } else if (formData.paymentMethod === 'flutterwave') {
      handleFlutterwave()
    } else {
      placeOrder(null)
    }
  }

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js" async />
      <script src="https://checkout.flutterwave.com/v3.js" async />

      <div className="container page-enter" style={{padding:'2rem 1.25rem'}}>
        <Link to="/cart" className="btn btn-ghost btn-sm" style={{marginBottom:'1.5rem'}}>
          <ArrowLeft size={16}/> Back to Cart
        </Link>

        <div style={{display:'flex',gap:'8px',marginBottom:'2rem',alignItems:'center'}}>
          {[1,2].map(s => (
            <React.Fragment key={s}>
              <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:step>=s?'linear-gradient(135deg,#7c3aed,#a855f7)':'#1e1e32',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.8rem',fontWeight:700,color:'#fff'}}>
                  {step>s ? <CheckCircle size={16}/> : s}
                </div>
                <span style={{fontSize:'0.85rem',color:step>=s?'#f5f4ff':'#6b6b8a',fontWeight:step>=s?600:400}}>
                  {s===1?'Shipping':'Payment'}
                </span>
              </div>
              {s < 2 && <div style={{flex:1,height:2,background:step>s?'#7c3aed':'#1e1e32',borderRadius:2}}/>}
            </React.Fragment>
          ))}
        </div>

        <div className={styles.layout}>
          <form onSubmit={handleSubmit} className={styles.formContainer}>

            {step === 1 && (
              <div className={styles.section}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'1.5rem'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <Truck size={16} color="#fff"/>
                  </div>
                  <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'1.2rem',color:'#f5f4ff'}}>Shipping Details</h2>
                </div>

                <div className={styles.grid}>
                  <div className="input-group">
                    <label className="label">First Name</label>
                    <input type="text" className="input" placeholder="Dan" required value={formData.firstName} onChange={e=>set('firstName',e.target.value)}/>
                  </div>
                  <div className="input-group">
                    <label className="label">Last Name</label>
                    <input type="text" className="input" placeholder="Code" required value={formData.lastName} onChange={e=>set('lastName',e.target.value)}/>
                  </div>
                </div>

                <div className="input-group" style={{marginTop:'1rem'}}>
                  <label className="label">Email Address</label>
                  <input type="email" className="input" placeholder="dan@code.com" required value={formData.email} onChange={e=>set('email',e.target.value)}/>
                </div>

                <div className="input-group" style={{marginTop:'1rem'}}>
                  <label className="label">Delivery Address</label>
                  <input type="text" className="input" placeholder="123 Tech Avenue" required value={formData.address} onChange={e=>set('address',e.target.value)}/>
                </div>

                <div className={styles.grid} style={{marginTop:'1rem'}}>
                  <div className="input-group">
                    <label className="label">City</label>
                    <input type="text" className="input" placeholder="Lagos" required value={formData.city} onChange={e=>set('city',e.target.value)}/>
                  </div>
                  <div className="input-group">
                    <label className="label">State</label>
                    <input type="text" className="input" placeholder="Lagos State" required value={formData.state} onChange={e=>set('state',e.target.value)}/>
                  </div>
                </div>

                <div className="input-group" style={{marginTop:'1rem'}}>
                  <label className="label">Phone Number</label>
                  <input type="tel" className="input" placeholder="+234..." required value={formData.phone} onChange={e=>set('phone',e.target.value)}/>
                </div>

                <button type="submit" className="btn btn-primary btn-lg" style={{width:'100%',marginTop:'2rem'}}>
                  Continue to Payment →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className={styles.section}>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'1.5rem'}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#7c3aed,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <CreditCard size={16} color="#fff"/>
                  </div>
                  <h2 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'1.2rem',color:'#f5f4ff'}}>Payment Method</h2>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
                  {[
                    { value:'paystack', label:'Pay with Paystack', sub:'Cards, Bank Transfer, USSD', emoji:'💳' },
                    { value:'flutterwave', label:'Pay with Flutterwave', sub:'Cards, Mobile Money, Bank', emoji:'🦋' },
                    { value:'bank_transfer', label:'Manual Bank Transfer', sub:'We confirm before shipping', emoji:'🏦' },
                  ].map(opt => (
                    <label key={opt.value} style={{display:'flex',alignItems:'center',gap:'1rem',padding:'1rem 1.25rem',background:formData.paymentMethod===opt.value?'rgba(124,58,237,0.12)':'#161626',border:`1.5px solid ${formData.paymentMethod===opt.value?'#7c3aed':'rgba(124,58,237,0.12)'}`,borderRadius:12,cursor:'pointer',transition:'all 0.2s'}}>
                      <input type="radio" name="pay" value={opt.value} checked={formData.paymentMethod===opt.value} onChange={()=>set('paymentMethod',opt.value)} style={{accentColor:'#7c3aed'}}/>
                      <span style={{fontSize:'1.5rem'}}>{opt.emoji}</span>
                      <div>
                        <p style={{fontWeight:600,color:'#f5f4ff',fontSize:'0.95rem'}}>{opt.label}</p>
                        <p style={{fontSize:'0.8rem',color:'#6b6b8a'}}>{opt.sub}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {formData.paymentMethod === 'bank_transfer' && (
                  <div style={{marginTop:'1.5rem',padding:'1.25rem',background:'rgba(124,58,237,0.08)',borderRadius:12,border:'1px solid rgba(124,58,237,0.2)'}}>
                    <p style={{fontWeight:700,color:'#f5f4ff',marginBottom:'0.75rem'}}>Bank Details</p>
                    <p style={{color:'#b0b0cc',fontSize:'0.9rem'}}>Bank: <strong style={{color:'#f5f4ff'}}>GTBank</strong></p>
                    <p style={{color:'#b0b0cc',fontSize:'0.9rem'}}>Account: <strong style={{color:'#f5f4ff'}}>0123456789</strong></p>
                    <p style={{color:'#b0b0cc',fontSize:'0.9rem'}}>Name: <strong style={{color:'#f5f4ff'}}>DozzyData Teleglobal</strong></p>
                    <p style={{color:'#6b6b8a',fontSize:'0.8rem',marginTop:'0.5rem'}}>Send payment proof via WhatsApp after transfer.</p>
                  </div>
                )}

                <div style={{display:'flex',gap:'1rem',marginTop:'2rem'}}>
                  <button type="button" className="btn btn-outline" style={{flex:1}} onClick={()=>setStep(1)}>
                    ← Back
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg" style={{flex:2}} disabled={loading}>
                    {loading ? 'Processing...' : `Pay ${fmt(total)}`}
                  </button>
                </div>
              </div>
            )}
          </form>

          <aside className={styles.summarySticky}>
            <div className={styles.summaryBox}>
              <h3 style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'1.1rem',marginBottom:'1rem',color:'#f5f4ff'}}>Order Summary</h3>
              <div className={styles.miniList}>
                {items.map(item => (
                  <div key={item.id} className={styles.miniItem}>
                    <span style={{color:'#6b6b8a',fontSize:'0.85rem'}}>{item.quantity}×</span>
                    <span style={{flex:1,fontSize:'0.9rem',color:'#d1cbe0'}}>{item.name}</span>
                    <span style={{fontWeight:600,color:'#f5f4ff'}}>{fmt(parseFloat(item.price)*item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div style={{height:1,background:'rgba(124,58,237,0.12)',margin:'1rem 0'}}/>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <span style={{color:'#6b6b8a'}}>Subtotal</span>
                <span style={{color:'#f5f4ff'}}>{fmt(subtotal)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <span style={{color:'#6b6b8a'}}>Shipping</span>
                <span style={{color:shipping===0?'#22c55e':'#f5f4ff'}}>{shipping===0?'FREE':fmt(shipping)}</span>
              </div>
              <div style={{height:1,background:'rgba(124,58,237,0.12)',margin:'1rem 0'}}/>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontWeight:700,color:'#f5f4ff',fontSize:'1.1rem'}}>Total</span>
                <span style={{fontWeight:800,fontSize:'1.2rem',background:'linear-gradient(90deg,#a855f7,#f97316)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>{fmt(total)}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'6px',marginTop:'1.5rem',padding:'0.75rem',background:'rgba(34,197,94,0.08)',borderRadius:8,border:'1px solid rgba(34,197,94,0.2)'}}>
                <Lock size={14} color="#22c55e"/>
                <span style={{fontSize:'0.8rem',color:'#22c55e'}}>SSL Encrypted Secure Checkout</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
