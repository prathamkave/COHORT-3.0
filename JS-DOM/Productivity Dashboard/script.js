const themeToggleBtn = document.getElementById("theme-toggle");
const htmlElement = document.documentElement;
const bodyElement = document.body;
const iconLight = document.getElementById("theme-icon-light");
const iconDark = document.getElementById("theme-icon-dark");

themeToggleBtn.addEventListener("click", () => {
  htmlElement.classList.toggle("dark");

  if (htmlElement.classList.contains("dark")) {
    bodyElement.classList.replace("theme-light", "theme-dark");
    iconLight.classList.add("hidden");
    iconDark.classList.remove("hidden");
  } else {
    bodyElement.classList.replace("theme-dark", "theme-light");
    iconDark.classList.add("hidden");
    iconLight.classList.remove("hidden");
  }
});