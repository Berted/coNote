import {
  EditorView,
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
  Decoration,
} from "@codemirror/view";
import CursorWidget from "./CursorWidget";
import { StateEffect, StateField } from "@codemirror/state";
import { onValue, update } from "firebase/database";
import cursorSelectionMark from "./cursorSelectionMark";

export const addCursor = StateEffect.define<{
  uid: string;
  name: string;
  color: string;
  from: number;
  to: number;
}>();

export const remCursor = StateEffect.define<{
  uid: string;
  from: number;
  to: number;
}>();

const cursorField = (uid: string | undefined, userPresenceHandler: any) => {
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
            "Adding: " + e.value.uid + " " + e.value.from + " " + e.value.to
          );
          let deco = Decoration.widget({
            widget: new CursorWidget(e.value.uid, e.value.name, e.value.color),
            uid: e.value.uid,
          });
          let arr = [deco.range(e.value.to)];
          if (e.value.from < e.value.to) {
            let deco2 = cursorSelectionMark(e.value.color, e.value.uid);
            arr.push(deco2.range(e.value.from, e.value.to));
            arr[1] = [arr[0], (arr[0] = arr[1])][0];
          }

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

export default cursorField;
