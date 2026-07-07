function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

function loadState(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const htmlElement = document.documentElement;
const bodyElement = document.body;
const themeToggleBtn = document.getElementById("theme-toggle");
const iconLight = document.getElementById("theme-icon-light");
const iconDark = document.getElementById("theme-icon-dark");

function applyTheme(theme) {
  if (theme === "dark") {
    htmlElement.classList.add("dark");
    bodyElement.classList.remove("theme-light");
    bodyElement.classList.add("theme-dark");
    iconLight.classList.add("hidden");
    iconDark.classList.remove("hidden");
  } else {
    htmlElement.classList.remove("dark");
    bodyElement.classList.remove("theme-dark");
    bodyElement.classList.add("theme-light");
    iconDark.classList.add("hidden");
    iconLight.classList.remove("hidden");
  }
}

applyTheme(loadState("pd-theme", "light"));

themeToggleBtn.addEventListener("click", () => {
  const next = htmlElement.classList.contains("dark") ? "light" : "dark";
  applyTheme(next);
  saveState("pd-theme", next);
});

const VIEWS = {
  dashboard: { el: document.getElementById("dashboard-view"), display: "grid" },
  "todo-view": { el: document.getElementById("todo-view"), display: "flex" },
  "planner-view": {
    el: document.getElementById("planner-view"),
    display: "flex",
  },
  "goals-view": { el: document.getElementById("goals-view"), display: "flex" },
  "pomodoro-view": {
    el: document.getElementById("pomodoro-view"),
    display: "flex",
  },
  "quote-view": { el: document.getElementById("quote-view"), display: "flex" },
};

function showView(name) {
  Object.entries(VIEWS).forEach(([key, { el, display }]) => {
    if (!el) return;
    el.style.display = key === name ? display : "none";
  });
}

document.querySelectorAll(".feature-card[data-view]").forEach((card) => {
  card.addEventListener("click", () => showView(card.dataset.view));
});

document.querySelectorAll("[data-back]").forEach((btn) => {
  btn.addEventListener("click", () => showView("dashboard"));
});

showView("dashboard");

(function initTodoList() {
  const taskInput = document.getElementById("todo-task-input");
  const detailsInput = document.getElementById("todo-details-input");
  const importantInput = document.getElementById("todo-important-input");
  const addBtn = document.getElementById("todo-add-btn");
  const list = document.getElementById("todo-list");
  const emptyMsg = document.getElementById("todo-empty-msg");

  let tasks = loadState("pd-tasks", []);

  function persist() {
    saveState("pd-tasks", tasks);
  }

  function render() {
    list.innerHTML = "";
    emptyMsg.style.display = tasks.length === 0 ? "block" : "none";

    tasks.forEach((task) => {
      const item = document.createElement("div");
      item.className = "flex items-start justify-between gap-3";

      item.innerHTML = `
  <div class="flex-1 bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/10 rounded-2xl p-4 transition-all ${
    task.completed ? "opacity-50" : ""
  }">

    <div class="flex items-start justify-between gap-3">

      <span class="font-semibold text-glass-strong ${
        task.completed ? "line-through" : ""
      }">
        ${task.important ? "⭐ " : ""}${escapeHtml(task.name)}
      </span>

      <button
        data-action="complete"
        ${task.completed ? "disabled" : ""}
        class="text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0 ${
          task.completed
            ? "bg-emerald-500/90 text-white cursor-not-allowed"
            : "bg-emerald-500/80 hover:bg-emerald-500 text-white"
        }"
      >
        ${task.completed ? "Completed" : "Mark as Completed"}
      </button>

    </div>

    ${
      task.details
        ? `<p class="text-sm text-slate-600 dark:text-slate-300 mt-2 ${
            task.completed ? "line-through" : ""
          }">
            ${escapeHtml(task.details)}
          </p>`
        : ""
    }

  </div>

  <button
    data-action="delete"
    class="w-10 h-10 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center transition-all shrink-0 self-center"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 7H5M10 11V17M14 11V17M6 7L7 19C7.1 20.1 7.9 21 9 21H15C16.1 21 16.9 20.1 17 19L18 7M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7"
      />
    </svg>
  </button>
`;

      const completeBtn = item.querySelector('[data-action="complete"]');
      if (!task.completed) {
        completeBtn.addEventListener("click", () => {
          task.completed = true;
          persist();
          render();
        });
      }

      item
        .querySelector('[data-action="delete"]')
        .addEventListener("click", () => {
          tasks = tasks.filter((t) => t.id !== task.id);
          persist();
          render();
        });

      list.appendChild(item);
    });
  }

  addBtn.addEventListener("click", () => {
    const name = taskInput.value.trim();
    if (!name) return;

    tasks.push({
      id: Date.now(),
      name,
      details: detailsInput.value.trim(),
      important: importantInput.checked,
      completed: false,
    });

    taskInput.value = "";
    detailsInput.value = "";
    importantInput.checked = false;
    persist();
    render();
  });

  render();
})();

