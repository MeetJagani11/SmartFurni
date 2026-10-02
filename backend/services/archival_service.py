from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def archive_completed_orders(db):
    """
    Moves orders that have been 'delivered' or 'cancelled' for more than 24 hours
    to an 'archived_orders' collection.
    """
    try:
        # Calculate the threshold time (24 hours ago)
        threshold_time = datetime.utcnow() - timedelta(hours=24)
        
        # Find orders to archive
        # Note: completedAt is stored as 'completedAt' due to Pydantic alias, but MongoDB usually uses the alias for storage if configured
        # In our model, we have: completed_at: Optional[datetime] = Field(None, alias="completedAt")
        # And model_config = ConfigDict(populate_by_name=True)
        # However, $set in our route uses "completedAt" explicitly.
        
        query = {
            "status": {"$in": ["delivered", "cancelled"]},
            "completedAt": {"$lt": threshold_time}
        }
        
        orders_to_archive = await db.orders.find(query).to_list(length=100)
        
        if not orders_to_archive:
            logger.info("No orders found for archival.")
            return
            
        logger.info(f"Found {len(orders_to_archive)} orders for archival.")
        
        # Perform archival
        for order in orders_to_archive:
            # Insert into archived_orders
            await db.archived_orders.insert_one(order)
            # Remove from active orders
            await db.orders.delete_one({"id": order["id"]})
            logger.info(f"Archived order: {order['id']}")
            
        logger.info("Order archival process completed successfully.")
        
    except Exception as e:
        logger.error(f"Error during order archival: {str(e)}")
