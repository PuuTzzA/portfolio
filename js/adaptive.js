const toggleHeader = document.getElementById("toggle-header");
const header = document.getElementById("header-link-container");

toggleHeader.addEventListener("click", () => {
    toggleHeader.innerHTML = toggleHeader.innerHTML === "close" ? "menu" : "close";
    header.classList.toggle("show-header");
    header.classList.toggle("hide-header");
});

window.addEventListener("resize", () => {
    if (window.innerWidth < 800) {
        header.classList.remove("show-header");
        header.classList.add("hide-header");
    } else {
        header.classList.add("show-header");
        header.classList.remove("hide-header");
    }
});


document.addEventListener("click", (e) => {
    console.log(e.target)
})