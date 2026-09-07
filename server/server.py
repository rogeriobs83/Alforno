import os
import hmac
import hashlib
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
try:
    from starlette.middleware.sessions import SessionMiddleware
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "SessionMiddleware requires the 'itsdangerous' package. "
        "Install it with: pip install itsdangerous"
    ) from exc
from motor.motor_asyncio import AsyncIOMotorClient  # pyright: ignore[reportMissingImports]
from bson import ObjectId
from datetime import datetime
import re
import json
import httpx  # pyright: ignore[reportMissingImports]

# ENV
PORT = int(os.getenv("PORT", 3001))
DB_NAME = os.getenv("MONGODB_DB", "alforno")
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/alforno")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD")
SESSION_SECRET = os.getenv("SESSION_SECRET", "missing-session-secret")
UBER_SECRET = os.getenv("UBER_EATS_CLIENT_SECRET")
GETUK_KEY = os.getenv("GETUKADDRESS_API_KEY")

# FastAPI
app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "https://rogeriobs.dev",
    "https://www.rogeriobs.dev"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

# Sessions
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    same_site="none",
    https_only=True
)

# MongoDB
client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
reservations = db["reservations"]
orders = db["orders"]
uber_events = db["uberEatsEvents"]


# -----------------------------
# VALIDATORS
# -----------------------------

def validate_string(value, field, min_len, max_len):
    if not isinstance(value, str):
        raise HTTPException(400, f"{field} is required.")
    v = value.strip()
    if len(v) < min_len or len(v) > max_len:
        raise HTTPException(400, f"{field} must contain between {min_len} and {max_len} characters.")
    return v

def validate_email(value):
    email = validate_string(value, "Email", 5, 254).lower()
    if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", email):
        raise HTTPException(400, "Enter a valid email address.")
    return email

def validate_phone(value):
    phone = validate_string(value, "Phone number", 7, 25)
    if not re.match(r"^[0-9+() -]+$", phone):
        raise HTTPException(400, "Enter a valid phone number.")
    return phone

def validate_reservation(body):
    if not isinstance(body, dict):
        raise HTTPException(400, "Reservation data is required.")

    name = validate_string(body.get("name"), "Name", 2, 80)
    email = validate_email(body.get("email"))
    phone = validate_phone(body.get("phone"))
    date = validate_string(body.get("date"), "Date", 10, 10)
    time = validate_string(body.get("time"), "Time", 5, 5)
    party_size = int(body.get("partySize", 0))

    if not re.match(r"^\d{4}-\d{2}-\d{2}$", date):
        raise HTTPException(400, "Enter a valid reservation date.")

    if not re.match(r"^([01]\d|2[0-3]):[0-5]\d$", time):
        raise HTTPException(400, "Enter a valid reservation time.")

    if party_size < 1 or party_size > 12:
        raise HTTPException(400, "Choose between 1 and 12 guests.")

    return { "name": name, "email": email, "phone": phone, "date": date, "time": time, "partySize": party_size }

def validate_order(body):
    if not isinstance(body, dict):
        raise HTTPException(400, "Order data is required.")

    customer = body.get("customer")
    if not isinstance(customer, dict):
        raise HTTPException(400, "Customer details are required.")

    name = validate_string(customer.get("name"), "Name", 2, 80)
    email = validate_email(customer.get("email"))
    phone = validate_phone(customer.get("phone"))

    fulfillment = body.get("fulfillment")
    if fulfillment not in ["collection", "delivery"]:
        raise HTTPException(400, "Choose collection or delivery.")

    payment_method = body.get("paymentMethod")
    if payment_method not in ["pay_on_fulfillment", "demo_card", "demo_wallet"]:
        raise HTTPException(400, "Choose a valid payment method.")

    delivery_address = None
    if fulfillment == "delivery":
        delivery_address = validate_string(body.get("deliveryAddress"), "Delivery address", 5, 250)

    notes = body.get("notes")
    if isinstance(notes, str) and notes.strip():
        notes = validate_string(notes, "Order notes", 1, 500)
    else:
        notes = None

    items = body.get("items")
    if not isinstance(items, list) or len(items) < 1 or len(items) > 30:
        raise HTTPException(400, "Your order must contain between 1 and 30 items.")

    parsed_items = []
    for item in items:
        if not isinstance(item, dict):
            raise HTTPException(400, "Invalid order item.")

        item_name = validate_string(item.get("name"), "Item name", 2, 120)
        price = validate_string(item.get("price"), "Item price", 4, 12)
        quantity = int(item.get("quantity", 0))
        size = item.get("size")

        if not re.match(r"^£\d+\.\d{2}$", price):
            raise HTTPException(400, "Invalid item price.")

        if quantity < 1 or quantity > 20:
            raise HTTPException(400, "Item quantity must be between 1 and 20.")

        if size and size not in ["Small", "Medium", "Large"]:
            raise HTTPException(400, "Invalid item size.")

        parsed_items.append({
            **({"size": size} if size else {}),
            "name": item_name,
            "price": price,
            "quantity": quantity,
            "unitPrice": float(price[1:])
        })

    total = sum(i["unitPrice"] * i["quantity"] for i in parsed_items)

    return {
        **({"deliveryAddress": delivery_address} if delivery_address else {}),
        **({"notes": notes} if notes else {}),
        "customer": { "email": email, "name": name, "phone": phone },
        "fulfillment": fulfillment,
        "items": parsed_items,
        "paymentMethod": payment_method,
        "total": round(total, 2)
    }


