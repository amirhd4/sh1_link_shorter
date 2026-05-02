import redis.asyncio as redis

BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"

def to_base62(num: int) -> str:
    if num == 0:
        return BASE62_CHARS[0]

    encoded = ""
    while num > 0:
        num, rem = divmod(num, 64)
        encoded = BASE62_CHARS[rem] + encoded
    return encoded


def make_counter_key(domain_id: int | None) -> str:
    return f"kgs:counter:{domain_id or 'default'}"


async def generate_unique_short_key(
    redis_client,
    domain_id: int | None
) -> str:
    counter_key = make_counter_key(domain_id)
    unique_id = await redis_client.incr(counter_key)
    return to_base62(unique_id)
