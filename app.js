const deductionsDiv = document.getElementById("deductions");
const incomeInput = document.getElementById("income");

const STORAGE_KEY = "salary_calculator_v1";

function addRow(name = "", amount = "", isPaid = false) {
  const row = document.createElement("div");
  row.className = "row";

  row.innerHTML = `
    <input type="text" placeholder="Expense name" value="${escapeHtml(name)}">
    <input type="number" placeholder="AED" value="${amount}">
    <div class="done ${isPaid ? "active" : ""}"></div>
  `;

  row.querySelector(".done").addEventListener("click", function () {
    this.classList.toggle("active");
    calculate();
    saveData();
  });

  row.querySelectorAll("input").forEach(input => {
    input.addEventListener("input", () => {
      calculate();
      saveData();
    });
  });

  deductionsDiv.appendChild(row);

  calculate();
  saveData();
}

incomeInput.addEventListener("input", () => {
  calculate();
  saveData();
});

function calculate() {
  let expected = 0;
  let paid = 0;

  document.querySelectorAll(".row").forEach(row => {
    const amount = Number(row.children[1].value) || 0;
    expected += amount;

    if (row.children[2].classList.contains("active")) {
      paid += amount;
    }
  });

  const income = Number(incomeInput.value) || 0;
  const balance = income - paid;

  document.getElementById("expected").innerText = `AED ${expected}`;
  document.getElementById("paid").innerText = `AED ${paid}`;
  document.getElementById("balance").innerText = `AED ${balance}`;
}

function saveData() {
  const data = {
    income: incomeInput.value || "",
    deductions: []
  };

  document.querySelectorAll(".row").forEach(row => {
    const name = row.children[0].value || "";
    const amount = row.children[1].value || "";
    const isPaid = row.children[2].classList.contains("active");
    data.deductions.push({ name, amount, isPaid });
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    // start with one empty row for convenience
    addRow();
    return;
  }

  try {
    const data = JSON.parse(raw);

    incomeInput.value = data.income || "";
    deductionsDiv.innerHTML = "";

    if (Array.isArray(data.deductions) && data.deductions.length > 0) {
      data.deductions.forEach(d => addRow(d.name, d.amount, d.isPaid));
    } else {
      addRow();
    }

    calculate();
  } catch (e) {
    deductionsDiv.innerHTML = "";
    addRow();
  }
}

// Simple HTML escape to avoid breaking the input value attribute
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("load", loadData);

// keep your old HTML button working
window.addRow = addRow;
