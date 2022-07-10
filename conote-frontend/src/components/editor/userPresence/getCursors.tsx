import { EditorView, Decoration } from "@codemirror/view";
import CursorWidget from "./CursorWidget";

export default function getCursors(uid: string, userPresence: any) {
  let widgets = [];
  for (let x in userPresence) {
    if (x === uid) continue;
    let deco = Decoration.widget({
      widget: new CursorWidget(userPresence[x].name, userPresence[x].color),
    });
    widgets.push(deco.range(userPresence[x].to));
  }
  return Decoration.set(widgets);
}
