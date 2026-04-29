class TSpanWithIcon extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title");
        const icon = this.getAttribute("icon");
        const content = this.getAttribute("content");
        const spaceBetween = this.getAttribute("space-between");

        this.innerHTML = `
            <span class="span-with-icon ${spaceBetween == "true" ? "span-with-icon-between" : ""}">
                ${title != "" ? "<span class=\"span-with-icon-title text\">" + title + "</span>" : ""}
                <span class="span-with-icon-content">
                    <span class="material-symbols-rounded text-muted">${icon}</span>
                    <span class="text-muted">${content}</span>
                </span>
            </span>
        `
    }
}

customElements.define("t-span-with-icon", TSpanWithIcon);

class TTimelineEntry extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title");
        const location = this.getAttribute("location");
        const content = this.getAttribute("content");
        const fromYear = this.getAttribute("from-year");
        const toYear = this.getAttribute("to-year");
        const fromMonth = this.getAttribute("from-month");
        const toMonth = this.getAttribute("to-month");

        this.innerHTML = `
            <div class="timeline-date text">
                <div>
                    <span class="text-muted">${fromMonth}</span> ${fromYear}
                </div>
                <div>
                    <span class="text-muted">${toMonth}</span> ${toYear}
                </div>
            </div>
            <div class="timeline-dot"></div>
            <div class="timeline-card text">
                <t-span-with-icon title="${title}" icon="location_on"
                    content="${location}" space-between="true"></t-span-with-icon>
                <div class="text-muted">${content}</div>
            </div>
        `
    }
}

customElements.define("t-timeline-entry", TTimelineEntry);