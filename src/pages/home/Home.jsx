
import { useState } from 'react'
import ReservationModal from '../../components/ReservationModal.jsx'
import './Home.css'

function Home() {
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false)

  return (
    <section className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <p className="hero-eyebrow">Contemporary Italian cuisine</p>
          <h1 className="hero-title">A dining experience to remember.</h1>
          <p className="hero-text">
            Authentic flavours, fresh ingredients and special moments prepared
            just for you.
          </p>
          <button
            className="button-primary"
            type="button"
            onClick={() => setIsReservationModalOpen(true)}
          >
            Make a reservation
          </button>
        </div>
      </div>
      <section className="about-section" id="about-us">
        <div className="about-content">
          <p className="section-eyebrow">About us</p>
          <h2 className="about-title">Italian tradition served with warmth.</h2>
          <p className="about-text">
            At Alforno, every recipe begins with respect for ingredients and
            the pleasure of sharing a good meal.
          </p>
          <p className="about-text">
            From fresh pasta to seafood, our kitchen celebrates the authentic
            taste of Italy in every detail.
          </p>
        </div>
        <img
          className="about-image"
          src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1000&q=85"
          alt="Calamari dish prepared by Alforno"
        />
      </section>
      <section className="opening-hours" aria-labelledby="opening-hours-title">
        <div className="opening-hours-intro">
          <p className="section-eyebrow">Opening hours</p>
          <h2 className="opening-hours-title" id="opening-hours-title">
            Join us at the table
          </h2>
          <p className="opening-hours-description">
            We look forward to sharing memorable moments with you.
          </p>
        </div>

        <div className="opening-hours-schedule">
          <div className="hours-group">
            <h3>Lunch</h3>
            <dl>
              <div className="hours-row">
                <dt>Monday - Friday</dt>
                <dd>Closed</dd>
              </div>
              <div className="hours-row">
                <dt>Saturday - Sunday</dt>
                <dd>12:30pm - 3:00pm</dd>
              </div>
            </dl>
          </div>

          <div className="hours-group">
            <h3>Dinner</h3>
            <dl>
              <div className="hours-row">
                <dt>Monday</dt>
                <dd>Closed</dd>
              </div>
              <div className="hours-row">
                <dt>Tuesday - Thursday</dt>
                <dd>5:45pm - 10:30pm</dd>
              </div>
              <div className="hours-row">
                <dt>Friday</dt>
                <dd>5:45pm - 11:00pm</dd>
              </div>
              <div className="hours-row">
                <dt>Saturday</dt>
                <dd>5:00pm - 11:00pm</dd>
              </div>
              <div className="hours-row">
                <dt>Sunday</dt>
                <dd>5:00pm - 10:00pm</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
      <section className="contact-section" aria-labelledby="contact-title">
        <h2 id="contact-title">Contact us</h2>
        <div className="contact-grid">
          <div>
            <h3>Location</h3>
            <address>
              349 Upper Richmond Road
              <br />
              London
              <br />
              SW15 5QJ
            </address>
            <a
              className="contact-directions"
              href="https://www.google.com/maps/search/?api=1&query=349+Upper+Richmond+Road%2C+London%2C+SW15+5QJ"
              rel="noreferrer"
              target="_blank"
            >
              Get directions
            </a>
          </div>
          <div className="contact-details">
            <h3>Contact</h3>
            <a href="tel:+442088787522">020 8878 7522</a>
            <a href="mailto:alfornoinputney@gmail.com">alfornoinputney@gmail.com</a>
            <div aria-label="Social media channels" className="social-icons">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M13.5 21v-8h2.75l.41-3h-3.16V8.09c0-.87.25-1.47 1.5-1.47h1.8V3.94c-.31-.04-1.38-.14-2.62-.14-2.6 0-4.38 1.59-4.38 4.51V10H7v3h2.8v8h3.7Z" />
              </svg>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <rect height="16" rx="4" width="16" x="4" y="4" />
                <circle cx="12" cy="12" r="3.5" />
                <circle cx="17.2" cy="6.8" r="1" />
              </svg>
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18.9 3H22l-6.78 7.75L23.2 21h-6.25l-4.9-6.4L6.45 21H3.34l7.25-8.3L2.94 3h6.42l4.42 5.84L18.9 3Zm-1.1 16h1.72L8.43 4.9H6.58L17.8 19Z" />
              </svg>
            </div>
          </div>
        </div>
      </section>
      <ReservationModal
        isOpen={isReservationModalOpen}
        onClose={() => setIsReservationModalOpen(false)}
      />
    </section>
  )
}

export default Home
