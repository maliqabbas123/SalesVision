"""
Seed script — generates realistic e-commerce data for SalesVision.

Usage (from backend/ directory):
    python -m scripts.seed
"""
import asyncio
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.core.config import settings

PRODUCTS = [
    # Electronics
    ("Wireless Noise-Cancelling Headphones", "Electronics", 299.99),
    ("4K Smart TV 55\"", "Electronics", 649.99),
    ("Mechanical Keyboard", "Electronics", 129.99),
    ("USB-C Hub 7-in-1", "Electronics", 49.99),
    ("Portable SSD 1TB", "Electronics", 89.99),
    ("Webcam 1080p", "Electronics", 69.99),
    # Clothing
    ("Classic Denim Jacket", "Clothing", 79.99),
    ("Running Shoes Pro", "Clothing", 119.99),
    ("Merino Wool Sweater", "Clothing", 89.99),
    ("Slim Fit Chinos", "Clothing", 59.99),
    ("Waterproof Rain Jacket", "Clothing", 149.99),
    ("Cotton Oxford Shirt", "Clothing", 49.99),
    # Books
    ("Clean Code", "Books", 34.99),
    ("Designing Data-Intensive Applications", "Books", 49.99),
    ("The Pragmatic Programmer", "Books", 39.99),
    ("Atomic Habits", "Books", 24.99),
    ("Deep Work", "Books", 22.99),
    ("System Design Interview Vol 2", "Books", 44.99),
    # Home & Garden
    ("Standing Desk Converter", "Home & Garden", 189.99),
    ("Ergonomic Chair", "Home & Garden", 349.99),
    ("Air Purifier HEPA", "Home & Garden", 129.99),
    ("Smart LED Desk Lamp", "Home & Garden", 59.99),
    ("Bamboo Cutting Board Set", "Home & Garden", 34.99),
    ("Stainless Steel Water Bottle", "Home & Garden", 29.99),
    # Sports
    ("Yoga Mat Premium", "Sports", 49.99),
    ("Resistance Bands Set", "Sports", 24.99),
    ("Adjustable Dumbbells 40lb", "Sports", 179.99),
    ("Jump Rope Speed", "Sports", 19.99),
    ("Foam Roller Deep Tissue", "Sports", 34.99),
    ("Pull-up Bar Doorframe", "Sports", 39.99),
]

CITIES = [
    ("New York", "USA"), ("Los Angeles", "USA"), ("Chicago", "USA"),
    ("Houston", "USA"), ("Phoenix", "USA"), ("Philadelphia", "USA"),
    ("San Antonio", "USA"), ("San Diego", "USA"), ("Dallas", "USA"),
    ("San Jose", "USA"), ("Austin", "USA"), ("Jacksonville", "USA"),
    ("Seattle", "USA"), ("Denver", "USA"), ("Boston", "USA"),
    ("Nashville", "USA"), ("Portland", "USA"), ("Las Vegas", "USA"),
    ("Toronto", "Canada"), ("Vancouver", "Canada"), ("Montreal", "Canada"),
    ("London", "UK"), ("Manchester", "UK"), ("Sydney", "Australia"),
]

FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael",
               "Linda", "William", "Barbara", "David", "Susan", "Richard", "Jessica",
               "Joseph", "Sarah", "Thomas", "Karen", "Charles", "Lisa", "Emily",
               "Daniel", "Ashley", "Matthew", "Samantha", "Andrew", "Megan", "Joshua",
               "Stephanie", "Ryan", "Hannah", "Kevin", "Rachel", "Brian", "Amanda"]

LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
              "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
              "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
              "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
              "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King"]


def seasonal_weight(dt: datetime) -> float:
    """Higher order volume in Q4 (Nov-Dec), lower in Jan-Feb."""
    month = dt.month
    weights = {1: 0.6, 2: 0.65, 3: 0.8, 4: 0.85, 5: 0.9, 6: 0.95,
               7: 1.0, 8: 1.0, 9: 1.0, 10: 1.1, 11: 1.4, 12: 1.6}
    return weights.get(month, 1.0)


