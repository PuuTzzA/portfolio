const toggleHeaderButton = document.getElementById("toggle-header");
const toggleThemeButton = document.getElementById("toggle-theme");
const header = document.getElementById("header-link-container");
const headerButtons = document.getElementsByClassName("header-button");
const appearanceButtons = [
    document.getElementById("toggle-3d"),
    document.getElementById("toggle-theme"),
];

toggleHeaderButton.addEventListener("click", toggleHeader);

function toggleHeader() {
    setHeader(toggleHeaderButton.content != "close");
}

function setHeader(visible) {
    toggleHeaderButton.content = visible ? "close" : "menu";

    for (let i = 0; i < headerButtons.length; i++) {
        headerButtons[i].setActive(visible);
    }

    for (let i = 0; i < appearanceButtons.length; i++) {
        if (visible) {
            appearanceButtons[i].classList.remove("display-none");
        } else {
            appearanceButtons[i].classList.add("display-none");
        }
    }

    if (visible) {
        header.classList.add("show-header");
        header.classList.remove("hide-header");
    } else {
        header.classList.remove("show-header");
        header.classList.add("hide-header");
    }
}

toggleThemeButton.addEventListener("click", () => {
    toggleThemeButton.content = toggleThemeButton.content == "light_mode" ? "dark_mode" : "light_mode";
    document.body.classList.toggle("light-theme");
})

// Define the media query
const mediaQuery = window.matchMedia("(max-width: 420px)");

// Function to handle the change
function handleDeviceChange(e) {
    setHeader(!e.matches)
}

// Listen for changes
mediaQuery.addEventListener("change", handleDeviceChange);

// Run it once on page load to set the initial state
handleDeviceChange(mediaQuery);

function isMobilePhone() {
    // 1. Try the modern Client Hints API first (Fastest & most accurate)
    if (navigator.userAgentData) {
        return navigator.userAgentData.mobile;
    }

    // 2. Fallback to checking the user agent string (Older method)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Uses regex to look for common mobile device keywords
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
}

if (isMobilePhone()) {
    console.log("The user is definitely on a mobile device.");
} else {
    console.log("No mobile phone")
}