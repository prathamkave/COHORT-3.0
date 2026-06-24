const toggleFormBtn = document.getElementById("toggleFormBtn");
const submitTaskBtn = document.getElementById("submitTaskBtn");
const taskForm = document.getElementById("taskForm");
const inputTitle = document.getElementById("inputTitle");
const inputCategory = document.getElementById("inputCategory");
const inputPriority = document.getElementById("inputPriority");
const tasksContainer = document.getElementById("tasksContainer");
const emptyBoard = document.getElementById("emptyBoard");

const valTotal = document.getElementById("valTotal");
const valPending = document.getElementById("valPending");
const valDone = document.getElementById("valDone");

const themeToggle = document.getElementById("themeToggle");

let tasks = [];

toggleFormBtn.addEventListener("click", () => {
    taskForm.classList.toggle("hidden");
});


submitTaskBtn.addEventListener("click", (e) => {
    e.preventDefault();
    
    const title = inputTitle.value.trim();
    if (!title) {
        alert("Please enter a task title");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        category: inputCategory.value,
        priority: inputPriority.value,
        completed: false
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();

    inputTitle.value = "";
    taskForm.classList.add("hidden");
});


function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
}


function toggleComplete(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    saveTasks();
    renderTasks();
}

function loadTasks() {
    const saved = localStorage.getItem("my_tasks");
    if (saved) {
        tasks = JSON.parse(saved);
    }
}

function saveTasks() {
    localStorage.setItem("my_tasks", JSON.stringify(tasks));
}


function updateCounts() {
    const total = tasks.length;
    const done = tasks.filter(t => t.completed).length;
    const pending = total - done;

    valTotal.textContent = total;
    valPending.textContent = pending;
    valDone.textContent = done;
}


function createTaskElement(task) {
    const item = document.createElement("div");
    item.className = `task-item ${task.completed ? "completed" : ""}`;

    const left = document.createElement("div");
    left.className = "task-left";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleComplete(task.id));

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("div");
    title.className = "task-title";
    title.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    
    const prioClass = task.priority === "High" ? "badge-high" : "";
    meta.innerHTML = `${task.category} &bull; <span class="${prioClass}">${task.priority} Priority</span>`;

    details.appendChild(title);
    details.appendChild(meta);
    
    left.appendChild(checkbox);
    left.appendChild(details);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-small btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    item.appendChild(left);
    item.appendChild(deleteBtn);

    return item;
}

function renderTasks() {
    tasksContainer.innerHTML = "";

    if (tasks.length === 0) {
        emptyBoard.style.display = "block";
    } else {
        emptyBoard.style.display = "none";
        tasks.forEach(task => {
            const el = createTaskElement(task);
            tasksContainer.appendChild(el);
        });
    }
    updateCounts();
}

themeToggle.addEventListener("change", () => {
    if (themeToggle.checked) {
        document.body.classList.add("light-mode");
        localStorage.setItem("my_theme", "light");
    } else {
        document.body.classList.remove("light-mode");
        localStorage.setItem("my_theme", "dark");
    }
});

function loadTheme() {
    const savedTheme = localStorage.getItem("my_theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        themeToggle.checked = true;
    } else {
        document.body.classList.remove("light-mode");
        themeToggle.checked = false;
    }
}

loadTheme();
loadTasks();
renderTasks();