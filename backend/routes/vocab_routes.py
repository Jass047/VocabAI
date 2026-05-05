from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User, SearchHistory
from auth import get_current_user
from ai_service import enhance_text, explore_word, rewrite_text, get_word_of_day

router = APIRouter(prefix="/api/vocab", tags=["vocabulary"])


class EnhanceRequest(BaseModel):
    text: str
    tone: Optional[str] = "academic"  # academic, formal, casual, creative


class ExploreRequest(BaseModel):
    word: str


class RewriteRequest(BaseModel):
    text: str
    tone: str = "formal"  # formal, casual, academic, creative, professional


@router.post("/enhance")
async def enhance(
    request: EnhanceRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """analyze and enhance text vocabulary"""
    try:
        result = await enhance_text(request.text, request.tone)

        # save to history
        history = SearchHistory(
            user_id=user.id,
            query_text=request.text[:200],
            feature_used="enhance",
            result_summary=f"Enhanced with {request.tone} tone"
        )
        db.add(history)
        db.commit()

        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/explore")
async def explore(
    request: ExploreRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """explore a word - definition, synonyms, examples etc"""
    try:
        result = await explore_word(request.word)

        # save to history
        history = SearchHistory(
            user_id=user.id,
            query_text=request.word,
            feature_used="explore",
            result_summary=result.get("definition", "")[:200]
        )
        db.add(history)
        db.commit()

        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/rewrite")
async def rewrite(
    request: RewriteRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """rewrite text in a different tone"""
    try:
        result = await rewrite_text(request.text, request.tone)

        # save to history
        history = SearchHistory(
            user_id=user.id,
            query_text=request.text[:200],
            feature_used="rewrite",
            result_summary=f"Rewritten in {request.tone} tone"
        )
        db.add(history)
        db.commit()

        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.get("/word-of-day")
async def word_of_day(user: User = Depends(get_current_user)):
    """get ai-generated word of the day"""
    try:
        result = await get_word_of_day()
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
