import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useCart } from './context/useCart.js'
import './App.css'

const navigationItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/menu', label: 'Menu' },
  { to: '/cart', label: 'Cart' },
  { to: '/checkout', label: 'Checkout' },
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { cartCount } = useCart()

  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink className="brand" to="/" onClick={() => setIsMenuOpen(false)}>
          ALFORNO
        </NavLink>

        <button
          aria-controls="primary-navigation"
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className={`menu-toggle${isMenuOpen ? ' is-open' : ''}`}
          type="button"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          aria-label="Main navigation"
          className={`primary-navigation${isMenuOpen ? ' is-open' : ''}`}
          id="primary-navigation"
        >
          <ul className="navigation-list">
            {navigationItems.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink
                  className={({ isActive }) => `navigation-link${isActive ? ' active' : ''}`}
                  end={end}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {to === '/cart' && cartCount > 0 ? `${label} (${cartCount})` : label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p className="footer-company">Agostinha Ltd / Alforno Restaurant</p>
        <address>
          349 Upper Richmond Road
          <br />
          Putney, London, United Kingdom
        </address>
        <p>Company number 15782601</p>
      </footer>
    </div>
  )
}

export default App
