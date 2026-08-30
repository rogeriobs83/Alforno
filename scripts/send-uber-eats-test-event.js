import 'dotenv/config'
import { createHmac } from 'node:crypto'

const clientSecret = process.env.UBER_EATS_CLIENT_SECRET
const webhookUrl = process.env.UBER_EATS_WEBHOOK_URL || 'http://localhost:3001/api/webhooks/uber-eats'

if (!clientSecret) {
  throw new Error('Set UBER_EATS_CLIENT_SECRET in .env before running this test.')
}

const event = {
  event_id: `study-event-${Date.now()}`,
  event_type: 'orders.notification',
  resource_href: 'https://api.uber.com/v1/eats/orders/study-order',
  resource_id: 'study-order',
  user_id: 'study-store',
}
const body = JSON.stringify(event)
const signature = createHmac('sha256', clientSecret).update(body).digest('hex')

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Uber-Signature': signature,
  },
  body,
})

if (!response.ok) {
  throw new Error(`Webhook test failed with HTTP ${response.status}.`)
}

console.log(`Study event accepted by ${webhookUrl}.`)
