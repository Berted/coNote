import { EditorView, WidgetType } from "@codemirror/view";
import "./cursor.css";

export default class CursorWidget extends WidgetType {
  constructor(
    readonly uid: string,
    readonly name: string,
    readonly color?: string
  ) {
    super();
  }

  eq(other: CursorWidget) {
    return this.uid === other.uid && this.color === other.color;
  }

  toDOM(view: EditorView) {
    let component = document.createElement("span");
    component.className = "cursor-element";
    component.setAttribute("aria-hidden", "false");
    if (this.color) component.style.borderLeftColor = this.color;
    return component;
  }

  // TODO: Might need to modify behaviour onHover.
  ignoreEvent() {
    return true;
  }
}
