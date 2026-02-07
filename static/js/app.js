const API = "http://127.0.0.1:5000/api/employees";
/*laoding ems*/
async function loadEmployees() { 
  const res= await fetch(API);
  const data=await res.json();
  const table=document.getElementById("employeeTable");
  table.innerHTML="";
  if(data.length===0) {
    table.innerHTML = "<tr><td colspan='5'>No employees</td></tr>";
    return;
  }
  data.forEach(emp => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${emp.employee_id}</td>
      <td>${emp.full_name}</td>
      <td>${emp.email}</td>
      <td>${emp.department}</td>
      <td><button onclick="deleteEmployee('${emp.employee_id}')">Delete</button></td>`;
    table.appendChild(row);
  });
}
/*deleting emps*/
async function deleteEmployee(id) {
  await fetch(`${API}/${id}`, {method: "DELETE" });
  loadEmployees();
}
document.getElementById("employeeForm").addEventListener("submit", async e=>{
  e.preventDefault();
  const payload={
    employee_id: employee_id.value,
    full_name: full_name.value,
    email: email.value,
    department: department.value
  };
  const res = await fetch(API, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload)
  });

  const result=await res.json();
  document.getElementById("employeeMessage").innerText=result.message || result.error;
  loadEmployees();
});
loadEmployees();