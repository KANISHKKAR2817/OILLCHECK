import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class SuspiciousReport(Base):
    __tablename__ = "suspicious_reports"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g., PC-REP-2026-9812
    user_id = Column(String(36), ForeignKey("users.id"), index=True, nullable=False)
    scan_id = Column(String(36), ForeignKey("scans.id"), nullable=True)
    medicine_name = Column(String(255), nullable=False)
    batch_number = Column(String(100), nullable=True)
    manufacturer = Column(String(255), nullable=True)
    purchase_location = Column(String(255), nullable=True)  # pharmacy name or website
    purchase_date = Column(String(50), nullable=True)
    concern_description = Column(Text, nullable=False)
    status = Column(String(50), default="submitted", nullable=False)  # submitted, under_review, more_info_required, referred_to_authority, closed
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User")
    scan = relationship("Scan", back_populates="reports")
    reviews = relationship("ReportReview", back_populates="report", cascade="all, delete-orphan")

class ReportReview(Base):
    __tablename__ = "report_reviews"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String(36), ForeignKey("suspicious_reports.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    action = Column(String(50), nullable=False)  # status_change, note_added, referral
    notes = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    report = relationship("SuspiciousReport", back_populates="reviews")
    reviewer = relationship("User")
