from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, QuizSession, QuizAnswer, WordBank
from auth import get_current_user
from ai_service import generate_quiz

router = APIRouter(prefix="/api/quiz", tags=["quiz"])


class QuizGenerateRequest(BaseModel):
    count: Optional[int] = 5
    difficulty: Optional[str] = "medium"
    quiz_type: Optional[str] = "mixed"
    use_word_bank: Optional[bool] = False


class AnswerSubmit(BaseModel):
    question: str
    question_type: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str


class QuizSubmitRequest(BaseModel):
    quiz_type: str
    difficulty: str
    time_taken: int
    answers: List[AnswerSubmit]


@router.post("/generate")
async def generate(
    request: QuizGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """generate a new quiz using ai"""
    try:
        words = None
        if request.use_word_bank:
            # get words from user's word bank
            word_entries = db.query(WordBank).filter(
                WordBank.user_id == user.id
            ).order_by(WordBank.times_correct.asc()).limit(20).all()
            words = [w.word for w in word_entries]

        result = await generate_quiz(
            count=request.count,
            difficulty=request.difficulty,
            quiz_type=request.quiz_type,
            words=words
        )
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")


@router.post("/submit")
async def submit(
    request: QuizSubmitRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """submit quiz results and save scores"""
    score = sum(1 for a in request.answers if a.is_correct)
    total = len(request.answers)

    # create quiz session
    session = QuizSession(
        user_id=user.id,
        quiz_type=request.quiz_type,
        difficulty=request.difficulty,
        score=score,
        total_questions=total,
        time_taken=request.time_taken
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # save individual answers
    for ans in request.answers:
        answer = QuizAnswer(
            session_id=session.id,
            question=ans.question,
            question_type=ans.question_type,
            user_answer=ans.user_answer,
            correct_answer=ans.correct_answer,
            is_correct=ans.is_correct,
            explanation=ans.explanation
        )
        db.add(answer)

    # update word bank stats if words match
    for ans in request.answers:
        word_entry = db.query(WordBank).filter(
            WordBank.user_id == user.id,
            WordBank.word.ilike(f"%{ans.correct_answer}%")
        ).first()
        if word_entry:
            word_entry.times_reviewed += 1
            if ans.is_correct:
                word_entry.times_correct += 1
            # update status based on accuracy
            if word_entry.times_reviewed >= 3:
                accuracy = word_entry.times_correct / word_entry.times_reviewed
                if accuracy >= 0.8:
                    word_entry.status = "mastered"
                elif accuracy >= 0.4:
                    word_entry.status = "learning"

    db.commit()

    return {
        "status": "success",
        "data": {
            "session_id": session.id,
            "score": score,
            "total": total,
            "percentage": round((score / total) * 100) if total > 0 else 0,
            "time_taken": request.time_taken
        }
    }


@router.get("/history")
async def quiz_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """get user's quiz history"""
    sessions = db.query(QuizSession).filter(
        QuizSession.user_id == user.id
    ).order_by(QuizSession.created_at.desc()).limit(20).all()

    return {
        "status": "success",
        "data": [
            {
                "id": s.id,
                "quiz_type": s.quiz_type,
                "difficulty": s.difficulty,
                "score": s.score,
                "total_questions": s.total_questions,
                "percentage": round((s.score / s.total_questions) * 100) if s.total_questions > 0 else 0,
                "time_taken": s.time_taken,
                "created_at": s.created_at.isoformat() if s.created_at else None
            }
            for s in sessions
        ]
    }


@router.get("/session/{session_id}")
async def quiz_session_detail(
    session_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """get detailed quiz session with answers"""
    session = db.query(QuizSession).filter(
        QuizSession.id == session_id,
        QuizSession.user_id == user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Quiz session not found")

    answers = db.query(QuizAnswer).filter(
        QuizAnswer.session_id == session_id
    ).all()

    return {
        "status": "success",
        "data": {
            "id": session.id,
            "quiz_type": session.quiz_type,
            "difficulty": session.difficulty,
            "score": session.score,
            "total_questions": session.total_questions,
            "time_taken": session.time_taken,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "answers": [
                {
                    "question": a.question,
                    "question_type": a.question_type,
                    "user_answer": a.user_answer,
                    "correct_answer": a.correct_answer,
                    "is_correct": a.is_correct,
                    "explanation": a.explanation
                }
                for a in answers
            ]
        }
    }
