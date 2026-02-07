from flask import Blueprint, request, jsonify
from extensions import db
from models import Attendance, Employee
from datetime import datetime, date as dt_date
from sqlalchemy import func

attendancebp=Blueprint("attendance", __name__)
VALID_STATUS={"Present", "Absent"}

@attendancebp.route("/employees", methods=["GET"])
def get_all_employees():
    employees=Employee.query.all()
    return jsonify([e.to_dict() for e in employees]), 200
#history for specific employee
@attendancebp.route("/history/<employee_id>", methods=["GET"])
def get_individual_history(employee_id):
    records=Attendance.query.filter_by(employee_id=employee_id).order_by(Attendance.date.desc()).all()
    return jsonify([{
        "date": r.date.strftime("%Y-%m-%d"),
        "status": r.status
    } for r in records]), 200

@attendancebp.route("/", methods=["GET"])
def get_attendance_records():
    date_str=request.args.get("date")
    try:
        filter_date=datetime.strptime(date_str, "%Y-%m-%d").date() if date_str else dt_date.today()
    except (ValueError, TypeError):
        return jsonify(error="Invalid date format, use YYYY-MM-DD"), 400
    employees=Employee.query.all()
    records=Attendance.query.filter_by(date=filter_date).all()
    record_map={r.employee_id: r.status for r in records}
    output=[]
    for emp in employees:
        status=record_map.get(emp.employee_id, "Absent")
        output.append({
            "employee_id": emp.employee_id,
            "full_name": emp.full_name,
            "date": filter_date.strftime("%Y-%m-%d"),
            "status": status
        })
    return jsonify(output), 200

@attendancebp.route("/<employee_id>", methods=["POST"])
def mark_or_update_attendance(employee_id):
    data = request.get_json()
    status = data.get("status") # Take exactly what frontend sends
    date_str = data.get("date")

    if status not in VALID_STATUS:
        return jsonify(error=f"Invalid status: {status}"), 400

    try:
        att_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    except:
        return jsonify(error="Invalid date format"), 400

    # FORCE a check by clearing the session to avoid cached "Absent" labels
    db.session.expire_all() 
    
    record = Attendance.query.filter_by(employee_id=employee_id, date=att_date).first()

    if record:
        record.status = status
    else:
        record = Attendance(employee_id=employee_id, date=att_date, status=status)
        db.session.add(record)

    try:
        db.session.commit()
        return jsonify(message="Success", saved_status=status), 200
    except Exception as e:
        db.session.rollback()
        return jsonify(error=str(e)), 500
@attendancebp.route("/total_present", methods=["GET"])
def get_total_present():
    totals=db.session.query(
        Attendance.employee_id, func.count(Attendance.id)
    ).filter(Attendance.status == "Present").group_by(Attendance.employee_id).all()
    return jsonify({emp_id: cnt for emp_id, cnt in totals}), 200