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

class TIconButton extends HTMLElement {
    #content;
    #id;

    connectedCallback() {
        this.#id = this.getAttribute("id");
        this.#content = this.getAttribute("content");

        this.innerHTML = TIconButton.generateInnerHtml(this.#id, this.#content);
    }

    get content() {
        return this.#content;
    }

    set content(val) {
        this.#content = val;
        this.innerHTML = TIconButton.generateInnerHtml(this.#id, val);
    }

    static generateInnerHtml(id, content) {
        return `<button id="${id}" class="button-icon material-symbols-rounded">${content}</button>`;
    }
}

customElements.define("t-icon-button", TIconButton);

class TSdfButton extends HTMLElement {
    #sdfElement;
    #negativeSdfElement;
    #releaseTimeout;

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
        this.#sdfElement = this.querySelector(".sdf-push-button");
        this.#negativeSdfElement = this.querySelector("#sdf-button-negative");
        this.#negativeSdfElement.active = false;

        this.addEventListener("click", (e) => {
            if (!link || linkHref == "") {
                return;
            }

            const clickOnLink = e.target == link;

            if (!clickOnLink) {
                link.click();
            }
        });

        const handlePress = (e) => {
            if (!this.#negativeSdfElement) return;

            clearTimeout(this.#releaseTimeout);
            this.#negativeSdfElement.active = true;

            if (e.type === "mousedown") {
                document.addEventListener("mouseup", handleRelease);
            }
        };

        const handleRelease = () => {
            if (!this.#negativeSdfElement) return;
            this.#releaseTimeout = setTimeout(() => {
                this.#negativeSdfElement.active = false;
            }, 200);
        };

        this.addEventListener("mousedown", handlePress);
        // this.addEventListener("mouseup", handleRelease);

        // Touch events for mobile compatibility
        this.addEventListener("touchstart", handlePress, { passive: true });
        this.addEventListener("touchend", handleRelease);
        this.addEventListener("touchcancel", handleRelease);
    }

    setActive(active) {
        if (!this.#sdfElement || !this.#negativeSdfElement) {
            return;
        }

        clearTimeout(this.#releaseTimeout);
        this.#releaseTimeout = setTimeout(() => {
            if (!active) {
                this.#sdfElement.active = false;
            }
        }, 200);

        if (active) {
            this.#sdfElement.active = true;
            this.#sdfElement.classList.remove("sdf-push-button-hidden");

        } else {
            this.#sdfElement.classList.add("sdf-push-button-hidden");

            this.#negativeSdfElement.active = false;
        }

    }

    setSelected(selected) {
        if (!this.#sdfElement) {
            return;
        }

        if (selected) {
            this.#sdfElement.classList.add("selected");
        } else {
            this.#sdfElement.classList.remove("selected");
        }
    }
}

customElements.define("t-sdf-push-button", TSdfButton)

class TSpanWithIcon extends HTMLElement {
    connectedCallback() {
        const title = this.getAttribute("title");
        const icon = this.getAttribute("icon");
        const content = this.getAttribute("content");
        const spaceBetween = this.getAttribute("space-between");
        const contentClass = this.getAttribute("content-class");

        this.innerHTML = `
            <span class="span-with-icon ${spaceBetween == "true" ? "span-with-icon-between" : ""}">
                ${title != "" ? "<span class=\"span-with-icon-title text\">" + title + "</span>" : ""}
                <span class="span-with-icon-content">
                    <span class="material-symbols-rounded text-muted">${icon}</span>
                    <span class="text-muted ${contentClass}">${content}</span>
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
        const fromYear = this.getAttribute("from-year");
        const toYear = this.getAttribute("to-year");
        const fromMonth = this.getAttribute("from-month");
        const toMonth = this.getAttribute("to-month");

        const content = this.innerHTML;

        this.innerHTML = `
            <div class="timeline-date text">
                <div class="timeline-date-group">
                    <span class="text-muted">${toMonth}</span> ${toYear}
                </div>
                <div class="timeline-date-group">
                    <span class="text-muted">${fromMonth}</span> ${fromYear}
                </div>
            </div>
            <div class="timeline-dot"></div>
            <div class="timeline-card text">
                <t-span-with-icon title="${title}" icon="location_on"
                    content="${location}" space-between="true" content-class="timeline-location-text"></t-span-with-icon>
                <div class="text-muted">${content}</div>
            </div>
        `;
    }
}

customElements.define("t-timeline-entry", TTimelineEntry);

