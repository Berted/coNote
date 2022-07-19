import { EditorView, showTooltip } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import { addCursor, remCursor } from "./cursorStateEffects";
import "./cursorTooltipFonts.css";

interface CursorData {
  uid: string;
  name: string;
  color: string;
  pos: number;
}

// Styling heavily inspirsed from Chakra UI's Tooltip theming.
const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-other-cursor-content": {
    height: "1.3em",
    fontFamily: "monospace",
    padding: "2px 4px",
    left: "-4px",
    border: "0px",
    zIndex: "4000",
    backgroundColor: "transparent",
  },
  ".cm-tooltip.cm-other-cursor-content .cm-other-cursor-element": {
    height: "1.3em",
    width: "0",
    position: "absolute",
    fontFamily: "monospace",
    borderRight: "0px",
    borderTop: "0px",
    borderBottom: "0px",
    borderLeft: "2px solid",
    top: "0px",
    left: "3px",
    zIndex: "4000",
  },
  ".cm-tooltip.cm-other-cursor-content .cm-other-cursor-tooltip": {
    position: "absolute",
    whiteSpace: "nowrap",
    maxWidth: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    padding: "2px 8px",
    borderRadius: "2px",
    boxShadow:
      "rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px",
    top: "-21px",
    left: "3px",
    color: "rgba(255, 255, 255, 0.92)",
    fontFamily: "'Inter', sans-serif",
    fontWeight: "500",
    fontFeatureSettings: "kern",
    textRendering: "optimizelegibility",
    WebkiteFontSmoothing: "antialiased",
    lineHeight: "21px",
    textSizeAdjust: "100%",
    opacity: "1.0",
    fontSize: "12px",
    zIndex: "4000",
    transition: "opacity 0.15s ease-out",
    WebkitTransition: "opacity 0.15s ease-out",
    MozTransition: "opacity 0.15s ease-out",
    MsTransition: "opacity 0.15s ease-out",
    OTransition: "opacity 0.15s ease-out",
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "-moz-none",
    KhtmlUserSelect: "none",
    OUserSelect: "none",
  },
});

const cursorField = (uid: string | undefined) => {
  return StateField.define<CursorData[]>({
    create() {
      let ret: CursorData[] = [];
      return ret;
    },
    update(cursors, tr) {
      let ret: CursorData[] = cursors;
      for (let e of tr.effects) {
        if (e.is(addCursor)) {
          if (e.value.uid === uid) continue;
          ret = [
            ...cursors,
            {
              uid: e.value.uid,
              name: e.value.name,
              color: e.value.color,
              pos: e.value.to,
            },
          ];
        } else if (e.is(remCursor)) {
          if (e.value.uid === uid) continue;
          ret = cursors.filter((val) => val.uid !== e.value.uid);
        }
      }
      return ret;
    },
    provide: (f) => {
      return showTooltip.computeN([f], (state) => {
        return state.field(f).map((x) => {
          return {
            pos: x.pos,
            create: () => {
              let dom = document.createElement("div");
              dom.className = "cm-other-cursor-content";
              dom.id = "cm-other-cursor-content-" + x.uid;

              let cursor = document.createElement("div");
              cursor.className = "cm-other-cursor-element";
              cursor.id = "cm-other-cursor-element-" + x.uid;
              cursor.style.borderLeftColor = x.color;
              dom.appendChild(cursor);

              let tooltip = document.createElement("div");
              let isFirstLine: boolean = state.doc.lineAt(x.pos).number === 1;
              tooltip.className = "cm-other-cursor-tooltip";
              tooltip.textContent = x.name;
              tooltip.style.backgroundColor = x.color;
              tooltip.style.opacity = "0.0";
              tooltip.style.visibility = "hidden";
              if (isFirstLine) tooltip.style.top = "13px";
              dom.appendChild(tooltip);

              let tooltipTimeout: ReturnType<typeof setTimeout> | undefined =
                undefined;

              dom.addEventListener("mouseenter", () => {
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                  tooltipTimeout = undefined;
                }
                tooltipTimeout = setTimeout(() => {
                  tooltip.style.visibility = "visible";
                  tooltip.style.opacity = "1.0";
                }, 500);
              });

              dom.addEventListener("mouseleave", () => {
                if (tooltipTimeout) {
                  clearTimeout(tooltipTimeout);
                  tooltipTimeout = undefined;
                }
                tooltipTimeout = setTimeout(() => {
                  tooltip.style.opacity = "0.0";
                  // Note: This timeout must follow the transition timeout!
                  setTimeout(() => {
                    tooltip.style.visibility = "hidden";
                  }, 150);
                }, 750);
              });

              let offset = { x: -4, y: -16.8 };
              return { dom, offset };
            },
          };
        });
      });
    },
  });
};

export default function cursorPlugin(uid: string | undefined) {
  return [cursorField(uid), cursorTooltipBaseTheme];
}
