import 'dotenv/config'
import { createHmac, timingSafeEqual } from 'node:crypto'
import MongoStore from 'connect-mongo'
import express from 'express'
import session from 'express-session'
import { MongoClient, MongoError, ObjectId } from 'mongodb'

const port = Number(process.env.PORT || 3001)
const databaseName = process.env.MONGODB_DB || 'alforno'
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/admin'
const adminPassword = process.env.ADMIN_PASSWORD
const sessionSecret = process.env.SESSION_SECRET
const uberEatsClientSecret = process.env.UBER_EATS_CLIENT_SECRET
const getUkAddressApiKey = process.env.GETUKADDRESS_API_KEY
const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 })
const app = express()

// 🔥 ADICIONADO (sem apagar nada)
import cors from 'cors'

app.use(cors({
  origin: 'https://alforno-8.onrender.com',
  credentials: true
}))
// 🔥 FIM DA ADIÇÃO

const validateString = (value, field, minLength, maxLength) => {
  if (typeof value !== 'string') {
    throw new Error(`${field} is required.`)
  }

  const normalizedValue = value.trim()
  if (normalizedValue.length < minLength || normalizedValue.length > maxLength) {
    throw new Error(`${field} must contain between ${minLength} and ${maxLength} characters.`)
  }

  return normalizedValue
}

const validateReservation = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Reservation data is required.')
  }

  const name = validateString(body.name, 'Name', 2, 80)
  const email = validateString(body.email, 'Email', 5, 254).toLowerCase()
  const phone = validateString(body.phone, 'Phone number', 7, 25)
  const date = validateString(body.date, 'Date', 10, 10)
  const time = validateString(body.time, 'Time', 5, 5)
  const partySize = Number(body.partySize)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.')
  }

  if (!/^[0-9+() -]+$/.test(phone)) {
    throw new Error('Enter a valid phone number.')
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(`${date}T12:00:00Z`))) {
    throw new Error('Enter a valid reservation date.')
  }

  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
    throw new Error('Enter a valid reservation time.')
  }

  if (!Number.isInteger(partySize) || partySize < 1 || partySize > 12) {
    throw new Error('Choose between 1 and 12 guests.')
  }

  return { name, email, phone, date, time, partySize }
}

const validateOrder = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Order data is required.')
  }

  const customer = body.customer
  if (!customer || typeof customer !== 'object' || Array.isArray(customer)) {
    throw new Error('Customer details are required.')
  }

  const name = validateString(customer.name, 'Name', 2, 80)
  const email = validateString(customer.email, 'Email', 5, 254).toLowerCase()
  const phone = validateString(customer.phone, 'Phone number', 7, 25)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid email address.')
  }

  if (!/^[0-9+() -]+$/.test(phone)) {
    throw new Error('Enter a valid phone number.')
  }

  if (!['collection', 'delivery'].includes(body.fulfillment)) {
    throw new Error('Choose collection or delivery.')
  }

  if (!['pay_on_fulfillment', 'demo_card', 'demo_wallet'].includes(body.paymentMethod)) {
    throw new Error('Choose a valid payment method.')
  }

  const deliveryAddress =
    body.fulfillment === 'delivery'
      ? validateString(body.deliveryAddress, 'Delivery address', 5, 250)
      : undefined
  const notes =
    typeof body.notes === 'string' && body.notes.trim()
      ? validateString(body.notes, 'Order notes', 1, 500)
      : undefined

  if (!Array.isArray(body.items) || !body.items.length || body.items.length > 30) {
    throw new Error('Your order must contain between 1 and 30 items.')
  }

  const items = body.items.map((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new Error('Invalid order item.')
    }

    const itemName = validateString(item.name, 'Item name', 2, 120)
    const price = validateString(item.price, 'Item price', 4, 12)
    const quantity = Number(item.quantity)
    const size = item.size ? validateString(item.size, 'Item size', 3, 10) : undefined

    if (!/^£\d+\.\d{2}$/.test(price)) {
      throw new Error('Invalid item price.')
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw new Error('Item quantity must be between 1 and 20.')
    }

    if (size && !['Small', 'Medium', 'Large'].includes(size)) {
      throw new Error('Invalid item size.')
    }

    return {
      ...(size && { size }),
      name: itemName,
      price,
      quantity,
      unitPrice: Number(price.slice(1)),
    }
  })

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  return {
    ...(deliveryAddress && { deliveryAddress }),
    ...(notes && { notes }),
    customer: { email, name, phone },
    fulfillment: body.fulfillment,
    items,
    paymentMethod: body.paymentMethod,
    total: Number(total.toFixed(2)),
  }
}

