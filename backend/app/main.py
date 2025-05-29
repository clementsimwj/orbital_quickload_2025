from fastapi import FastAPI, HTTPException, Depends, status
from typing import Annotated
import auth
from auth import get_current_user

app = FastAPI()
app.include_router(auth.router)

user_dependency = Annotated[dict, Depends(get_current_user)]

@app.get("/index", status_code=status.HTTP_200_OK)
async def user(user: user_dependency):
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, 
                            detail='Authentication Failed')
    return {"User": user}






