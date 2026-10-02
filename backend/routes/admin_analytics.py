from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from auth.auth_middleware import get_current_admin_user
from database import get_database
from models.user import User
from datetime import datetime, timedelta

router = APIRouter()
db = get_database()

@router.get("/summary")
async def get_analytics_summary(current_admin: User = Depends(get_current_admin_user)):
    """
    Returns a summary of analytics data for the dashboard.
    """
    try:
        # 1. Most viewed furniture
        viewed_pipeline = [
            {"$match": {"action": "view_product"}},
            {"$group": {"_id": "$entity_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        most_viewed = await db.activity_logs.aggregate(viewed_pipeline).to_list(None)
        
        # Populate product names for viewed
        for item in most_viewed:
            product = await db.products.find_one({"id": item["_id"]})
            item["name"] = product.get("name", "Unknown Product") if product else "Unknown Product"

        # 2. Most searched furniture (based on query metadata)
        search_pipeline = [
            {"$match": {"action": "search"}},
            {"$group": {"_id": "$metadata.query", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        top_searches = await db.activity_logs.aggregate(search_pipeline).to_list(None)

        # 3. User login activity (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        login_pipeline = [
            {"$match": {"action": "login", "created_at": {"$gte": seven_days_ago}}},
            {"$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id": 1}}
        ]
        login_activity = await db.activity_logs.aggregate(login_pipeline).to_list(None)

        # 4. Wishlist activity
        wishlist_pipeline = [
            {"$match": {"action": "add_to_wishlist"}},
            {"$group": {"_id": "$entity_id", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 5}
        ]
        wishlist_activity = await db.activity_logs.aggregate(wishlist_pipeline).to_list(None)
        
        # Populate product names for wishlist
        for item in wishlist_activity:
            product = await db.products.find_one({"id": item["_id"]})
            item["name"] = product.get("name", "Unknown Product") if product else "Unknown Product"

        # 5. Top Selling Products (by quantity)
        orders_pipeline = [
            {"$match": {"status": {"$ne": "cancelled"}}},
            {"$unwind": "$items"},
            {"$group": {
                "_id": "$items.id",
                "salesVolume": {"$sum": "$items.quantity"}
            }},
            {"$sort": {"salesVolume": -1}},
            {"$limit": 5}
        ]
        top_selling_data = await db.orders.aggregate(orders_pipeline).to_list(None)
        
        # Populate product details for top selling
        top_selling = []
        for item in top_selling_data:
            product = await db.products.find_one({"id": str(item["_id"])})
            if product:
                top_selling.append({
                    "id": product.get("id", str(item["_id"])),
                    "name": product.get("name", "Unknown Product"),
                    "image": product.get("image", ""),
                    "category": product.get("category", "General"),
                    "smartFurniPrice": product.get("smartFurniPrice") or product.get("smart_furni_price") or 0,
                    "salesVolume": item.get("salesVolume", 0)
                })

        # 6. Revenue Metrics
        now = datetime.utcnow()
        start_of_week = now - timedelta(days=7)
        start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        start_of_year = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        thirty_days_ago = now - timedelta(days=30)

        async def get_total_revenue(start_date):
            try:
                pipeline = [
                    {"$match": {
                        "status": {"$ne": "cancelled"},
                        "created_at": {"$gte": start_date},
                        "totalAmount": {"$exists": True, "$ne": None}
                    }},
                    {"$group": {
                        "_id": None,
                        "total": {"$sum": "$totalAmount"}
                    }}
                ]
                result = await db.orders.aggregate(pipeline).to_list(1)
                return result[0]["total"] if result else 0
            except Exception as e:
                print(f"Error calculating revenue: {e}")
                return 0

        weekly_revenue = await get_total_revenue(start_of_week)
        monthly_revenue = await get_total_revenue(start_of_month)
        yearly_revenue = await get_total_revenue(start_of_year)

        # 7. Revenue Trends (Last 30 days)
        revenue_trends = []
        try:
            trends_pipeline = [
                {"$match": {
                    "status": {"$ne": "cancelled"},
                    "created_at": {"$gte": thirty_days_ago},
                    "totalAmount": {"$exists": True, "$ne": None}
                }},
                {"$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$created_at"}},
                    "revenue": {"$sum": "$totalAmount"}
                }},
                {"$sort": {"_id": 1}}
            ]
            revenue_trends = await db.orders.aggregate(trends_pipeline).to_list(None)
        except Exception as e:
            print(f"Error calculating revenue trends: {e}")

        return {
            "most_viewed": most_viewed,
            "top_searches": top_searches,
            "login_activity": login_activity,
            "wishlist_activity": wishlist_activity,
            "top_selling": top_selling,
            "revenue_metrics": {
                "weekly": weekly_revenue,
                "monthly": monthly_revenue,
                "yearly": yearly_revenue
            },
            "revenue_trends": revenue_trends
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")
