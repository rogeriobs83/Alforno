import { useState } from 'react'
import { Link } from 'react-router-dom'
import { apiFetch } from '../../api.js'
import { useCart } from '../../context/useCart.js'
import './Checkout.css'

const initialForm = {
  postcode: '',
  email: '',
  fulfillment: 'collection',
  name: '',
  notes: '',
  paymentMethod: 'pay_on_fulfillment',
  phone: '',
}

function Checkout() {
  const { cartTotal, clearCart, items } = useCart()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [addresses, setAddresses] = useState([])
  const [addressError, setAddressError] = useState('')
  const [isSearchingAddresses, setIsSearchingAddresses] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)

  if (!items.length && !orderId) {
    return (
      <section className="checkout-page">
        <p className="section-eyebrow">Checkout</p>
        <h1 className="page-heading">Your basket is empty.</h1>
        <p className="page-description">Add items from our menu before checking out.</p>
        <Link className="button-primary" to="/menu">
          View menu
        </Link>
      </section>
    )
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))

    if (name === 'postcode') {
      setAddresses([])
      setAddressError('')
      setSelectedAddress(null)
    }
  }

  const handleAddressSearch = async () => {
    if (form.postcode.trim().length < 3) {
      setAddressError('Enter a postcode with at least 3 characters.')
      return
    }

    setAddressError('')
    setIsSearchingAddresses(true)

    try {
      const response = await apiFetch(
        `/api/addresses?query=${encodeURIComponent(form.postcode.trim())}`,
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to find addresses.')
      }

      const results = Array.isArray(data) ? data : data.addresses || data.results || data.data

      if (!Array.isArray(results) || !results.length) {
        throw new Error('No addresses were found for that postcode.')
      }

      setAddresses(results)
    } catch (lookupError) {
      setAddressError(lookupError.message)
    } finally {
      setIsSearchingAddresses(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.fulfillment === 'delivery' && !selectedAddress) {
      setError('Choose an address for delivery.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            email: form.email,
            name: form.name,
            phone: form.phone,
          },
          deliveryAddress:
            form.fulfillment === 'delivery' ? selectedAddress.summaryLine : undefined,
          fulfillment: form.fulfillment,
          items: items.map(({ name, price, quantity, size }) => ({ name, price, quantity, size })),
          notes: form.notes,
          paymentMethod: form.paymentMethod,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to submit your order.')
      }

      setOrderId(data.id)
      clearCart()
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderId) {
    return (
      <section className="checkout-page checkout-success">
        <p className="section-eyebrow">Order received</p>
        <h1 className="page-heading">Thank you for your order.</h1>
        <p className="page-description">
          Your order reference is <strong>{orderId}</strong>.{' '}
          {form.paymentMethod === 'pay_on_fulfillment'
            ? `Payment is due on${form.fulfillment === 'delivery' ? ' delivery.' : ' collection.'}`
            : 'Your fictional test payment has been recorded.'}
        </p>
        <Link className="button-primary" to="/menu">
          Return to menu
        </Link>
      </section>
    )
  }

  return (
    <section className="checkout-page">
      <p className="section-eyebrow">Checkout</p>
      <h1 className="page-heading">Complete your order</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Your details</h2>
          <label>
            Full name
            <input name="name" required value={form.name} onChange={handleChange} />
          </label>
          <label>
            Email address
            <input
              name="email"
              required
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              required
              type="tel"
              value={form.phone}
              onChange={handleChange}
            />
          </label>
          <fieldset>
            <legend>How would you like to receive your order?</legend>
            <label className="fulfillment-option">
              <input
                checked={form.fulfillment === 'collection'}
                name="fulfillment"
                type="radio"
                value="collection"
                onChange={handleChange}
              />
              Collection
            </label>
            <label className="fulfillment-option">
              <input
                checked={form.fulfillment === 'delivery'}
                name="fulfillment"
                type="radio"
                value="delivery"
                onChange={handleChange}
              />
              Delivery
            </label>
          </fieldset>
          <fieldset>
            <legend>Payment method</legend>
            <label className="fulfillment-option">
              <input
                checked={form.paymentMethod === 'pay_on_fulfillment'}
                name="paymentMethod"
                type="radio"
                value="pay_on_fulfillment"
                onChange={handleChange}
              />
              Pay on collection or delivery
            </label>
            <label className="fulfillment-option">
              <input
                checked={form.paymentMethod === 'demo_card'}
                name="paymentMethod"
                type="radio"
                value="demo_card"
                onChange={handleChange}
              />
              Demo Card
            </label>
            <label className="fulfillment-option">
              <input
                checked={form.paymentMethod === 'demo_wallet'}
                name="paymentMethod"
                type="radio"
                value="demo_wallet"
                onChange={handleChange}
              />
              Demo Wallet
            </label>
          </fieldset>
          {form.fulfillment === 'delivery' && (
            <div className="address-lookup">
              <label>
                Postcode
                <input
                  autoComplete="postal-code"
                  name="postcode"
                  required
                  value={form.postcode}
                  onChange={handleChange}
                />
              </label>
              <button
                className="address-search-button"
                disabled={isSearchingAddresses}
                type="button"
                onClick={handleAddressSearch}
              >
                {isSearchingAddresses ? 'Searching...' : 'Find address'}
              </button>
              {addresses.length > 0 && (
                <label>
                  Select your address
                  <select
                    required
                    value={selectedAddress ? selectedAddress.summaryLine : ''}
                    onChange={(event) =>
                      setSelectedAddress(
                        addresses.find(
                          (address) => address.summaryLine === event.target.value,
                        ) || null,
                      )
                    }
                  >
                    <option value="">Select an address</option>
                    {addresses.map((address) => (
                      <option key={address.summaryLine} value={address.summaryLine}>
                        {address.summaryLine}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              {addressError && <p className="form-error" role="alert">{addressError}</p>}
            </div>
          )}
          <label>
            Order notes <span>(optional)</span>
            <textarea name="notes" value={form.notes} onChange={handleChange} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button-primary" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Submitting...' : 'Place order'}
          </button>
          <p className="checkout-payment-note">
            Demo Card and Demo Wallet are fictional payment methods for testing only.
          </p>
        </form>

        <aside className="checkout-summary">
          <h2>Your order</h2>
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <span>
                  {item.quantity} × {item.name}
                  {item.size && ` (${item.size})`}
                </span>
                <span>£{(item.unitPrice * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div>
            <strong>Total</strong>
            <strong>£{cartTotal.toFixed(2)}</strong>
          </div>
        </aside>
      </div>
    </section>
  )
}

export default Checkout