(function initPlanner() {
  const grid = document.getElementById("planner-grid");
  const editBtn = document.getElementById("planner-edit-btn");
  let isEditing = false;

  const labels = [];
  for (let h = 6; h < 24; h++) {
    const start = h + ":00"; 
    const end = (h + 1) + ":00";
    labels.push(`${start} - ${end}`);
  }

  let values = loadState("pd-planner", labels.map(() => ""));
  if (values.length !== labels.length) {
    values = labels.map(() => "");
  }

  labels.forEach((label, i) => {
    const block = document.createElement("div");
    block.className = "glass-metric !items-stretch !text-left p-3 gap-1 flex flex-col bg-white/40 dark:bg-black/20 border border-white/30 dark:border-white/10 rounded-xl transition-all";
    
    block.innerHTML = `
      <span class="text-xs font-bold text-slate-800 dark:text-slate-300 ml-1 opacity-80">${label}</span>
      <input type="text" data-index="${i}" placeholder="..." 
            class="glass-input !bg-transparent !border-none !shadow-none !p-1 text-sm outline-none w-full text-glass-strong placeholder-slate-700 dark:placeholder-slate-500 transition-all" 
            value="${escapeHtml(values[i] || "")}" readonly />
    `;
    
    const input = block.querySelector("input");
    
    input.addEventListener("input", () => {
      values[i] = input.value;
      saveState("pd-planner", values); 
    });
    
    grid.appendChild(block);
  });

  const inputs = grid.querySelectorAll("input");

  editBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    
    if (isEditing) {
      editBtn.textContent = "Save Plan";
      editBtn.classList.replace("bg-indigo-500/80", "bg-emerald-500/80");
      editBtn.classList.replace("hover:bg-indigo-500", "hover:bg-emerald-500");
      
      inputs.forEach(input => {
        input.removeAttribute("readonly");
        input.classList.add("bg-white/30", "dark:bg-white/10", "rounded-md", "px-2");
        input.parentElement.classList.add("ring-2", "ring-indigo-400/50");
      });
      inputs[0].focus();
      
    } else {
      editBtn.textContent = "Edit Plan";
      editBtn.classList.replace("bg-emerald-500/80", "bg-indigo-500/80");
      editBtn.classList.replace("hover:bg-emerald-500", "hover:bg-indigo-500");
      
      inputs.forEach(input => {
        input.setAttribute("readonly", true);
        input.classList.remove("bg-white/30", "dark:bg-white/10", "rounded-md", "px-2");
        input.parentElement.classList.remove("ring-2", "ring-indigo-400/50");
      });
    }
  });
})();

(function initGoals() {
  const titleInput = document.getElementById("goal-title-input");
  const detailsInput = document.getElementById("goal-details-input");
  const addBtn = document.getElementById("goal-add-btn");
  const list = document.getElementById("goals-list");
  const emptyMsg = document.getElementById("goals-empty-msg");

  let goals = loadState("pd-goals", []);

  function persist() {
    saveState("pd-goals", goals);
  }

  function render() {
    list.innerHTML = "";
    emptyMsg.style.display = goals.length === 0 ? "block" : "none";

    goals.forEach((goal) => {
      const item = document.createElement("div");
      item.className =
        "flex items-center gap-3";

      item.innerHTML = `
  <div class="flex-1 bg-white/40 dark:bg-white/10 border border-white/40 dark:border-white/10 rounded-2xl p-4 transition-all ${
    goal.achieved ? "opacity-50" : ""
  }">

    <div class="flex items-start justify-between gap-3">

      <span class="font-semibold text-glass-strong ${
        goal.achieved ? "line-through" : ""
      }">
        ${escapeHtml(goal.title)}
      </span>

      <button
        data-action="achieve"
        ${goal.achieved ? "disabled" : ""}
        class="text-xs font-semibold px-3 py-1 rounded-full transition-all shrink-0 ${
          goal.achieved
            ? "bg-emerald-500/90 text-white cursor-not-allowed"
            : "bg-emerald-500/80 hover:bg-emerald-500 text-white"
        }"
      >
        ${goal.achieved ? "Achieved" : "Mark Achieved"}
      </button>

    </div>

    ${
      goal.details
        ? `<p class="text-sm text-slate-600 dark:text-slate-300 mt-2 ${
            goal.achieved ? "line-through" : ""
          }">
            ${escapeHtml(goal.details)}
          </p>`
        : ""
    }

  </div>

  <button
    data-action="delete"
    class="w-10 h-10 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white flex items-center justify-center transition-all shrink-0 self-center"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M19 7H5M10 11V17M14 11V17M6 7L7 19C7.1 20.1 7.9 21 9 21H15C16.1 21 16.9 20.1 17 19L18 7M9 7V5C9 3.9 9.9 3 11 3H13C14.1 3 15 3.9 15 5V7"
      />
    </svg>
  </button>
`;

      const achieveBtn = item.querySelector('[data-action="achieve"]');
      if (!goal.achieved) {
        achieveBtn.addEventListener("click", () => {
          goal.achieved = true;
          persist();
          render();
        });
      }

      item
        .querySelector('[data-action="delete"]')
        .addEventListener("click", () => {
          goals = goals.filter((g) => g.id !== goal.id);
          persist();
          render();
        });

      list.appendChild(item);
    });
  }

  addBtn.addEventListener("click", () => {
    const title = titleInput.value.trim();
    if (!title) return;

    goals.push({
      id: Date.now(),
      title,
      details: detailsInput.value.trim(),
      achieved: false,
    });

    titleInput.value = "";
    detailsInput.value = "";
    persist();
    render();
  });

  render();
})();