# -----------------------------
# UBER SIGNATURE
# -----------------------------

def verify_uber_signature(raw_body: bytes, signature: str):
    if not re.match(r"^[a-fA-F0-9]{64}$", signature):
        return False

    expected = hmac.new(
        UBER_SECRET.encode(),
        raw_body,
        hashlib.sha256
    ).digest()

    provided = bytes.fromhex(signature)

    return hmac.compare_digest(expected, provided)


def get_uber_event_key(event):
    if isinstance(event.get("event_id"), str):
        return event["event_id"]

    et = event.get("event_type")
    rid = event.get("resource_id")
    uid = event.get("user_id", "")

    if not et or not rid:
        return None

    return f"{et}:{rid}:{uid}"


# -----------------------------
# ROUTES
# -----------------------------

@app.get("/")
async def root():
    return { "service": "Alforno Reservation API", "status": "online" }


@app.get("/api/health")
async def health():
    return { "status": "online" }


@app.get("/api/webhooks/uber-eats")
async def uber_status():
    return {
        "service": "Uber Eats webhook",
        "status": "online",
        "message": "Send signed order events with POST to this endpoint."
    }


@app.post("/api/webhooks/uber-eats")
async def uber_webhook(request: Request):
    if not UBER_SECRET:
        raise HTTPException(503)

    raw = await request.body()
    signature = request.headers.get("X-Uber-Signature", "")

    if not verify_uber_signature(raw, signature):
        raise HTTPException(401)

    try:
        event = json.loads(raw.decode("utf8"))
    except:
        raise HTTPException(400)

    if not isinstance(event, dict):
        raise HTTPException(400)

    event_key = get_uber_event_key(event)
    if not event_key:
        raise HTTPException(400)

    try:
        await uber_events.insert_one({
            "event": event,
            "eventKey": event_key,
            "eventType": event.get("event_type"),
            "receivedAt": datetime.utcnow(),
            "resourceId": event.get("resource_id"),
            "userId": event.get("user_id")
        })
    except Exception as e:
        if "duplicate key" in str(e).lower():
            return Response(status_code=200)
        print("Unable to store Uber Eats webhook event:", e)
        raise HTTPException(500)

    return Response(status_code=200)


@app.get("/api/addresses")
async def addresses(query: str = ""):
    query = query.strip()
    if len(query) < 3 or len(query) > 100:
        raise HTTPException(400, "Enter a postcode or address with at least 3 characters.")

    url = "https://nominatim.openstreetmap.org/search"

    try:
        async with httpx.AsyncClient(timeout=5) as client:
            r = await client.get(url, params={
                "q": query,
                "countrycodes": "gb",
                "format": "json",
                "addressdetails": 1,
                "limit": 10
            }, headers={"User-Agent": "alforno-app"})

        if r.status_code != 200:
            raise HTTPException(r.status_code, "Unable to find addresses for that postcode.")

        data = r.json()

        formatted = [{
            "summaryLine": item["display_name"],
            "postcode": item.get("address", {}).get("postcode", query),
            "city": item.get("address", {}).get("city") or item.get("address", {}).get("town") or item.get("address", {}).get("village") or "",
            "lat": item["lat"],
            "lon": item["lon"]
        } for item in data]

        return formatted

    except Exception as e:
        print("Nominatim lookup failed:", e)
        raise HTTPException(502, "Unable to reach the address lookup service.")


