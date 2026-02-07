const attendanceTable=document.getElementById("attendanceTable").querySelector("tbody");
const tableHead=document.getElementById("attendanceTable").querySelector("thead tr");
const loading=document.getElementById("loading");
const emptyState=document.getElementById("emptyState");
const attendanceForm=document.getElementById("attendanceForm");
const attendanceDate=document.getElementById("attendanceDate");
const attendanceMessage=document.getElementById("attendanceMessage");
const currentDateLabel=document.getElementById("currentDateLabel");

const today=new Date().toISOString().split('T')[0];
/*by default must open current date*/
attendanceDate.value=today;
attendanceDate.setAttribute("max", today);
let currentDate=today;

/*status*/
function showMessage(msg, type="success") {
    attendanceMessage.textContent=msg;
    //success=emerald-600 error=rose
    attendanceMessage.className=`text-sm font-bold transition-all ${type==="success" ? "text-emerald-600" : "text-rose-600"}`;
    setTimeout(()=>{ attendanceMessage.textContent=""; }, 4000);
}

/*avatar colour*/
function getAvatarColor(name) {
    const colors=['bg-purple-900', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-slate-700'];
    let hash=0;
    for (let i=0; i < name.length; i++) hash=name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}
function adjustHeader(isToday) {
    const base=`
        <th class="px-8 h-14 align-middle border-r border-slate-200">Employee</th>
        <th class="px-8 h-14 align-middle border-r border-slate-200">Status</th>`;
    
    tableHead.innerHTML=isToday ? 
        base+`<th class="px-8 h-14 align-middle">Total Present</th>` : 
        base+`<th class="px-8 h-14 align-middle text-right">Action</th>`;
}

/*main data load*/
async function loadAttendance(date) {
    const isToday=(date===today);
    loading.hidden=false;
    emptyState.hidden=true;
    attendanceTable.innerHTML="";
    adjustHeader(isToday);
    if(currentDateLabel) currentDateLabel.textContent=isToday ? "Today" : date;
    try {
        const res=await fetch(`/api/attendance?date=${date}`);
        const data=await res.json();
        if(!data || data.length===0) {
            emptyState.hidden=false;
            loading.hidden=true;
            return;
        }
        let totals={};
        if(isToday) {
            const totalsRes=await fetch(`/api/attendance/total_present`);
            totals=await totalsRes.json();
        }
        data.forEach(record=> {
            const row=document.createElement("tr");
            row.className="hover:bg-slate-50 transition-colors border-b border-slate-200";
            const initials=record.full_name.split(' ').map(n=> n[0]).join('').toUpperCase().substring(0, 2);
            const avatarColor=getAvatarColor(record.full_name);
            let statusHtml="";
            let extraHtml="";
            if(isToday) {
                const isChecked=record.status==="Present";
                statusHtml=`
                    <label class="relative inline-flex items-center cursor-pointer group">
                        <input type="checkbox" data-empid="${record.employee_id}" ${isChecked ? 'checked' : ''} class="sr-only peer attendance-toggle">
                        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-purple-900 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        <span class="ml-3 text-xs font-bold uppercase tracking-tighter status-label transition-colors ${isChecked ? 'text-purple-900' : 'text-slate-400'}">
                            ${record.status}
                        </span>
                    </label>`;
                //border-r to the last cell optional, but kept consistent
                extraHtml=`<td class="px-8 py-4 font-mono font-bold text-slate-700">${totals[record.employee_id] || 0}</td>`;
            }else{
                const badgeClass=record.status==="Present" ? 
                    "bg-purple-50 text-purple-900 border-purple-100" : 
                    "bg-slate-100 text-slate-500 border-slate-200";
                statusHtml=`<span class="px-2.5 py-1 rounded-md text-[10px] font-black uppercase border ${badgeClass}">${record.status}</span>`;
                extraHtml=`<td class="px-8 py-4 text-right">
                                <button type="button" class="edit-btn text-purple-900 font-bold text-xs hover:underline decoration-yellow-500" data-empid="${record.employee_id}">Edit</button>
                             </td>`;
            }
            row.innerHTML=`
                <td class="px-8 py-4 border-r border-slate-200">
                    <div class="flex items-center">
                        <div class="h-8 w-8 rounded-full ${avatarColor} flex items-center justify-center text-white text-[10px] font-bold mr-3 shadow-sm ring-2 ring-white">${initials}</div>
                        <div>
                            <div class="text-sm font-bold text-slate-800">${record.full_name}</div>
                            <div class="text-[10px] text-slate-400 font-mono">${record.employee_id}</div>
                        </div>
                    </div>
                </td>
                <td class="px-8 py-4 status-cell border-r border-slate-200">${statusHtml}</td>
                ${extraHtml}
            `;
            if(isToday) {
                const checkbox=row.querySelector('.attendance-toggle');
                const label=row.querySelector('.status-label');
                checkbox.addEventListener('change', (e)=> {
                    label.textContent=e.target.checked ? "Present" : "Absent";
                    if(e.target.checked) label.classList.replace('text-slate-400', 'text-purple-900');
                    else label.classList.replace('text-purple-900', 'text-slate-400');
                });
            }
            attendanceTable.appendChild(row);
        });

        if(!isToday) attachEditHandlers();
    } catch (err) {
        showMessage("Sync failed", "error");
    } finally {
        loading.hidden=true;
    }
}
/*past date edit*/
function attachEditHandlers() {
    document.querySelectorAll(".edit-btn").forEach(btn=> {
        btn.onclick=()=> {
            const empId=btn.dataset.empid;
            const row=btn.closest("tr");
            const cell=row.querySelector(".status-cell");
            const currentStatus=cell.innerText.trim();

            cell.innerHTML=`
                <select class="status-select bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-purple-900 focus:ring-1 focus:ring-yellow-500 outline-none">
                    <option value="Present" ${currentStatus==="Present" ? "selected" : ""}>Present</option>
                    <option value="Absent" ${currentStatus==="Absent" ? "selected" : ""}>Absent</option>
                </select>`;
            btn.style.display="none";
            const select=cell.querySelector("select");
            select.onchange=async ()=> {
                const newStatus=select.value;
                select.disabled=true;
                const res=await fetch(`/api/attendance/${empId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ date: currentDate, status: newStatus, edit: true })
                });
                if(res.ok) {
                    showMessage(`Log updated for ${currentDate}`, "success");
                    loadAttendance(currentDate);
                } else {
                    showMessage("Update failed", "error");
                    loadAttendance(currentDate);
                }
            };
            select.onblur=()=> { if(!select.disabled) loadAttendance(currentDate);};
            select.focus();
        };
    });
}

/*global submit*/
attendanceForm.onsubmit=async (e)=> {
    e.preventDefault();
    const toggles=attendanceTable.querySelectorAll(".attendance-toggle");
    const recordsToSave=toggles.length > 0 ? Array.from(toggles) : [];

    if(recordsToSave.length===0 && currentDate===today) return;
    const displayDate=currentDate===today ? "today" : currentDate;
    showMessage(`Updating log for ${displayDate}...`, "success");

    const promises=recordsToSave.map(cb=> {
        return fetch(`/api/attendance/${cb.dataset.empid}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: currentDate, status: cb.checked ? "Present" : "Absent", edit: true })
        });
    });
    try {
        await Promise.all(promises);
        showMessage(`Attendance log for ${displayDate} saved successfully!`, "success");
        loadAttendance(currentDate);
    } catch (err) {
        showMessage("Server error while saving", "error");
    }
};

attendanceDate.onchange=()=> {
    if(attendanceDate.value > today) {
        attendanceDate.value=today;
        return;
    }
    currentDate=attendanceDate.value;
    loadAttendance(currentDate);
};
loadAttendance(today);