const verifyUberSignature = (rawBody, signature) => {
  if (!/^[a-f0-9]{64}$/i.test(signature)) {
    return false
  }

  const expectedSignature = createHmac('sha256', uberEatsClientSecret)
    .update(rawBody)
    .digest()
  const providedSignature = Buffer.from(signature, 'hex')

  return (
    expectedSignature.length === providedSignature.length &&
    timingSafeEqual(expectedSignature, providedSignature)
  )
}

const getUberEventKey = (event) => {
  if (typeof event.event_id === 'string' && event.event_id) {
    return event.event_id
  }

  if (
    typeof event.event_type !== 'string' ||
    !event.event_type ||
    typeof event.resource_id !== 'string' ||
    !event.resource_id
  ) {
    return null
  }

  return `${event.event_type}:${event.resource_id}:${event.user_id || ''}`
}

app.get('/api/webhooks/uber-eats', (_request, response) => {
  response.json({
    service: 'Uber Eats webhook',
    status: 'online',
    message: 'Send signed order events with POST to this endpoint.',
  })
})

app.post(
  '/api/webhooks/uber-eats',
  express.raw({ limit: '100kb', type: 'application/json' }),
  async (request, response) => {
    if (!uberEatsClientSecret) {
      response.status(503).end()
      return
    }

    if (!Buffer.isBuffer(request.body)) {
      response.status(400).end()
      return
    }

    const signature = request.get('X-Uber-Signature') || ''
    if (!verifyUberSignature(request.body, signature)) {
      response.status(401).end()
      return
    }

    let event
    try {
      event = JSON.parse(request.body.toString('utf8'))
    } catch {
      response.status(400).end()
      return
    }

    if (!event || typeof event !== 'object' || Array.isArray(event)) {
      response.status(400).end()
      return
    }

    const eventKey = getUberEventKey(event)
    if (!eventKey) {
      response.status(400).end()
      return
    }

    try {
      await app.locals.uberEatsEvents.insertOne({
        event,
        eventKey,
        eventType: event.event_type,
        receivedAt: new Date(),
        resourceId: event.resource_id,
        userId: event.user_id,
      })
      response.status(200).end()
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        response.status(200).end()
        return
      }

      console.error('Unable to store Uber Eats webhook event:', error)
      response.status(500).end()
    }
  },
)

app.use(express.json({ limit: '10kb' }))
app.use(
  session({
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
    name: 'alforno.session',
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret || 'missing-session-secret',
    store: MongoStore.create({
      collectionName: 'sessions',
      dbName: databaseName,
      mongoUrl: mongoUri,
    }),
  }),
)

const requireAdmin = (request, response, next) => {
  if (request.session.isAdmin) {
    next()
    return
  }

  response.status(401).json({ error: 'Administrator access is required.' })
}

const isValidAdminPassword = (password) => {
  if (!adminPassword || typeof password !== 'string') {
    return false
  }

  const expectedPassword = Buffer.from(adminPassword)
  const providedPassword = Buffer.from(password)
  return (
    expectedPassword.length === providedPassword.length &&
    timingSafeEqual(expectedPassword, providedPassword)
  )
}

const isPastReservation = (reservation) => {
  const now = new Date()
  const today = now.toLocaleDateString('en-CA')
  const currentTime = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  })

  return (
    reservation.date < today ||
    (reservation.date === today && reservation.time < currentTime)
  )
}

app.get('/', (_request, response) => {
  response.json({ service: 'Alforno Reservation API', status: 'online' })
})

app.get('/api/health', (_request, response) => {
  response.json({ status: 'online' })
})

app.get('/api/addresses', async (request, response) => {
  if (!getUkAddressApiKey) {
    response.status(503).json({ error: 'Address lookup is not configured.' })
    return
  }

  const query = typeof request.query.query === 'string' ? request.query.query.trim() : ''
  if (query.length < 3 || query.length > 100) {
    response.status(400).json({ error: 'Enter a postcode or address with at least 3 characters.' })
    return
  }

  const addressUrl = new URL('https://getukaddress.com/api/v1/autocomplete')
  addressUrl.searchParams.set('api_key', getUkAddressApiKey)
  addressUrl.searchParams.set('query', query)

  try {
    const addressResponse = await fetch(addressUrl, { signal: AbortSignal.timeout(5000) })

    if (!addressResponse.ok) {
      console.error(`Get UK Address lookup failed with HTTP ${addressResponse.status}.`)
      response.status(addressResponse.status).json({ error: 'Unable to find addresses for that postcode.' })
      return
    }

    response.json(await addressResponse.json())
  } catch (error) {
    console.error('Get UK Address lookup failed:', error)
    response.status(502).json({ error: 'Unable to reach the address lookup service.' })
  }
})

