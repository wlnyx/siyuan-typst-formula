/*
 * siyuan-typst-formula
 * Type Typst math in SiYuan formula panel, auto-convert to LaTeX.
 */

import { Plugin } from "siyuan";
import { typst2tex } from "tex2typst";

const TOGGLE_CLASS = "typst-formula-toggle";
const LABEL_CLASS = "tf-label";
const ACTIVE_CLASS = "tf-active";
const PROXY_ATTR = "data-tf-proxied";
const STORAGE_KEY = "typst-formula-mode";

function getSavedMode(): "latex" | "typst" {
  return (localStorage.getItem(STORAGE_KEY) as "latex" | "typst") || "latex";
}
function saveMode(mode: "latex" | "typst") {
  localStorage.setItem(STORAGE_KEY, mode);
}

// ── Plugin ─────────────────────────────────────────────────────────────
export default class TypstFormulaPlugin extends Plugin {
  private onBlockOpen: (e: CustomEvent) => void;

  async onload() {
    this.onBlockOpen = () => {
      // Retry a few times — panel may not be in DOM yet
      this.tryInject(0);
    };
    this.eventBus.on("open-noneditableblock", this.onBlockOpen);

    // Inject CSS once
    const style = document.createElement("style");
    style.textContent = `
      .${TOGGLE_CLASS} { font-size:12px; cursor:pointer; user-select:none; margin-left:8px; white-space:nowrap; }
      .${TOGGLE_CLASS} .${LABEL_CLASS} { opacity:0.4; }
      .${TOGGLE_CLASS} .${LABEL_CLASS}.${ACTIVE_CLASS} { opacity:1; font-weight:bold; }
    `;
    document.head.appendChild(style);
  }

  async onunload() {
    this.eventBus.off("open-noneditableblock", this.onBlockOpen);
  }

  // ── Retry injection until panel is ready ───────────────────────────
  private tryInject(retry: number) {
    const panel = document.querySelector(".protyle-util") as HTMLElement | null;
    if (!panel) {
      if (retry < 10) setTimeout(() => this.tryInject(retry + 1), 80);
      return;
    }

    const textarea = panel.querySelector("textarea") as HTMLTextAreaElement | null;
    if (!textarea) {
      if (retry < 10) setTimeout(() => this.tryInject(retry + 1), 80);
      return;
    }

    this.inject(panel, textarea);
  }

  // ── Inject toggle + proxy ─────────────────────────────────────────
  private inject(panel: HTMLElement, textarea: HTMLTextAreaElement) {
    // ── Toggle UI ──────────────────────────────────────────────────
    let toggle = panel.querySelector(`.${TOGGLE_CLASS}`) as HTMLElement | null;

    if (!toggle) {
      const saved = getSavedMode();
      toggle = document.createElement("span");
      toggle.className = TOGGLE_CLASS;
      toggle.innerHTML = [
        `<span class="${LABEL_CLASS}${saved === 'latex' ? ' ' + ACTIVE_CLASS : ''}" data-tf-mode="latex">LaTeX</span>`,
        `<span class="${LABEL_CLASS}${saved === 'typst' ? ' ' + ACTIVE_CLASS : ''}" data-tf-mode="typst">Typst</span>`,
      ].join(" | ");

      toggle.addEventListener("click", (e) => {
        const span = (e.target as HTMLElement).closest(`.${LABEL_CLASS}`);
        if (!span) return;
        const mode = span.getAttribute("data-tf-mode") as "latex" | "typst";
        toggle!.querySelectorAll(`.${LABEL_CLASS}`).forEach((s) => s.classList.remove(ACTIVE_CLASS));
        span.classList.add(ACTIVE_CLASS);
        panel.setAttribute("data-tf-mode", mode);
        saveMode(mode);
      });

      // Place toggle after textarea
      textarea.insertAdjacentElement("afterend", toggle);
    } else {
      // Existing toggle — ensure it's after current textarea
      if (toggle.previousElementSibling !== textarea) {
        textarea.insertAdjacentElement("afterend", toggle);
      }
    }

    panel.setAttribute("data-tf-mode", panel.getAttribute("data-tf-mode") || getSavedMode());

    // ── Value proxy ────────────────────────────────────────────────
    if (textarea.hasAttribute(PROXY_ATTR)) return;

    const origDesc = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )!;

    Object.defineProperty(textarea, "value", {
      get() {
        const raw = origDesc.get!.call(textarea);
        if (panel.getAttribute("data-tf-mode") !== "typst") return raw;
        try {
          return typst2tex(raw) || raw;
        } catch {
          return raw;
        }
      },
      set(v: string) {
        origDesc.set!.call(textarea, v);
      },
      configurable: true,
    });

    textarea.setAttribute(PROXY_ATTR, "1");
  }
}
