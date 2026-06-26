let counter = document.querySelector(".count");
let add = document.querySelector(".add");
let subtract = document.querySelector(".subtract");
let count = 0;


add.addEventListener("click", () => {
    count++;
    counter.textContent = `${count}`;
})

subtract.addEventListener("click", () => {
    if (count > 0) {
        count--;
        counter.textContent = `${count}`;
    }
})