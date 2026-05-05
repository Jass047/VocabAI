from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    google_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    avatar_url = Column(String, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # relationships
    word_bank = relationship("WordBank", back_populates="user")
    quiz_sessions = relationship("QuizSession", back_populates="user")
    search_history = relationship("SearchHistory", back_populates="user")


class WordBank(Base):
    __tablename__ = "word_bank"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    word = Column(String, nullable=False)
    definition = Column(Text, default="")
    example_sentence = Column(Text, default="")
    synonyms = Column(Text, default="")
    antonyms = Column(Text, default="")
    difficulty = Column(String, default="medium")  # easy, medium, hard
    status = Column(String, default="new")  # new, learning, mastered
    times_reviewed = Column(Integer, default=0)
    times_correct = Column(Integer, default=0)
    last_reviewed = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="word_bank")


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_type = Column(String, nullable=False)  # mcq, fill_blank, match, mixed
    difficulty = Column(String, default="medium")
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    time_taken = Column(Integer, default=0)  # seconds
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="quiz_sessions")
    answers = relationship("QuizAnswer", back_populates="session")


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("quiz_sessions.id"), nullable=False)
    question = Column(Text, nullable=False)
    question_type = Column(String, default="mcq")
    user_answer = Column(String, default="")
    correct_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, default=False)
    explanation = Column(Text, default="")

    session = relationship("QuizSession", back_populates="answers")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    query_text = Column(Text, nullable=False)
    feature_used = Column(String, nullable=False)  # enhance, explore, quiz, rewrite
    result_summary = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="search_history")
