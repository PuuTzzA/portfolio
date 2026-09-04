const DISPLAY_NONE_CLASSNAME = "display-none";

// Header
const toggleHeaderButton = document.getElementById("toggle-header");
const toggleThemeButton = document.getElementById("toggle-theme");
const header = document.getElementById("header-link-container");
const headerButtons = document.getElementsByClassName("header-button");
const appearanceButtons = [
    document.getElementById("toggle-3d"),
    toggleThemeButton,
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
            appearanceButtons[i].classList.remove(DISPLAY_NONE_CLASSNAME);
        } else {
            appearanceButtons[i].classList.add(DISPLAY_NONE_CLASSNAME);
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

function onHeaderButtonClicked() {
    if (windowSizeSmall) {
        setHeader(false);
    }
}

for (let i = 0; i < headerButtons.length; i++) {
    headerButtons[i].addEventListener("click", onHeaderButtonClicked);
}

// Timeline
const timelineEducation = document.getElementById("timeline-content-education");
const timelineExperience = document.getElementById("timeline-content-experience");
const educationButton = document.getElementById("timeline-education-button");
const experienceButton = document.getElementById("timeline-experience-button");

educationButton.addEventListener("click", () => {
    console.log("LKASJDF");
    switchTimeline(true);
})

experienceButton.addEventListener("click", () => {
    switchTimeline(false);
})

let currentTimelineEducation = undefined;
function switchTimeline(shouldTimelineEducaiton) {
    if (shouldTimelineEducaiton == currentTimelineEducation) {
        return;
    }

    currentTimelineEducation = shouldTimelineEducaiton;

    if (currentTimelineEducation) {
        educationButton.setSelected(true);
        experienceButton.setSelected(false);

        timelineExperience.classList.remove("active");
        timelineExperience.classList.add("hidden");
        timelineEducation.classList.remove("hidden");
        timelineEducation.classList.add("active");
    } else {
        educationButton.setSelected(false);
        experienceButton.setSelected(true);

        timelineExperience.classList.remove("hidden");
        timelineExperience.classList.add("active");
        timelineEducation.classList.remove("active");
        timelineEducation.classList.add("hidden");
    }
}

switchTimeline(true);












// Media Queries
const mediaQuery = window.matchMedia("(max-width: 30em)");
let windowSizeSmall = undefined;

function handleDeviceChange(e) {
    windowSizeSmall = e.matches;
    setHeader(!e.matches)
}

mediaQuery.addEventListener("change", handleDeviceChange);

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