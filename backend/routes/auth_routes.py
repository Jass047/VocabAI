from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User
from auth import create_access_token, get_google_user_info, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


class GoogleLoginRequest(BaseModel):
    access_token: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: str

    class Config:
        from_attributes = True


@router.post("/google")
async def google_login(request: GoogleLoginRequest, db: Session = Depends(get_db)):
    """handle google oauth login - create or get user, return jwt"""

    # get user info from google
    google_user = await get_google_user_info(request.access_token)

    google_id = google_user.get("id")
    email = google_user.get("email")
    name = google_user.get("name", "User")
    avatar = google_user.get("picture", "")

    # check if user exists
    user = db.query(User).filter(User.google_id == google_id).first()

    if not user:
        # create new user
        user = User(
            google_id=google_id,
            name=name,
            email=email,
            avatar_url=avatar
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # update name and avatar in case they changed
        user.name = name
        user.avatar_url = avatar
        db.commit()

    # create jwt token
    token = create_access_token({"user_id": user.id, "email": user.email})

    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar_url": user.avatar_url
        }
    }


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    """get current user profile"""
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "created_at": user.created_at.isoformat() if user.created_at else None
    }
