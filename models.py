from datetime import datetime
from extensions import db

class Employee(db.Model):
    __tablename__="employees"

    id=db.Column(db.Integer, primary_key=True)
    employee_id=db.Column(db.String(20), unique=True, nullable=False)
    full_name=db.Column(db.String(100), nullable=False)
    email=db.Column(db.String(120), unique=True, nullable=False)
    department=db.Column(db.String(50), nullable=False)
    created_at=db.Column(db.DateTime, default=datetime.utcnow)

    attendance=db.relationship(
        "Attendance",
        backref="employee",
        cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "employee_id": self.employee_id,
            "full_name": self.full_name,
            "email": self.email,
            "department": self.department,
            "created_at": self.created_at.isoformat()
        }
class Attendance(db.Model):
    __tablename__="attendance"

    id=db.Column(db.Integer, primary_key=True)
    employee_id=db.Column(
        db.String(20),
        db.ForeignKey("employees.employee_id"),
        nullable=False
    )
    date=db.Column(db.Date, nullable=False)
    status=db.Column(db.String(50), nullable=False)

    __table_args__=(
        db.UniqueConstraint("employee_id", "date", name="unique_attendance"),
    )
    def to_dict(self):
        return {
            "employee_id": self.employee_id,
            "date": self.date.isoformat(),
            "status": self.status
        }