# -----------------------------
# ADMIN
# -----------------------------

def require_admin(request: Request):
    if request.session.get("isAdmin"):
        return True
    raise HTTPException(401, "Administrator access is required.")


@app.get("/api/admin/session")
async def admin_session(request: Request):
    return { "authenticated": bool(request.session.get("isAdmin")) }


@app.post("/api/admin/login")
async def admin_login(request: Request):
    body = await request.json()
    password = body.get("password")

    if not ADMIN_PASSWORD or not SESSION_SECRET:
        raise HTTPException(503, "Administrator access has not been configured.")

    if password != ADMIN_PASSWORD:
        raise HTTPException(401, "Invalid administrator password.")

    request.session.clear()
    request.session["isAdmin"] = True

    return { "authenticated": True }


@app.post("/api/admin/logout")
async def admin_logout(request: Request, _=Depends(require_admin)):
    request.session.clear()
    return Response(status_code=204)


@app.get("/api/admin/reservations")
async def admin_reservations(_=Depends(require_admin)):
    res = await reservations.find({}).sort([("date", 1), ("time", 1)]).limit(200).to_list(None)
    return { "reservations": res }


@app.patch("/api/admin/reservations/{id}")
async def update_reservation(id: str, request: Request, _=Depends(require_admin)):
    if not ObjectId.is_valid(id):
        raise HTTPException(400, "Invalid reservation ID.")

    body = await request.json()
    status = body.get("status")

    if status not in ["pending", "confirmed", "cancelled"]:
        raise HTTPException(400, "Invalid reservation status.")

    result = await reservations.find_one_and_update(
        { "_id": ObjectId(id) },
        { "$set": { "status": status } },
        return_document=True
    )

    if not result:
        raise HTTPException(404, "Reservation not found.")

    return { "reservation": result }


@app.delete("/api/admin/reservations/{id}")
async def delete_reservation(id: str, _=Depends(require_admin)):
    if not ObjectId.is_valid(id):
        raise HTTPException(400, "Invalid reservation ID.")

    reservation = await reservations.find_one({ "_id": ObjectId(id) })

    if not reservation:
        raise HTTPException(404, "Reservation not found.")

    now = datetime.utcnow()
    today = now.strftime("%Y-%m-%d")
    current_time = now.strftime("%H:%M")

    if reservation["date"] > today or (reservation["date"] == today and reservation["time"] > current_time):
        raise HTTPException(400, "Only past reservations can be deleted.")

    await reservations.delete_one({ "_id": reservation["_id"] })

    return { "deleted": True }


# -----------------------------
# ORDERS
# -----------------------------

@app.post("/api/orders")
async def create_order(request: Request):
    try:
        body = await request.json()
        order = validate_order(body)

        result = await orders.insert_one({
            **order,
            "createdAt": datetime.utcnow(),
            "paymentStatus": "pay_on_fulfillment" if order["paymentMethod"] == "pay_on_fulfillment" else "simulated_paid",
            "status": "pending"
        })

        return { "id": str(result.inserted_id), "status": "pending" }

    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unable to save order:", e)
        raise HTTPException(500, "Unable to submit your order. Please try again later.")


# -----------------------------
# RESERVATIONS
# -----------------------------

@app.post("/api/reservations")
async def create_reservation(request: Request):
    try:
        body = await request.json()
        reservation = validate_reservation(body)

        result = await reservations.insert_one({
            **reservation,
            "status": "pending",
            "createdAt": datetime.utcnow()
        })

        return { "id": str(result.inserted_id), "status": "pending" }

    except HTTPException as e:
        raise e
    except Exception as e:
        print("Unable to save reservation:", e)
        raise HTTPException(500, "Unable to save your reservation. Please try again later.")


# -----------------------------
# STARTUP
# -----------------------------

@app.on_event("startup")
async def startup_event():
    print(f"Server running on port {PORT}")