(function initPomodoro() {
  const display = document.getElementById("pomodoro-display");
  const startBtn = document.getElementById("pomodoro-start");
  const pauseBtn = document.getElementById("pomodoro-pause");
  const resetBtn = document.getElementById("pomodoro-reset");
  const modeButtons = document.querySelectorAll(".pomodoro-mode-btn");
  const slider = document.getElementById("pomodoro-slider");
  const sliderValue = document.getElementById("pomodoro-slider-value");

  const saved = loadState("pd-pomodoro", { mode: "work", minutes: 25 });

  let totalSeconds = saved.minutes * 60;
  let remaining = totalSeconds;
  let timerId = null;
  let currentMode = saved.mode;

  function updateDisplay() {
    const m = Math.floor(remaining / 60)
      .toString()
      .padStart(2, "0");
    const s = (remaining % 60).toString().padStart(2, "0");
    display.textContent = `${m}:${s}`;
  }

  function persist(minutes, mode) {
    saveState("pd-pomodoro", { minutes, mode });
  }

  function highlightMode(mode) {
    modeButtons.forEach((b) => {
      b.classList.remove("bg-white/60", "dark:bg-white/20");
      b.classList.add("opacity-70");
      if (b.dataset.mode === mode) {
        b.classList.remove("opacity-70");
        b.classList.add("bg-white/60", "dark:bg-white/20");
      }
    });
  }

  function setMinutes(minutes, mode) {
    clearInterval(timerId);
    timerId = null;
    currentMode = mode || currentMode;
    totalSeconds = minutes * 60;
    remaining = totalSeconds;
    slider.value = minutes;
    sliderValue.textContent = minutes;
    updateDisplay();
    highlightMode(currentMode);
    persist(minutes, currentMode);
  }

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () =>
      setMinutes(Number(btn.dataset.minutes), btn.dataset.mode),
    );
  });

  slider.addEventListener("input", () => {
    if (timerId) return;
    sliderValue.textContent = slider.value;
    setMinutes(Number(slider.value), currentMode);
  });

  startBtn.addEventListener("click", () => {
    if (timerId) return;
    slider.disabled = true;
    timerId = setInterval(() => {
      if (remaining <= 0) {
        clearInterval(timerId);
        timerId = null;
        slider.disabled = false;
        return;
      }
      remaining--;
      updateDisplay();
    }, 1000);
  });

  pauseBtn.addEventListener("click", () => {
    clearInterval(timerId);
    timerId = null;
    slider.disabled = false;
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerId);
    timerId = null;
    slider.disabled = false;
    remaining = totalSeconds;
    updateDisplay();
  });

  setMinutes(saved.minutes, saved.mode);
})();

(function initQuotes() {
  const fallbackQuotes = [
    {
      text: "All my life through, the new sights of nature made me rejoice like a child.",
      author: "Marie Curie",
    },
    {
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
    },
    {
      text: "Well done is better than well said.",
      author: "Benjamin Franklin",
    },
    {
      text: "It always seems impossible until it's done.",
      author: "Nelson Mandela",
    },
    {
      text: "Discipline is choosing between what you want now and what you want most.",
      author: "Abraham Lincoln",
    },
  ];

  const textEl = document.getElementById("quote-text");
  const authorEl = document.getElementById("quote-author");
  const newBtn = document.getElementById("quote-new-btn");

  function showQuote(text, author) {
    textEl.textContent = text;
    authorEl.textContent = `— ${author}`;
  }

  function showFallback() {
    const q = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    showQuote(q.text, q.author);
  }

  function fetchQuote() {
    textEl.textContent = "Loading...";
    authorEl.textContent = "";
    fetch("https://dummyjson.com/quotes/random")
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => showQuote(data.quote, data.author))
      .catch(() => showFallback());
  }

  newBtn.addEventListener("click", fetchQuote);
  fetchQuote();
})();

