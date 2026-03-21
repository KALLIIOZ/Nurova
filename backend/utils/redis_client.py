import redis.asyncio as redis
from core.config import get_settings
from typing import Optional, Any
import json

settings = get_settings()


class RedisClient:
    """Redis client for cache and pub/sub"""
    
    _instance: Optional[redis.Redis] = None
    
    @classmethod
    async def connect(cls) -> redis.Redis:
        """Connect to Redis"""
        if cls._instance is None:
            cls._instance = await redis.from_url(settings.REDIS_URL)
        return cls._instance
    
    @classmethod
    async def disconnect(cls):
        """Disconnect from Redis"""
        if cls._instance:
            await cls._instance.close()
            cls._instance = None
    
    @classmethod
    async def get_instance(cls) -> redis.Redis:
        """Get Redis instance"""
        if cls._instance is None:
            await cls.connect()
        return cls._instance
    
    @classmethod
    async def set(cls, key: str, value: Any, expire: int = 3600):
        """Set value in Redis"""
        client = await cls.get_instance()
        if isinstance(value, dict):
            value = json.dumps(value)
        await client.set(key, value, ex=expire)
    
    @classmethod
    async def get(cls, key: str, json_decode: bool = False) -> Optional[Any]:
        """Get value from Redis"""
        client = await cls.get_instance()
        value = await client.get(key)
        if value and json_decode:
            return json.loads(value)
        return value
    
    @classmethod
    async def delete(cls, key: str):
        """Delete key from Redis"""
        client = await cls.get_instance()
        await client.delete(key)
    
    @classmethod
    async def publish(cls, channel: str, message: str):
        """Publish message to channel"""
        client = await cls.get_instance()
        await client.publish(channel, message)
    
    @classmethod
    async def subscribe(cls, channel: str):
        """Subscribe to channel"""
        client = await cls.get_instance()
        pubsub = client.pubsub()
        await pubsub.subscribe(channel)
        return pubsub
