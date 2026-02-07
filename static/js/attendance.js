const attendanceTable=document
  .getElementById("attendanceTable")
  .querySelector("tbody");
const tableHead=document
  .getElementById("attendanceTable")
  .querySelector("thead tr");
const loading=document.getElementById("loading");
const emptyState=document.getElementById("emptyState");
const attendanceForm=document.getElementById("attendanceForm");
const attendanceDate=document.getElementById("attendanceDate");
const attendanceMessage=document.getElementById("attendanceMessage");
const currentDateLabel=document.getElementById("currentDateLabel");
const today=new Date().toISOString().split("T")[0];
attendanceDate.value=today;
attendanceDate.setAttribute("max", today);

let currentDate=today;
let pendingEdits={};
/*helper fns*/
function showMessage(msg, type="success") {
  attendanceMessage.textContent=msg;
  attendanceMessage.className=`text-sm font-bold ${
    type === "success" ? "text-emerald-600" : "text-rose-600"
  }`;
  setTimeout(() => (attendanceMessage.textContent=""), 4000);
}

function getAvatarColor(name) {
  const colors=[
    "bg-purple-900",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-sky-500",
    "bg-slate-700",
  ];
  let hash=0;
  for (let c of name) hash=c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
function adjustHeader(isToday) {
  tableHead.innerHTML=`
    <th class="px-8 h-14 border-r">Employee</th>
    <th class="px-8 h-14 border-r">Status</th>
    <th class="px-8 h-14 ${isToday ? "" : "text-right"}">
      ${isToday ? "Total Present" : "Action"}
    </th>`;
}

/*attendaceload*/
async function loadAttendance(date) {
  const isToday=date === today;

  loading.hidden=false;
  emptyState.hidden=true;
  attendanceTable.innerHTML="";
  adjustHeader(isToday);

  if (currentDateLabel)
    currentDateLabel.textContent=isToday ? "Today" : date;
  try {
    const res=await fetch(`/api/attendance?date=${date}`);
    const data=await res.json();

    if (!data.length) {
      emptyState.hidden=false;
      return;
    }

    let totals={};
    if (isToday) {
      const t=await fetch(`/api/attendance/total_present`);
      totals=await t.json();
    }

    data.forEach((record) => {
      const row=document.createElement("tr");
      row.className="border-b hover:bg-slate-50";
      const initials=record.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const status =
        pendingEdits[record.employee_id]?.status ?? record.status;

      /*today */
      let statusHtml="";
      let actionHtml="";

      if (isToday) {
        statusHtml=`
          <label class="inline-flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              class="attendance-toggle"
              data-empid="${record.employee_id}"
              ${status === "Present" ? "checked" : ""}>
            <span class="status-label text-xs font-bold ${
              status === "Present" ? "text-purple-900" : "text-slate-400"
            }">${status}</span>
          </label>
        `;
        actionHtml=`
          <td class="px-8 font-bold">
            ${totals[record.employee_id] || 0}
          </td>`;
      }

      /*past dates*/
      else {
        const badge =
          status === "Present"
            ? "bg-purple-50 text-purple-900 border-purple-100"
            : "bg-slate-100 text-slate-500 border-slate-200";

        statusHtml=`
          <span data-status="${status}"
            class="px-2 py-1 text-[10px] font-black uppercase border rounded ${badge}">
            ${status}
          </span>`;
        actionHtml=`
          <td class="px-8 text-right">
            <button
              class="edit-btn text-purple-900 font-bold text-xs"
              data-empid="${record.employee_id}">
              Edit
            </button>
          </td>`;
      }

      row.innerHTML=`
        <td class="px-8 py-4 border-r">
          <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-full ${getAvatarColor(
              record.full_name
            )} text-white flex items-center justify-center text-xs font-bold">
              ${initials}
            </div>
            <div>
              <div class="font-bold">${record.full_name}</div>
              <div class="text-xs text-slate-400">${record.employee_id}</div>
            </div>
          </div>
        </td>
        <td class="px-8 py-4 status-cell border-r">${statusHtml}</td>
        ${actionHtml}
      `;
      attendanceTable.appendChild(row);
    });

    if (isToday) attachToggleHandlers();
    else attachEditHandlers();
  } catch {
    showMessage("Failed to load data", "error");
  } finally {
    loading.hidden=true;
  }
}

/*toggleui*/

function attachToggleHandlers() {
  document.querySelectorAll(".attendance-toggle").forEach((cb) => {
    cb.onchange=() => {
      const label=cb.nextElementSibling;
      const present=cb.checked;
      label.textContent=present ? "Present" : "Absent";
      label.className=`status-label text-xs font-bold ${
        present ? "text-purple-900" : "text-slate-400"
      }`;
    };
  });
}

/*past edit withoutsave*/
function attachEditHandlers() {
  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.onclick=() => {
      const empId=btn.dataset.empid;
      const row=btn.closest("tr");
      const cell=row.querySelector(".status-cell");
      const current =
        pendingEdits[empId]?.status ||
        cell.querySelector("span").dataset.status;

      cell.innerHTML=`
        <select class="status-select border px-2 py-1 text-xs font-bold">
          <option value="Present" ${
            current === "Present" ? "selected" : ""
          }>Present</option>
          <option value="Absent" ${
            current === "Absent" ? "selected" : ""
          }>Absent</option>
        </select>`;

      btn.style.display="none";

      const select=cell.querySelector("select");
      select.focus();

      select.onchange=() => {
        pendingEdits[empId]={
          date: currentDate,
          status: select.value,
        };

        const badge =
          select.value === "Present"
            ? "bg-purple-50 text-purple-900 border-purple-100"
            : "bg-slate-100 text-slate-500 border-slate-200";

        cell.innerHTML=`
          <span data-status="${select.value}"
            class="px-2 py-1 text-[10px] font-black uppercase border rounded ${badge}">
            ${select.value}
          </span>`;

        btn.style.display="inline-block";
      };
    };
  });
}

/*savebutton*/

attendanceForm.onsubmit=async (e) => {
  e.preventDefault();
  const requests=[];

  // today
  document.querySelectorAll(".attendance-toggle").forEach((cb) => {
    requests.push(
      fetch(`/api/attendance/${cb.dataset.empid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          status: cb.checked ? "Present" : "Absent",
        }),
      })
    );
  });

  // past
  Object.entries(pendingEdits).forEach(([empId, data]) => {
    requests.push(
      fetch(`/api/attendance/${empId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
    );
  });

  if (!requests.length) return;

  showMessage("Saving attendance...");

  try {
    await Promise.all(requests);
    pendingEdits={};
    showMessage("Attendance saved successfully!");
    loadAttendance(currentDate);
  } catch {
    showMessage("Save failed", "error");
  }
};

/* date change*/

attendanceDate.onchange=() => {
  currentDate=attendanceDate.value;
  loadAttendance(currentDate);
};

loadAttendance(today);