(function initDashboard() {
  const timeEl = document.getElementById("dash-time");
  const ampmEl = document.getElementById("dash-ampm");
  const dayEl = document.getElementById("dash-day");
  const dateEl = document.getElementById("dash-date");
  const greetingTitle = document.getElementById("dash-greeting-title");
  const greetingEmoji = document.getElementById("dash-greeting-emoji");

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;

    timeEl.textContent = `${hours}:${minutes}`;
    ampmEl.textContent = ampm;
    dayEl.textContent = dayNames[now.getDay()];
    dateEl.textContent = `${now.getDate()} ${monthNames[now.getMonth()]} ${now.getFullYear()}`;

    const h24 = now.getHours();
    if (h24 < 12) {
      greetingTitle.textContent = "Good Morning!";
      greetingEmoji.textContent = "☀️";
    } else if (h24 < 19) {
      greetingTitle.textContent = "Good Afternoon!";
      greetingEmoji.textContent = "🌤️";
    } else {
      greetingTitle.textContent = "Good Evening!";
      greetingEmoji.textContent = "🌙";
    }
    const isDaytime = h24 >= 6 && h24 < 19;
    setBackground(isDaytime);
  }

  updateClock();
  setInterval(updateClock, 1000);

  function setBackground(isDay) {
    bodyElement.style.backgroundImage = isDay
      ? "url('Assets/day.jpg')"
      : "url('Assets/night.jpg')";
  }

  function weatherInfo(code) {
    if (code === 0) return { icon: "☀️", desc: "Clear Sky" };
    if (code === 1 || code === 2) return { icon: "🌤️", desc: "Partly Cloudy" };
    if (code === 3) return { icon: "☁️", desc: "Overcast" };
    if (code === 45 || code === 48) return { icon: "🌫️", desc: "Foggy" };
    if (code >= 51 && code <= 57) return { icon: "🌦️", desc: "Drizzle" };
    if (code >= 61 && code <= 67) return { icon: "🌧️", desc: "Rainy" };
    if (code >= 71 && code <= 77) return { icon: "❄️", desc: "Snowy" };
    if (code >= 80 && code <= 82) return { icon: "🌦️", desc: "Rain Showers" };
    if (code >= 95) return { icon: "⛈️", desc: "Thunderstorm" };
    return { icon: "🌡️", desc: "Clear" };
  }

  function renderWeather(data, locationLabel) {
    const c = data.current;
    const info = weatherInfo(c.weather_code);
    document.getElementById("dash-weather-icon").textContent = info.icon;
    document.getElementById("dash-temp").textContent =
      `${Math.round(c.temperature_2m)}°`;
    document.getElementById("dash-desc").textContent = info.desc;
    document.getElementById("dash-humidity").textContent =
      `${Math.round(c.relative_humidity_2m)}%`;
    document.getElementById("dash-wind").textContent =
      `${Math.round(c.wind_speed_10m)} km/h`;
    document.getElementById("dash-feels").textContent =
      `${Math.round(c.apparent_temperature)}°`;
    document.getElementById("dash-location").textContent = locationLabel;
    setBackground(c.is_day === 1);
  }

  function locationFallback() {
    document.getElementById("dash-desc").textContent = "Unavailable";
    document.getElementById("dash-location").textContent =
      "Location unavailable";
  }

  function fetchWeather(lat, lon, locationLabel) {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day&timezone=auto`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => renderWeather(data, locationLabel))
      .catch(() => locationFallback());
  }

  function reverseGeocode(lat, lon) {
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("bad response");
        return res.json();
      })
      .then((data) => {
        const label = `${data.city || data.locality || "Unknown"}, ${data.countryName || ""}`;
        fetchWeather(lat, lon, label);
      })
      .catch(() => fetchWeather(lat, lon, "Your Location"));
  }

  function startLocation() {
    if (!navigator.geolocation) {
      reverseGeocode(19.076, 72.8777);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => reverseGeocode(pos.coords.latitude, pos.coords.longitude),
      () => reverseGeocode(19.076, 72.8777),
      { timeout: 8000 },
    );
  }

  startLocation();
})();