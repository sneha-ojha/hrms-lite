const API_URL="/api/employees";
const table=document.getElementById("employeeTable");
const tbody=table.querySelector("tbody");
const loading=document.getElementById("loading");
const emptyState=document.getElementById("emptyState");
const formError=document.getElementById("formError");
const employeeForm=document.getElementById("employeeForm");
const totalCountEl=document.getElementById('totalCount');

function getAvatarColor(name) {
    const colors=['bg-purple-900', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-slate-700'];
    let hash=0;
    for (let i=0; i < name.length; i++) hash=name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
async function loadEmployees() {
    loading.hidden=false;
    table.hidden=true;
    emptyState.hidden=true;
    try {
        const res=await fetch(API_URL);
        const data=await res.json();
        tbody.innerHTML="";
        if (totalCountEl) totalCountEl.textContent=data.length;
        if (data.length=== 0) { emptyState.hidden=false; return; }
data.forEach(emp => {
    const row=document.createElement("tr");
    row.className="hover:bg-slate-50 transition-colors border-b border-slate-200"; 
    const initials=emp.full_name.split(' ').filter(n => n.length > 0).map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const avatarColor=getAvatarColor(emp.full_name);
    row.innerHTML=`
        <td class="px-8 py-4 border-r border-slate-200 font-mono text-xs font-bold text-slate-400">${emp.employee_id}</td>
        <td class="px-8 py-4 border-r border-slate-200">
            <div class="flex items-center">
                <div class="h-10 w-10 rounded-full ${avatarColor} flex items-center justify-center text-white text-xs font-bold mr-3 shadow-sm ring-2 ring-white">${initials || '?'}</div>
                <div class="text-sm font-bold text-slate-800">${emp.full_name}</div>
            </div>
        </td>
        <td class="px-8 py-4 border-r border-slate-200 text-sm text-slate-500 font-medium italic">${emp.email}</td>
        <td class="px-8 py-4 border-r border-slate-200">
            <span class="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                ${emp.department}
            </span>
        </td>
        <td class="px-8 py-4 text-right">
            <div class="flex justify-end gap-2">
                <button onclick="viewHistory('${emp.employee_id}', '${emp.full_name}')" 
                        class="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="text-[11px] font-bold uppercase">Records</span>
                </button>
                <button onclick="deleteEmployee('${emp.employee_id}')" 
                        class="flex items-center gap-2 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span class="text-[11px] font-bold uppercase">Delete</span>
                </button>
            </div>
        </td>`;
    tbody.appendChild(row);
});
        table.hidden=false;
    } catch (err) { console.error("Load Error:", err); } finally { loading.hidden=true; }
}

async function viewHistory(id, name) {
    toggleDrawer(true);
    const list=document.getElementById("historyList");
    document.getElementById("drawerName").textContent=name;
    document.getElementById("drawerId").textContent=`ID: ${id}`;
    list.innerHTML=`<tr><td colspan="2" class="py-10 text-center text-slate-400 animate-pulse font-bold uppercase tracking-widest text-xs">Syncing History...</td></tr>`;
    try {
        const res=await fetch(`/api/attendance/history/${id}`);
        const data=await res.json();     
        if (data.length === 0) {
            list.innerHTML=`<tr><td colspan="2" class="py-10 text-center text-slate-400 italic">No attendance records found.</td></tr>`;
            return;
        }
        list.innerHTML=data.map(rec => `
            <tr>
                <td class="py-4 text-sm font-bold text-slate-600">${rec.date}</td>
                <td class="py-4 text-right">
                    <span class="px-2 py-1 rounded text-[10px] font-black uppercase ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}">
                        ${rec.status}
                    </span>
                </td>
            </tr>
        `).join('');
    } catch (err) { list.innerHTML=`<tr><td colspan="2" class="py-10 text-center text-rose-500">Error loading data.</td></tr>`; }
}
async function deleteEmployee(id) {
    if (!confirm(`Permanently remove employee ${id}?`)) return;
    try {
        const res=await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        if (res.ok) loadEmployees();
    } catch (err) { console.error(err); }
}
employeeForm.addEventListener("submit", async e => {
    e.preventDefault();
    formError.textContent="";
    const payload={
        employee_id: document.getElementById("employee_id").value.trim(),
        full_name: document.getElementById("full_name").value.trim(),
        email: document.getElementById("email").value.trim(),
        department: document.getElementById("department").value.trim()
    };
    try {
        const res=await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result=await res.json();
        if (!res.ok) { formError.textContent=result.error || "Failed."; return; }
        e.target.reset();
        toggleModal(false);
        loadEmployees();
    } catch (err) { formError.textContent="Server error."; }
});
loadEmployees();