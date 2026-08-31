import { useEffect, useState } from 'react'
import { apiFetch } from '../../api.js'
import './Admin.css'

function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [reservations, setReservations] = useState([])
  const [isLoadingReservations, setIsLoadingReservations] = useState(false)

  const loadReservations = async () => {
    setIsLoadingReservations(true)
    setError('')

    try {
      const response = await apiFetch('/api/admin/reservations')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to load reservations.')
      }

      setReservations(data.reservations)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setIsLoadingReservations(false)
    }
  }

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await apiFetch('/api/admin/session')
        const data = await response.json()

        if (data.authenticated) {
          setIsAuthenticated(true)
          await loadReservations()
        }
      } catch {
        setError('Unable to verify administrator access.')
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')

    try {
      const response = await apiFetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to sign in.')
      }

      setPassword('')
      setIsAuthenticated(true)
      await loadReservations()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleStatusChange = async (reservationId, status) => {
    setError('')

    try {
      const response = await apiFetch(`/api/admin/reservations/${reservationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to update reservation status.')
      }

      setReservations((currentReservations) =>
        currentReservations.map((reservation) =>
          reservation._id === reservationId
            ? { ...reservation, status: data.reservation.status }
            : reservation,
        ),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Delete this past reservation permanently?')) {
      return
    }

    setError('')

    try {
      const response = await apiFetch(`/api/admin/reservations/${reservationId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to delete reservation.')
      }

      setReservations((currentReservations) =>
        currentReservations.filter((reservation) => reservation._id !== reservationId),
      )
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const isPastReservation = (reservation) =>
    new Date(`${reservation.date}T${reservation.time}`) < new Date()

  const handleLogout = async () => {
    await apiFetch('/api/admin/logout', { method: 'POST' })
    setReservations([])
    setIsAuthenticated(false)
  }

  if (isCheckingSession) {
    return <p className="page-description">Checking administrator access...</p>
  }

  if (!isAuthenticated) {
    return (
      <section className="admin-login">
        <p className="section-eyebrow">Reservations</p>
        <h1 className="page-heading">Reservation dashboard</h1>
        <p className="page-description">
          Sign in to view and manage restaurant reservations.
        </p>
        <form className="admin-login-form" onSubmit={handleLogin}>
          <label>
            Administrator password
            <input
              autoComplete="current-password"
              name="password"
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button-primary" type="submit">
            Sign in
          </button>
        </form>
      </section>
    )
  }

  return (
    <section className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <p className="section-eyebrow">Reservations</p>
          <h1 className="page-heading">Reservation dashboard</h1>
        </div>
        <button className="admin-logout" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}

      {isLoadingReservations ? (
        <p className="page-description">Loading reservations...</p>
      ) : (
        <div className="reservations-table-wrapper">
          <table className="reservations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Time</th>
                <th>Guests</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation._id}>
                  <td>{reservation.name}</td>
                  <td>
                    <a href={`mailto:${reservation.email}`}>{reservation.email}</a>
                    <a href={`tel:${reservation.phone}`}>{reservation.phone}</a>
                  </td>
                  <td>{reservation.date}</td>
                  <td>{reservation.time}</td>
                  <td>{reservation.partySize}</td>
                  <td>
                    <select
                      aria-label={`Status for ${reservation.name}`}
                      value={reservation.status}
                      onChange={(event) =>
                        handleStatusChange(reservation._id, event.target.value)
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    {isPastReservation(reservation) && (
                      <button
                        className="delete-reservation"
                        type="button"
                        onClick={() => handleDelete(reservation._id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!reservations.length && (
            <p className="page-description">No reservations have been made yet.</p>
          )}
        </div>
      )}
    </section>
  )
}

export default Admin
