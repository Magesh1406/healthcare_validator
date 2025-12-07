# PASTE THIS IN backend/app/models/provider.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from backend.app.database import Base


class Provider(Base):
    __tablename__ = "providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    npi = Column(String(10), unique=True, index=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    full_name = Column(String(200), nullable=False)

    # Contact Information
    email = Column(String(200))
    phone = Column(String(20))
    fax = Column(String(20))

    # Address
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(2))
    zip_code = Column(String(10))
    country = Column(String(2), default="US")

    # Professional Details
    specialty = Column(String(200))
    sub_specialty = Column(String(200))
    license_number = Column(String(50))
    license_state = Column(String(2))
    npi_type = Column(String(1))  # 1=Individual, 2=Organization

    # Practice Information
    practice_name = Column(String(200))
    website = Column(String(500))
    accepting_patients = Column(Boolean, default=True)

    # Validation Metadata
    data_source = Column(String(100))
    confidence_score = Column(Float, default=0.0)
    last_validated = Column(DateTime(timezone=True))
    validation_status = Column(String(20), default="pending")  # pending, validated, flagged, failed
    validation_notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Additional metadata
    metadata = Column(JSON, default=dict)

    def to_dict(self):
        return {
            "id": str(self.id),
            "npi": self.npi,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "address": f"{self.address_line1}, {self.city}, {self.state} {self.zip_code}",
            "specialty": self.specialty,
            "practice_name": self.practice_name,
            "confidence_score": self.confidence_score,
            "validation_status": self.validation_status,
            "last_validated": self.last_validated.isoformat() if self.last_validated else None
        }