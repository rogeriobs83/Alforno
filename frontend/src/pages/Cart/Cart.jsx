import './Cart.css'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/useCart.js'

function Cart() {
  const { cartTotal, changeQuantity, items, removeItem } = useCart()

  if (!items.length) {
    return (
      <section className="cart-page">
        <p className="section-eyebrow">Your basket</p>
        <h1 className="page-heading">Your basket is empty.</h1>
        <p className="page-description">Choose something delicious from our menu to get started.</p>
        <Link className="button-primary" to="/menu">
          View menu
        </Link>
      </section>
    )
  }

  return (
    <section className="cart-page">
      <p className="section-eyebrow">Your basket</p>
      <h1 className="page-heading">Cart</h1>
      <div className="cart-items">
        {items.map((item) => (
          <article key={item.id} className="cart-item">
            <img alt="" src={item.image} />
            <div className="cart-item-details">
              <h2>{item.name}</h2>
              {item.size && <p>{item.size}</p>}
              <span>{item.price}</span>
            </div>
            <div className="cart-item-controls">
              <div className="quantity-controls">
                <button
                  aria-label={`Remove one ${item.name}`}
                  type="button"
                  onClick={() => changeQuantity(item.id, -1)}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  aria-label={`Add one ${item.name}`}
                  type="button"
                  onClick={() => changeQuantity(item.id, 1)}
                >
                  +
                </button>
              </div>
              <button className="cart-remove" type="button" onClick={() => removeItem(item.id)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
      <div className="cart-summary">
        <strong>Total</strong>
        <span>£{cartTotal.toFixed(2)}</span>
      </div>
      <Link className="button-primary" to="/checkout">
        Continue to checkout
      </Link>
    </section>
  )
}

export default Cart
