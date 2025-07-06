from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert, select
from sqlalchemy.orm import joinedload

from typing import Annotated, List
from configurations import get_db
from database import schemas, models
from auth import get_current_user

router = APIRouter(
    prefix="/store",
    tags=["store"],
)

user_dependency = Annotated[dict, Depends(get_current_user)]

#View all items
@router.get("/items")
async def get_items(user: user_dependency, 
                    db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    result = await db.execute(select(models.Item).options(joinedload(models.Item.user)))
    items = result.scalars().all()
    response = [
        {
            "item_id": item.item_id,
            "item_name": item.item_name,
            "item_desc": item.item_desc,
            "item_price": item.item_price,
            "item_seller": item.user.telegram_handle,
            "item_sellerId": item.item_seller
        }
        for item in items
    ]
    return {
        "User" : user,
        "Items": response
    }

#Add Item
@router.post("/add_item", response_model=schemas.Item, status_code=status.HTTP_201_CREATED)
async def add_item(item: schemas.ItemCreate, 
                   user: user_dependency, 
                   db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    print(item)
    print(user)
    stmt = insert(models.Item).values(
        item_name=item.item_name,
        item_price=item.item_price,
        item_desc=item.item_desc,
        item_seller=user["user_id"]
    ).returning(
        models.Item.item_id,
        models.Item.item_name, 
        models.Item.item_price, 
        models.Item.item_desc, 
        models.Item.item_seller
    )

    result = await db.execute(stmt)
    await db.commit()
    row = result.first()
    return dict(row._mapping)

#Delete Item
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int,
                  user: user_dependency,
                  db: AsyncSession = Depends(get_db)):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")
    
    result = await db.execute(select(models.Item).where(models.Item.item_id == item_id))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    if item.item_seller != user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this item")
    await db.delete(item)
    await db.commit()
    return

class ItemUpdate(BaseModel):
    item_name: str | None = None
    item_price: float | None = None
    item_desc: str | None = None
#Update Item
@router.patch("/{item_id}", response_model=schemas.Item)
async def update_item(
    item_id: int,
    item_update: ItemUpdate,
    user: user_dependency,
    db: AsyncSession = Depends(get_db),
):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication Failed")

    result = await db.execute(select(models.Item).where(models.Item.item_id == item_id))
    item = result.scalars().first()

    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    if item.item_seller != user["user_id"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this item")
    
    data = item_update.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(item, key, value)
    db.add(item)
    await db.commit()
    await db.refresh(item)

    return item