async def seed():
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as session:
        # Clear existing data
        await session.execute(text("TRUNCATE order_items, orders, customers, products RESTART IDENTITY CASCADE"))
        await session.commit()
        print("Cleared existing data")

        # Insert products
        rng = random.Random(42)
        product_ids = []
        for i, (name, category, price) in enumerate(PRODUCTS, 1):
            sku = f"SKU-{category[:3].upper()}-{i:04d}"
            await session.execute(
                text("INSERT INTO products (name, sku, category, price) VALUES (:name, :sku, :category, :price) RETURNING id"),
                {"name": name, "sku": sku, "category": category, "price": price},
            )
            product_ids.append((i, category, Decimal(str(price))))
        await session.commit()
        print(f"Inserted {len(PRODUCTS)} products")

        # Insert customers
        customer_ids = []
        used_emails = set()
        for i in range(1, 201):
            first = rng.choice(FIRST_NAMES)
            last = rng.choice(LAST_NAMES)
            base_email = f"{first.lower()}.{last.lower()}"
            email = f"{base_email}@example.com"
            counter = 1
            while email in used_emails:
                email = f"{base_email}{counter}@example.com"
                counter += 1
            used_emails.add(email)
            city, country = rng.choice(CITIES)
            await session.execute(
                text("INSERT INTO customers (name, email, city, country) VALUES (:name, :email, :city, :country)"),
                {"name": f"{first} {last}", "email": email, "city": city, "country": country},
            )
            customer_ids.append(i)
        await session.commit()
        print(f"Inserted 200 customers")

        # Insert orders + order items
        start_date = datetime(2024, 6, 25)
        end_date = datetime(2026, 6, 25)
        total_days = (end_date - start_date).days

        order_count = 0
        item_count = 0
        batch_orders = []
        batch_items = []

        # Generate ~1500 orders spread across 2 years
        for day_offset in range(total_days):
            current_date = start_date + timedelta(days=day_offset)
            weight = seasonal_weight(current_date)
            # Average ~2 orders/day, weighted by season
            num_orders = rng.choices([0, 1, 2, 3, 4, 5], weights=[20, 30, 25, 15, 7, 3])[0]
            num_orders = max(0, round(num_orders * weight))

            for _ in range(num_orders):
                status_roll = rng.random()
                if status_roll < 0.80:
                    status = "completed"
                elif status_roll < 0.95:
                    status = "pending"
                else:
                    status = "cancelled"

                order_time = current_date + timedelta(
                    hours=rng.randint(8, 22),
                    minutes=rng.randint(0, 59),
                )
                customer_id = rng.randint(1, 200)
                batch_orders.append({
                    "customer_id": customer_id,
                    "status": status,
                    "created_at": order_time,
                })

        # Bulk insert orders
        if batch_orders:
            result = await session.execute(
                text("""
                    INSERT INTO orders (customer_id, status, created_at)
                    SELECT unnest(:customer_ids::int[]),
                           unnest(:statuses::orderstatus[]),
                           unnest(:created_ats::timestamp[])
                    RETURNING id, status
                """),
                {
                    "customer_ids": [o["customer_id"] for o in batch_orders],
                    "statuses": [o["status"] for o in batch_orders],
                    "created_ats": [o["created_at"] for o in batch_orders],
                },
            )
            order_rows = result.fetchall()
            order_count = len(order_rows)
            await session.commit()
            print(f"Inserted {order_count} orders")

            # Insert order items
            for order_id, order_status in order_rows:
                num_items = rng.choices([1, 2, 3, 4], weights=[40, 35, 18, 7])[0]
                chosen_products = rng.sample(range(len(PRODUCTS)), min(num_items, len(PRODUCTS)))
                for prod_idx in chosen_products:
                    _, _, price = PRODUCTS[prod_idx]
                    product_id = prod_idx + 1
                    quantity = rng.choices([1, 2, 3], weights=[65, 25, 10])[0]
                    batch_items.append({
                        "order_id": order_id,
                        "product_id": product_id,
                        "quantity": quantity,
                        "unit_price": float(price),
                    })

            # Batch insert items in chunks
            chunk_size = 500
            for i in range(0, len(batch_items), chunk_size):
                chunk = batch_items[i:i + chunk_size]
                await session.execute(
                    text("""
                        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
                        SELECT unnest(:order_ids::int[]),
                               unnest(:product_ids::int[]),
                               unnest(:quantities::int[]),
                               unnest(:unit_prices::numeric[])
                    """),
                    {
                        "order_ids": [item["order_id"] for item in chunk],
                        "product_ids": [item["product_id"] for item in chunk],
                        "quantities": [item["quantity"] for item in chunk],
                        "unit_prices": [item["unit_price"] for item in chunk],
                    },
                )
            await session.commit()
            item_count = len(batch_items)
            print(f"Inserted {item_count} order items")

    await engine.dispose()
    print(f"\nSeed complete: {len(PRODUCTS)} products, 200 customers, {order_count} orders, {item_count} order items")


if __name__ == "__main__":
    asyncio.run(seed())
