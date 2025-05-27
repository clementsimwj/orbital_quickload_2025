from configurations import users_collection
from database.schemas import all_data
from database.models import User
import random
import hashlib

def create_user(tele_handle: str) -> int:
    num = random.randint(100000, 999999)
    code = hashlib.sha256(str(num).encode()).hexdigest()
    user = User(tele_handle=tele_handle, code=code)
    users_collection.update_one(
        {"tele_handle": tele_handle},
        {"$set": user.dict()},
        upsert=True,
    )
    return num

