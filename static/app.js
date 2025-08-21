// ====== 유틸: 오늘 날짜 YYYY-MM-DD ======
function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// ====== localStorage 헬퍼 (날짜별 키) ======
function storageKeyFor(dateStr) {
  return `milkData:${dateStr}`;
}

function loadFromLocalStorage(dateStr) {
  try {
    const raw = localStorage.getItem(storageKeyFor(dateStr));
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("loadFromLocalStorage error:", e);
    return {};
  }
}

function saveToLocalStorage(dateStr, dataObj) {
  try {
    localStorage.setItem(storageKeyFor(dateStr), JSON.stringify(dataObj));
  } catch (e) {
    console.error("saveToLocalStorage error:", e);
  }
}

// ====== CSV 내보내기/불러오기 ======
function escapeCSV(val) {
  const s = String(val ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportCSVForDate(dateStr) {
  const data = loadFromLocalStorage(dateStr); // { id: {name, gender, status}, ... }
  const ids = Object.keys(data);
  if (!ids.length) {
    alert("저장된 데이터가 없습니다.");
    return;
  }
  let csv = "date,student_id,name,gender,status\n";
  ids.forEach((id) => {
    const { name = "", gender = "", status = "" } = data[id] || {};
    csv += `${dateStr},${id},${escapeCSV(name)},${escapeCSV(gender)},${escapeCSV(status)}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `milk_${dateStr}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCSVLine(line) {
  const result = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        result.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  result.push(cur);
  return result.map((s) => s.trim());
}

function importCSVToDate(file, dateStr, after) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    const text = evt.target.result;
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (lines.length <= 1) {
      alert("CSV 내용이 비어 있습니다.");
      after && after(false);
      return;
    }
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const di = {
      date: header.indexOf("date"),
      id: header.indexOf("student_id"),
      name: header.indexOf("name"),
      gender: header.indexOf("gender"),
      status: header.indexOf("status"),
    };
    const nextData = {};
    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (!row || !row.length) continue;
      const rowDate = di.date >= 0 ? row[di.date] : dateStr;
      if (rowDate && rowDate !== dateStr) continue; // 다른 날짜는 스킵
      const sid = di.id >= 0 ? row[di.id] : "";
      if (!sid) continue;
      const name = di.name >= 0 ? row[di.name] : "";
      const gender = di.gender >= 0 ? row[di.gender] : "";
      const status = di.status >= 0 ? row[di.status] : "";
      nextData[sid] = { name, gender, status };
    }
    saveToLocalStorage(dateStr, nextData);
    alert("CSV 불러오기 완료!");
    after && after(true);
  };
  reader.readAsText(file, "utf-8");
}

// ====== 학생 데이터(예시 20명: 남 1–11, 여 51–59) ======
const STUDENTS = [
  // boys 1~11
  ...Array.from({ length: 11 }, (_, i) => ({
    id: String(i + 1),
    name: `${i + 1}번`,
    gender: "M",
  })),
  // girls 51~59
  ...Array.from({ length: 9 }, (_, i) => ({
    id: String(51 + i),
    name: `${51 + i}번`,
    gender: "F",
  })),
];

// ====== 렌더링 ======
function render(dateStr) {
  const grid = document.getElementById("students-grid");
  const genderFilter = document.getElementById("gender-filter").value;
  const saved = loadFromLocalStorage(dateStr); // {id:{name,gender,status}}
  grid.innerHTML = "";

  const filtered = STUDENTS.filter(
    (s) => genderFilter === "all" || s.gender === genderFilter
  );

  filtered.forEach((s) => {
    const status = saved[s.id]?.status === "Y";
    const card = document.createElement("div");
    card.className = "student-card" + (status ? " checked" : "");
    card.dataset.id = s.id;

    card.innerHTML = `
      <div class="avatar">${s.gender === "M" ? "👦" : "👧"}</div>
      <div class="meta">
        <div class="name">${s.name}</div>
        <div class="sid">ID: ${s.id}</div>
      </div>
      <div class="badge">${status ? "마심" : "X"}</div>
    `;

    card.addEventListener("click", () => {
      const now = loadFromLocalStorage(dateStr);
      const cur = now[s.id] || { name: s.name, gender: s.gender, status: "N" };
      cur.status = cur.status === "Y" ? "N" : "Y";
      now[s.id] = cur;
      saveToLocalStorage(dateStr, now);
      render(dateStr);
      setStatus(`저장됨: ${s.name} → ${cur.status === "Y" ? "마심" : "X"}`);
    });

    grid.appendChild(card);
  });
}

// ====== 상태 메시지 ======
function setStatus(msg) {
  const el = document.getElementById("status-message");
  el.textContent = msg || "";
  if (!msg) return;
  setTimeout(() => (el.textContent = ""), 2000);
}

// ====== 초기화 ======
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date-input");
  const genderSel = document.getElementById("gender-filter");
  const toggleAllBtn = document.getElementById("toggle-all");
  const exportBtn = document.getElementById("export-csv");
  const importBtn = document.getElementById("import-csv-btn");
  const importInput = document.getElementById("import-csv-input");

  // 날짜 기본값(템플릿에 today가 없을 경우 대비)
  if (!dateInput.value) dateInput.value = todayStr();

  // 초기 렌더
  render(dateInput.value);

  // 날짜 변경 시 해당 날짜 데이터로 렌더/복원
  dateInput.addEventListener("change", () => render(dateInput.value));

  // 성별 필터
  genderSel.addEventListener("change", () => render(dateInput.value));

  // 모두 체크/해제 (토글)
  toggleAllBtn.addEventListener("click", () => {
    const dateStr = dateInput.value;
    const cur = loadFromLocalStorage(dateStr);
    const showing = Array.from(document.querySelectorAll(".student-card"));
    // 화면에 보이는 카드가 모두 Y면 모두 N으로, 아니면 모두 Y로
    const allChecked = showing.every((c) => c.classList.contains("checked"));
    showing.forEach((card) => {
      const id = card.dataset.id;
      const s = STUDENTS.find((x) => x.id === id);
      if (!s) return;
      cur[id] = {
        name: s.name,
        gender: s.gender,
        status: allChecked ? "N" : "Y",
      };
    });
    saveToLocalStorage(dateStr, cur);
    render(dateStr);
    setStatus(allChecked ? "전체 해제" : "전체 체크");
  });

  // CSV 내보내기
  exportBtn.addEventListener("click", () => {
    const dateStr = dateInput.value;
    if (!dateStr) return alert("날짜를 먼저 선택해 주세요.");
    exportCSVForDate(dateStr);
  });

  // CSV 불러오기
  importBtn.addEventListener("click", () => importInput.click());
  importInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dateStr = dateInput.value;
    if (!dateStr) {
      alert("CSV를 적용할 날짜를 먼저 선택해 주세요.");
      importInput.value = "";
      return;
    }
    importCSVToDate(file, dateStr, (ok) => {
      importInput.value = "";
      if (ok) render(dateStr);
    });
  });
});
