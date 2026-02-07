from flask import Blueprint, request, jsonify
from sqlalchemy.exc import IntegrityError
import re
from extensions import db
from models import Employee

employeebp=Blueprint("employees", __name__)
#emailrule
EMAIL_REGEX= r"^[\w\.-]+@[\w\.-]+\.\w+$"

@employeebp.route("/", methods=["GET"])
def get_employees():
    employees=Employee.query.all()
    return jsonify([emp.to_dict() for emp in employees]), 200

@employeebp.route("/", methods=["POST"])
def add_employee():
    data=request.get_json()
    if not data:
        return jsonify(error="Request body must be JSON"), 400

    employee_id=data.get("employee_id")
    full_name=data.get("full_name")
    email=data.get("email")
    department=data.get("department")

    if not all([employee_id, full_name, email, department]):
        return jsonify(error="All fields are required"), 400
    if not re.match(EMAIL_REGEX, email):
        return jsonify(error="Invalid email format"), 400
    if Employee.query.filter_by(employee_id=employee_id).first():
        return jsonify(error="Employee ID already exists"), 409
    if Employee.query.filter_by(email=email).first():
        return jsonify(error="Email already exists"), 409
    try:
        employee=Employee(
            employee_id=employee_id,
            full_name=full_name,
            email=email,
            department=department
        )
        db.session.add(employee)
        db.session.commit()
        return jsonify(
            message="Employee created successfully",
            employee=employee.to_dict()
        ), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify(error="Database error"), 500
@employeebp.route("/<employee_id>", methods=["DELETE"])
def delete_employee(employee_id):
    employee=Employee.query.filter_by(employee_id=employee_id).first()
    if not employee:
        return jsonify(error="Employee not found"), 404
    db.session.delete(employee)
    db.session.commit()
    return jsonify(message="Employee deleted successfully"), 200