import { EditorView, DecorationSet, Decoration } from "@codemirror/view";
import { StateField } from "@codemirror/state";
import cursorSelectionMark from "./cursorSelectionMark";
import { addCursor, remCursor } from "./cursorStateEffects";

const selectionBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-other-selection-element": {
    backgroundColor: "rgba(245, 148, 39, 0.4)",
  },
});

const selectionField = (uid: string | undefined) => {
  return StateField.define<DecorationSet>({
    create() {
      return Decoration.none;
    },
    update(cursors, tr) {
      cursors = cursors.map(tr.changes);
      for (let e of tr.effects) {
        if (e.is(addCursor)) {
          if (e.value.uid === uid) continue;
          console.log(
            "Adding selection: " +
              e.value.uid +
              " " +
              e.value.from +
              " " +
              e.value.to
          );
          let arr = [];
          if (e.value.from < e.value.to) {
            let deco2 = cursorSelectionMark(e.value.color, e.value.uid);
            arr.push(deco2.range(e.value.from, e.value.to));
          }
          /*
          let deco = Decoration.widget({
            widget: new CursorWidget(e.value.uid, e.value.name, e.value.color),
            uid: e.value.uid,
          });
          arr.push(deco.range(e.value.to));
          */

          cursors = cursors.update({
            add: arr,
          });
        } else if (e.is(remCursor)) {
          if (e.value.uid === uid) continue;
          console.log("Remming: " + e.value.uid);
          cursors = cursors.update({
            filter: (from, to, value) => {
              return value.spec.uid !== e.value.uid;
            },
          });
        }
      }
      return cursors;
    },
    provide: (f) => EditorView.decorations.from(f),
  });
};

export default function selectionPlugin(uid: string | undefined) {
  return [selectionField(uid), selectionBaseTheme];
}
