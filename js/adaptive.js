const toggleHeader = document.getElementById("toggle-header");
const header = document.getElementById("header-link-container");

toggleHeader.addEventListener("click", () => {
    console.log(toggleHeader.innerHTML)
    toggleHeader.innerHTML = toggleHeader.innerHTML.trim() == "close" ? "menu" : "close";
    console.log(toggleHeader.innerHTML)
    header.classList.toggle("show-header");
    header.classList.toggle("hide-header");
});

// Define the media query
const mediaQuery = window.matchMedia("(max-width: 800px)");

// Function to handle the change
function handleDeviceChange(e) {
    if (e.matches) {
        header.classList.remove("show-header");
        header.classList.add("hide-header");
    } else {
        header.classList.add("show-header");
        header.classList.remove("hide-header");
    }
}

// Listen for changes
mediaQuery.addEventListener("change", handleDeviceChange);

// Run it once on page load to set the initial state
handleDeviceChange(mediaQuery);

document.addEventListener("click", (e) => {
    console.log(e.target)
})

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