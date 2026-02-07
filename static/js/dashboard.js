async function loadDashboard() {
    try {
        //Fetch total Employees
        const empRes=await fetch('/api/employees');
        const employees=await empRes.json();
        const totalEmp=employees.length;

        //feftch attendance for today
        const today=new Date().toISOString().split('T')[0];
        const attRes=await fetch(`/api/attendance?date=${today}`);
        const attendance=await attRes.json();

        //calculate Present Count
        const presentCount=attendance.filter(rec => rec.status === "Present").length;
        
        //calculate Rate
        const rate=totalEmp > 0 ? Math.round((presentCount / totalEmp) * 100) : 0;

        //Update DOM
        document.getElementById('statTotalEmployees').textContent=totalEmp;
        document.getElementById('statPresentToday').textContent=presentCount;
        document.getElementById('statRate').textContent=`${rate}%`;

    } catch (err) {
        console.error("Dashboard Sync Error:", err);
    }
}

loadDashboard();