app.get('/api/admin/session', (request, response) => {
  response.json({ authenticated: Boolean(request.session.isAdmin) })
})

app.post('/api/admin/login', (request, response) => {
  if (!adminPassword || !sessionSecret) {
    response.status(503).json({ error: 'Administrator access has not been configured.' })
    return
  }

  if (!isValidAdminPassword(request.body?.password)) {
    response.status(401).json({ error: 'Invalid administrator password.' })
    return
  }

  request.session.regenerate((error) => {
    if (error) {
      console.error('Unable to create administrator session:', error)
      response.status(500).json({ error: 'Unable to sign in. Please try again later.' })
      return
    }

    request.session.isAdmin = true
    response.json({ authenticated: true })
  })
})

app.post('/api/admin/logout', requireAdmin, (request, response) => {
  request.session.destroy((error) => {
    if (error) {
      console.error('Unable to end administrator session:', error)
      response.status(500).json({ error: 'Unable to sign out. Please try again later.' })
      return
    }

    response.status(204).end()
  })
})

app.get('/api/admin/reservations', requireAdmin, async (_request, response) => {
  try {
    const reservations = await app.locals.reservations
      .find({})
      .sort({ date: 1, time: 1 })
      .limit(200)
      .toArray()

    response.json({ reservations })
  } catch (error) {
    console.error('Unable to load reservations:', error)
    response.status(500).json({ error: 'Unable to load reservations. Please try again later.' })
  }
})

app.patch('/api/admin/reservations/:id', requireAdmin, async (request, response) => {
  const { id } = request.params
  const { status } = request.body

  if (!ObjectId.isValid(id)) {
    response.status(400).json({ error: 'Invalid reservation ID.' })
    return
  }

  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    response.status(400).json({ error: 'Invalid reservation status.' })
    return
  }

  try {
    const result = await app.locals.reservations.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status } },
      { returnDocument: 'after' },
    )

    if (!result) {
      response.status(404).json({ error: 'Reservation not found.' })
      return
    }

    response.json({ reservation: result })
  } catch (error) {
    console.error('Unable to update reservation:', error)
    response.status(500).json({ error: 'Unable to update reservation. Please try again later.' })
  }
})

app.delete('/api/admin/reservations/:id', requireAdmin, async (request, response) => {
  const { id } = request.params

  if (!ObjectId.isValid(id)) {
    response.status(400).json({ error: 'Invalid reservation ID.' })
    return
  }

  try {
    const reservation = await app.locals.reservations.findOne({ _id: new ObjectId(id) })

    if (!reservation) {
      response.status(404).json({ error: 'Reservation not found.' })
      return
    }

    if (!isPastReservation(reservation)) {
      response.status(400).json({ error: 'Only past reservations can be deleted.' })
      return
    }

    await app.locals.reservations.deleteOne({ _id: reservation._id })
    response.json({ deleted: true })
  } catch (error) {
    console.error('Unable to delete reservation:', error)
    response.status(500).json({ error: 'Unable to delete reservation. Please try again later.' })
  }
})

app.post('/api/orders', async (request, response) => {
  try {
    const order = validateOrder(request.body)
    const result = await app.locals.orders.insertOne({
      ...order,
      createdAt: new Date(),
      paymentStatus:
        order.paymentMethod === 'pay_on_fulfillment' ? 'pay_on_fulfillment' : 'simulated_paid',
      status: 'pending',
    })

    response.status(201).json({ id: result.insertedId.toString(), status: 'pending' })
  } catch (error) {
    if (error instanceof Error && !(error instanceof MongoError)) {
      response.status(400).json({ error: error.message })
      return
    }

    console.error('Unable to save order:', error)
    response.status(500).json({ error: 'Unable to submit your order. Please try again later.' })
  }
})

app.post('/api/reservations', async (request, response) => {
  try {
    const reservation = validateReservation(request.body)
    const result = await app.locals.reservations.insertOne({
      ...reservation,
      status: 'pending',
      createdAt: new Date(),
    })

    response.status(201).json({ id: result.insertedId, status: 'pending' })
  } catch (error) {
    if (error instanceof Error && !(error instanceof MongoError)) {
      response.status(400).json({ error: error.message })
      return
    }

    console.error('Unable to save reservation:', error)
    response.status(500).json({ error: 'Unable to save your reservation. Please try again later.' })
  }
})

const start = async () => {
  await client.connect()
  const database = client.db(databaseName)
  app.locals.reservations = database.collection('reservations')
  app.locals.orders = database.collection('orders')

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
})