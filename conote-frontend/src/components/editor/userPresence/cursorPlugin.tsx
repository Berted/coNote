import {
  EditorView,
  ViewUpdate,
  ViewPlugin,
  DecorationSet,
  Decoration,
} from "@codemirror/view";
import getCursors from "./getCursors";

const cursorPlugin = (uid: string | undefined, userPresenceHandler: any) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = Decoration.set([]);
        userPresenceHandler.registerListener(
          "cursor-callback",
          this.handleUpdate.bind(this)
        );
      }

      handleUpdate(userPresence: any) {
        this.decorations = getCursors(uid, userPresence);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          userPresenceHandler.callListener("cursor-callback");
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
};
export default cursorPlugin;
