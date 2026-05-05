from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, WordBank, QuizSession, SearchHistory
from auth import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])


@router.get("/dashboard")
async def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """get dashboard stats for the current user"""

    # word bank stats
    total_words = db.query(WordBank).filter(WordBank.user_id == user.id).count()
    mastered_words = db.query(WordBank).filter(
        WordBank.user_id == user.id, WordBank.status == "mastered"
    ).count()

    # quiz stats
    total_quizzes = db.query(QuizSession).filter(QuizSession.user_id == user.id).count()

    avg_score_result = db.query(
        func.avg(
            (QuizSession.score * 100.0) / func.nullif(QuizSession.total_questions, 0)
        )
    ).filter(QuizSession.user_id == user.id).scalar()
    avg_score = round(avg_score_result) if avg_score_result else 0

    # recent quizzes for chart
    recent_quizzes = db.query(QuizSession).filter(
        QuizSession.user_id == user.id
    ).order_by(QuizSession.created_at.desc()).limit(10).all()

    quiz_chart_data = [
        {
            "date": q.created_at.strftime("%b %d") if q.created_at else "",
            "score": round((q.score / q.total_questions) * 100) if q.total_questions > 0 else 0,
            "type": q.quiz_type
        }
        for q in reversed(recent_quizzes)
    ]

    # search history count
    total_searches = db.query(SearchHistory).filter(
        SearchHistory.user_id == user.id
    ).count()

    # recent activity
    recent_activity = db.query(SearchHistory).filter(
        SearchHistory.user_id == user.id
    ).order_by(SearchHistory.created_at.desc()).limit(5).all()

    activity_list = [
        {
            "feature": a.feature_used,
            "query": a.query_text,
            "time": a.created_at.isoformat() if a.created_at else None
        }
        for a in recent_activity
    ]

    # word bank breakdown by difficulty
    easy_count = db.query(WordBank).filter(WordBank.user_id == user.id, WordBank.difficulty == "easy").count()
    medium_count = db.query(WordBank).filter(WordBank.user_id == user.id, WordBank.difficulty == "medium").count()
    hard_count = db.query(WordBank).filter(WordBank.user_id == user.id, WordBank.difficulty == "hard").count()

    return {
        "status": "success",
        "data": {
            "user": {
                "name": user.name,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "member_since": user.created_at.strftime("%B %Y") if user.created_at else ""
            },
            "stats": {
                "total_words": total_words,
                "mastered_words": mastered_words,
                "total_quizzes": total_quizzes,
                "avg_score": avg_score,
                "total_searches": total_searches
            },
            "quiz_chart": quiz_chart_data,
            "recent_activity": activity_list,
            "word_difficulty": {
                "easy": easy_count,
                "medium": medium_count,
                "hard": hard_count
            }
        }
    }


@router.get("/history")
async def get_search_history(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """get user's search and feature usage history"""
    history = db.query(SearchHistory).filter(
        SearchHistory.user_id == user.id
    ).order_by(SearchHistory.created_at.desc()).limit(50).all()

    return {
        "status": "success",
        "data": [
            {
                "id": h.id,
                "query": h.query_text,
                "feature": h.feature_used,
                "summary": h.result_summary,
                "time": h.created_at.isoformat() if h.created_at else None
            }
            for h in history
        ]
    }
