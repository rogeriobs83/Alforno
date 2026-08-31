import { useEffect, useState } from 'react'
import { apiFetch } from '../api.js'
import './ReservationModal.css'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  date: '',
  time: '',
  partySize: '2',
}

function ReservationModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessful, setIsSuccessful] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const handleClose = () => {
    setError('')
    setIsSuccessful(false)
    onClose()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await apiFetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, partySize: Number(form.partySize) }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Unable to create your reservation.')
      }

      setIsSuccessful(true)
      setForm(initialForm)
    } catch (submissionError) {
      setError(submissionError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="reservation-modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section
        aria-labelledby="reservation-title"
        aria-modal="true"
        className="reservation-modal"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Close reservation form"
          className="reservation-modal-close"
          type="button"
          onClick={handleClose}
        >
          ×
        </button>

        <p className="section-eyebrow">Reservations</p>
        <h2 id="reservation-title">Reserve your table</h2>

        {isSuccessful ? (
          <div className="reservation-success" role="status">
            <p>Your reservation request has been received.</p>
            <button className="button-primary" type="button" onClick={handleClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="reservation-form" onSubmit={handleSubmit}>
            <label>
              Full name
              <input
                autoComplete="name"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
              />
            </label>
            <label>
              Email address
              <input
                autoComplete="email"
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
                autoComplete="tel"
                name="phone"
                required
                type="tel"
                value={form.phone}
                onChange={handleChange}
              />
            </label>
            <div className="reservation-form-row">
              <label>
                Date
                <input
                  min={new Date().toISOString().slice(0, 10)}
                  name="date"
                  required
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </label>
              <label>
                Time
                <input
                  name="time"
                  required
                  type="time"
                  value={form.time}
                  onChange={handleChange}
                />
              </label>
            </div>
            <label>
              Guests
              <select name="partySize" value={form.partySize} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((guests) => (
                  <option key={guests} value={guests}>
                    {guests} {guests === 1 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="button-primary" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Submitting...' : 'Request reservation'}
            </button>
          </form>
        )}
      </section>
    </div>
  )
}

export default ReservationModal
