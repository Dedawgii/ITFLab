/* ============================================================
   Profile Card · To-Do List  —  script.js
   เชื่อมการทำงานกับ index.html โดยอ้างอิง ID จากช่องพิมพ์และปุ่มกด
   - #todoInput  : ช่องพิมพ์ข้อความ
   - #addBtn     : ปุ่ม "เพิ่ม"
   - #todoList   : รายการ To-Do
   - #todoCounter: ตัวนับจำนวนรายการ
   ============================================================ */

(function () {
  "use strict";

  /* ---------- คีย์เก็บข้อมูลใน Local Storage ---------- */
  const STORAGE_KEY = "todo_tasks";

  /* ---------- อ้างอิง element จาก index.html ---------- */
  const inputEl = document.getElementById("todoInput");
  const addBtn = document.getElementById("addBtn");
  const listEl = document.getElementById("todoList");
  const counterEl = document.getElementById("todoCounter");

  if (!inputEl || !addBtn || !listEl) return;

  /* ---------- รายการทั้งหมด : [{ text, done }] ---------- */
  let tasks = [];

  /* ============================================================
     1) อ่าน / เขียน Local Storage
     ============================================================ */
  function loadTasks() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === null) return null;              // ยังไม่เคยบันทึก
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed
        .map((t) => ({
          text: String(t && t.text != null ? t.text : "").trim(),
          done: Boolean(t && t.done)
        }))
        .filter((t) => t.text !== "");
    } catch (err) {
      return null;
    }
  }

  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      /* โหมดส่วนตัวของเบราว์เซอร์อาจใช้ localStorage ไม่ได้ — ข้ามไป */
    }
  }

  /* ============================================================
     2) ดึงรายการตั้งต้นที่เขียนไว้ใน HTML (ใช้ครั้งแรกที่ยังไม่มีข้อมูลใน storage)
     ============================================================ */
  function seedFromHtml() {
    const seeded = [];
    listEl.querySelectorAll("li").forEach((li) => {
      const textEl = li.querySelector(".todoText");
      const checkEl = li.querySelector('input[type="checkbox"]');
      const text = textEl ? textEl.textContent.trim() : "";
      if (text === "") return;
      seeded.push({ text: text, done: Boolean(checkEl && checkEl.checked) });
    });
    return seeded;
  }

  /* ============================================================
     3) สร้าง <li> ใหม่ (ใช้ class เดิมของดีไซน์ ไม่แตะ CSS)
     ============================================================ */
  function createLi(task, index) {
    const li = document.createElement("li");
    li.id = "todo-item-" + (index + 1);
    li.dataset.index = String(index);

    const label = document.createElement("label");
    label.setAttribute("for", "todo-check-" + (index + 1));

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "todo-check-" + (index + 1);
    checkbox.checked = Boolean(task.done);

    const box = document.createElement("span");
    box.className = "box";
    box.textContent = "✔";

    const text = document.createElement("span");
    text.className = "todoText";
    text.textContent = task.text;

    label.appendChild(checkbox);
    label.appendChild(box);
    label.appendChild(text);
    li.appendChild(label);

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "delBtn";
    delBtn.title = "ลบรายการ";
    delBtn.setAttribute("aria-label", "ลบรายการ " + task.text);
    delBtn.textContent = "×";
    li.appendChild(delBtn);

    return li;
  }

  /* ============================================================
     4) วาดรายการทั้งหมดลงหน้าเว็บ + อัปเดตตัวนับ
     ============================================================ */
  function render() {
    listEl.innerHTML = "";
    tasks.forEach((task, index) => {
      listEl.appendChild(createLi(task, index));
    });
    updateCounter();
  }

  function updateCounter() {
    if (!counterEl) return;
    const doneCount = tasks.filter((t) => t.done).length;
    counterEl.textContent = "ทั้งหมด " + tasks.length + " รายการ · เสร็จแล้ว " + doneCount;
  }

  /* ============================================================
     5) เพิ่มรายการใหม่
     ============================================================ */
  function addTask() {
    const text = inputEl.value.trim();
    if (text === "") {
      inputEl.focus();
      return;
    }

    tasks.push({ text: text, done: false });
    saveTasks();
    render();

    inputEl.value = "";
    inputEl.focus();
  }

  /* ============================================================
     6) เชื่อม event
     ============================================================ */
  addBtn.addEventListener("click", addTask);

  /* กด Enter ในช่องพิมพ์ก็เพิ่มรายการได้ */
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTask();
    }
  });

  /* ลบรายการ : คลิกปุ่ม .delBtn ในรายการใดก็ได้ */
  listEl.addEventListener("click", function (e) {
    const delBtn = e.target.closest(".delBtn");
    if (!delBtn) return;

    const li = delBtn.closest("li");
    const index = Number(li.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= tasks.length) return;

    tasks.splice(index, 1);
    saveTasks();
    render();
  });

  /* ติ๊กเครื่องหมายถูก = งานเสร็จ (บันทึกสถานะไว้ด้วย) */
  listEl.addEventListener("change", function (e) {
    if (!e.target.matches('input[type="checkbox"]')) return;

    const li = e.target.closest("li");
    const index = Number(li.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= tasks.length) return;

    tasks[index].done = e.target.checked;
    saveTasks();
    updateCounter();
  });

  /* ============================================================
     7) เริ่มต้น : ดึงข้อมูลเดิมกลับมาแสดง (ถ้ายังไม่มีให้ใช้รายการใน HTML)
     ============================================================ */
  function init() {
    const saved = loadTasks();
    tasks = saved !== null ? saved : seedFromHtml();
    saveTasks();
    render();
  }

  init();
})();
