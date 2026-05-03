function addCss(fileName) {
    var head = document.head;
    var link = document.createElement("link");

    link.type = "text/css";
    link.rel = "stylesheet";

    // Resolves the relative path against the current JS file's URL
    link.href = new URL(fileName, import.meta.url).href;

    head.appendChild(link);
}

addCss("../css/custom-elements.css")


class TSdfButton extends HTMLElement {
    connectedCallback() {
        const content = this.getAttribute("content");
        const sdfClass = this.getAttribute("sdf-element-class");
        const negativeSdfClass = this.getAttribute("sdf-negative-class");
        const linkHref = this.getAttribute("link-href");

        const layerIdx = this.dataset.layerIndex ? this.dataset.layerIndex : "0";
        const renderLayers = this.dataset.renderLayers ? this.dataset.renderLayers : "0";

        this.innerHTML = `
            <sdf-box class="${sdfClass} sdf-push-button" data-layer-index=${layerIdx} data-render-layers=${renderLayers}>
                <a id="sdf-button-link" class="text" href="${linkHref}">${content}</a>
                <sdf-box id="sdf-button-negative" class="${negativeSdfClass} sdf-push-button-negative" data-layer-index="3" data-render-layers="1"></sdf-box>
            </sdf-box>
        `;

        const link = this.querySelector("#sdf-button-link");
        const negativeElement = this.querySelector("#sdf-button-negative");
        negativeElement.active = false;

        this.addEventListener("click", (e) => {
            if (!link || linkHref == "") {
                return;
            }

            const clickOnLink = e.target == link;

            if (!clickOnLink) {
                link.click();
            }
        });

        let releaseTimeout;

        const handlePress = () => {
            if (!negativeElement) return;

            clearTimeout(releaseTimeout);
            negativeElement.active = true;
        };

        const handleRelease = () => {
            if (!negativeElement) return;
            releaseTimeout = setTimeout(() => {
                negativeElement.active = false;
            }, 500);
        };

        this.addEventListener("mousedown", handlePress);
        this.addEventListener("mouseup", handleRelease);

        // Crucial: Handle case where user clicks down, drags mouse off the button, and releases
        this.addEventListener("mouseleave", handleRelease);

        // Touch events for mobile compatibility
        this.addEventListener("touchstart", handlePress, { passive: true });
        this.addEventListener("touchend", handleRelease);
        this.addEventListener("touchcancel", handleRelease);

    }
}

customElements.define("t-sdf-push-button", TSdfButton)

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
        `;
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
        `;
    }
}

customElements.define("t-timeline-entry", TTimelineEntry);

