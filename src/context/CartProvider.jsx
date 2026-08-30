import { useMemo, useState } from 'react'
import { CartContext } from './cartContext.js'

const getPriceValue = (price) => {
  const value = Number(price.replace('£', ''))

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid product price: ${price}`)
  }

  return value
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([])

  const addItem = ({ image, name, price, size }) => {
    const unitPrice = getPriceValue(price)
    const id = `${name}-${size || 'standard'}`

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === id)

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }

      return [...currentItems, { id, image, name, price, quantity: 1, size, unitPrice }]
    })
  }

  const changeQuantity = (id, amount) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => (item.id === id ? { ...item, quantity: item.quantity + amount } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id))
  }

  const clearCart = () => {
    setItems([])
  }

  const value = useMemo(() => {
    const cartCount = items.reduce((total, item) => total + item.quantity, 0)
    const cartTotal = items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    )

    return { addItem, cartCount, cartTotal, changeQuantity, clearCart, items, removeItem }
  }, [items])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
