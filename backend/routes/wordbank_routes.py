from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone
from database import get_db
from models import User, WordBank
from auth import get_current_user
from fpdf import FPDF
import os
import tempfile

router = APIRouter(prefix="/api/wordbank", tags=["word bank"])


class AddWordRequest(BaseModel):
    word: str
    definition: Optional[str] = ""
    example_sentence: Optional[str] = ""
    synonyms: Optional[str] = ""
    antonyms: Optional[str] = ""
    difficulty: Optional[str] = "medium"


class UpdateWordRequest(BaseModel):
    status: Optional[str] = None
    difficulty: Optional[str] = None


@router.get("/")
async def get_word_bank(
    status: Optional[str] = None,
    difficulty: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """get user's word bank with optional filters"""
    query = db.query(WordBank).filter(WordBank.user_id == user.id)

    if status:
        query = query.filter(WordBank.status == status)
    if difficulty:
        query = query.filter(WordBank.difficulty == difficulty)

    words = query.order_by(WordBank.created_at.desc()).all()

    return {
        "status": "success",
        "data": [
            {
                "id": w.id,
                "word": w.word,
                "definition": w.definition,
                "example_sentence": w.example_sentence,
                "synonyms": w.synonyms,
                "antonyms": w.antonyms,
                "difficulty": w.difficulty,
                "status": w.status,
                "times_reviewed": w.times_reviewed,
                "times_correct": w.times_correct,
                "accuracy": round((w.times_correct / w.times_reviewed) * 100) if w.times_reviewed > 0 else 0,
                "last_reviewed": w.last_reviewed.isoformat() if w.last_reviewed else None,
                "created_at": w.created_at.isoformat() if w.created_at else None
            }
            for w in words
        ],
        "total": len(words)
    }


@router.post("/add")
async def add_word(
    request: AddWordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """add a word to the word bank"""
    # check for duplicate
    existing = db.query(WordBank).filter(
        WordBank.user_id == user.id,
        WordBank.word == request.word.lower().strip()
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="Word already exists in your word bank")

    word = WordBank(
        user_id=user.id,
        word=request.word.lower().strip(),
        definition=request.definition,
        example_sentence=request.example_sentence,
        synonyms=request.synonyms,
        antonyms=request.antonyms,
        difficulty=request.difficulty
    )
    db.add(word)
    db.commit()
    db.refresh(word)

    return {"status": "success", "message": "Word added", "data": {"id": word.id}}


@router.put("/{word_id}")
async def update_word(
    word_id: int,
    request: UpdateWordRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """update word status or difficulty"""
    word = db.query(WordBank).filter(
        WordBank.id == word_id,
        WordBank.user_id == user.id
    ).first()

    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    if request.status:
        word.status = request.status
    if request.difficulty:
        word.difficulty = request.difficulty

    db.commit()
    return {"status": "success", "message": "Word updated"}


@router.delete("/{word_id}")
async def delete_word(
    word_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """remove a word from the word bank"""
    word = db.query(WordBank).filter(
        WordBank.id == word_id,
        WordBank.user_id == user.id
    ).first()

    if not word:
        raise HTTPException(status_code=404, detail="Word not found")

    db.delete(word)
    db.commit()
    return {"status": "success", "message": "Word removed"}


@router.get("/stats")
async def word_bank_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """get word bank statistics"""
    total = db.query(WordBank).filter(WordBank.user_id == user.id).count()
    mastered = db.query(WordBank).filter(WordBank.user_id == user.id, WordBank.status == "mastered").count()
    learning = db.query(WordBank).filter(WordBank.user_id == user.id, WordBank.status == "learning").count()
    new_words = db.query(WordBank).filter(WordBank.user_id == user.id, WordBank.status == "new").count()

    return {
        "status": "success",
        "data": {
            "total": total,
            "mastered": mastered,
            "learning": learning,
            "new": new_words,
            "mastery_rate": round((mastered / total) * 100) if total > 0 else 0
        }
    }


@router.get("/export")
async def export_word_bank(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """export word bank as pdf"""
    words = db.query(WordBank).filter(
        WordBank.user_id == user.id
    ).order_by(WordBank.word).all()

    if not words:
        raise HTTPException(status_code=404, detail="No words to export")

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Helvetica", "B", 18)
    pdf.cell(0, 12, "My Vocabulary Word Bank", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 8, f"Exported by {user.name} | Total words: {len(words)}", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(8)

    for w in words:
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 8, f"{w.word.title()}  [{w.difficulty}] - {w.status}", new_x="LMARGIN", new_y="NEXT")
        pdf.set_font("Helvetica", "", 10)
        if w.definition:
            pdf.multi_cell(0, 6, f"Definition: {w.definition}")
        if w.example_sentence:
            pdf.multi_cell(0, 6, f"Example: {w.example_sentence}")
        if w.synonyms:
            pdf.cell(0, 6, f"Synonyms: {w.synonyms}", new_x="LMARGIN", new_y="NEXT")
        pdf.ln(4)

    temp_dir = tempfile.gettempdir()
    filepath = os.path.join(temp_dir, f"wordbank_{user.id}.pdf")
    pdf.output(filepath)

    return FileResponse(filepath, filename="my_vocabulary.pdf", media_type="application/pdf")
