import redis.asyncio as redis

BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
COUNTER_KEY = "kgs:unique_counter"


def to_base62(num: int) -> str:
    if num == 0:
        return BASE62_CHARS[0]

    encoded = ""
    while num > 0:
        num, rem = divmod(num, 62)
        encoded = BASE62_CHARS[rem] + encoded
    return encoded


async def generate_unique_short_key(redis_client: redis.Redis) -> str:
    """
    Increments a global counter and encodes it to a Base62 string.
    """
    unique_id = await redis_client.incr(COUNTER_KEY)
    return to_base62(unique_id)