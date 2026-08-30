const database = db.getSiblingDB('alforno')
const reservationSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: ['name', 'email', 'phone', 'date', 'time', 'partySize', 'status', 'createdAt'],
    properties: {
      name: { bsonType: 'string', minLength: 2, maxLength: 80 },
      email: { bsonType: 'string', maxLength: 254 },
      phone: { bsonType: 'string', minLength: 7, maxLength: 25 },
      date: { bsonType: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' },
      time: { bsonType: 'string', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' },
      partySize: { bsonType: 'int', minimum: 1, maximum: 12 },
      status: { enum: ['pending', 'confirmed', 'cancelled'] },
      createdAt: { bsonType: 'date' },
    },
  },
}

if (!database.getCollectionNames().includes('reservations')) {
  database.createCollection('reservations', { validator: reservationSchema })
} else {
  database.runCommand({
    collMod: 'reservations',
    validator: reservationSchema,
  })
}

database.reservations.createIndex({ date: 1, time: 1 })
database.reservations.createIndex({ createdAt: -1 })

if (!database.getCollectionNames().includes('uber_eats_events')) {
  database.createCollection('uber_eats_events')
}

database.uber_eats_events.createIndex({ eventKey: 1 }, { unique: true })
database.uber_eats_events.createIndex({ receivedAt: -1 })

const orderSchema = {
  $jsonSchema: {
    bsonType: 'object',
    required: [
      'customer',
      'fulfillment',
      'items',
      'total',
      'status',
      'paymentMethod',
      'paymentStatus',
      'createdAt',
    ],
    properties: {
      customer: {
        bsonType: 'object',
        required: ['name', 'email', 'phone'],
      },
      fulfillment: { enum: ['collection', 'delivery'] },
      deliveryAddress: { bsonType: 'string', maxLength: 250 },
      notes: { bsonType: 'string', maxLength: 500 },
      items: { bsonType: 'array', minItems: 1, maxItems: 30 },
      total: { bsonType: 'double', minimum: 0 },
      status: { enum: ['pending', 'confirmed', 'cancelled', 'completed'] },
      paymentMethod: { enum: ['pay_on_fulfillment', 'demo_card', 'demo_wallet'] },
      paymentStatus: { enum: ['pay_on_fulfillment', 'simulated_paid'] },
      createdAt: { bsonType: 'date' },
    },
  },
}

if (!database.getCollectionNames().includes('orders')) {
  database.createCollection('orders', { validator: orderSchema })
} else {
  database.runCommand({
    collMod: 'orders',
    validator: orderSchema,
  })
}

database.orders.createIndex({ createdAt: -1 })
database.orders.createIndex({ status: 1, createdAt: -1 })
