import os
from flask import Flask, render_template, redirect, url_for
from extensions import db

def create_app():
    app=Flask(__name__)
    #finds the absolute path of your project folder
    basedir=os.path.abspath(os.path.dirname(__file__))
    
    #works on Windows (local) and linux (Render)
    app.config["SQLALCHEMY_DATABASE_URI"]="sqlite:///" + os.path.join(basedir, "hrms.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"]=False
    app.config["SECRET_KEY"]=os.environ.get("SECRET_KEY", "dev-secret-key-123")

    db.init_app(app)

    #automatically create database on startup
    with app.app_context():
        from models import Employee, Attendance
        db.create_all()

    #UI Routes
    @app.route("/")
    def home():
        return render_template("index.html")

    @app.route("/employees")
    def employees_ui():
        return render_template("employees.html")

    @app.route("/attendance")
    def attendance_ui():
        return render_template("attendance.html")

    #API Registration
    from routes.employees import employeebp
    from routes.attendance import attendancebp
    app.register_blueprint(employeebp, url_prefix="/api/employees")
    app.register_blueprint(attendancebp, url_prefix="/api/attendance")

    return app

app=create_app()

if __name__ == "__main__":
    #using environment port for render, default to 5000 for local
    port=int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)