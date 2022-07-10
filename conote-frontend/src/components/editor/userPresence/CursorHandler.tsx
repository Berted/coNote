import { EditorView } from "codemirror";
import { StateEffect } from "@codemirror/state";
import { addCursor, remCursor } from "./cursorField";
import UserPresenceHandler from "./UserPresenceHandler";

export default class CursorHandler {
  view: EditorView;
  userPresenceHandler: UserPresenceHandler;
  effects: StateEffect<unknown>[];

  constructor(view: EditorView, userPresenceHandler: UserPresenceHandler) {
    this.view = view;
    this.userPresenceHandler = userPresenceHandler;
    this.effects = [];
    userPresenceHandler.registerOnAddListener(
      "cursor-callback-on-add",
      (userData) => {
        if (userData.from && userData.to) {
          let cursor = addCursor.of({
            uid: userData.uid,
            name: userData.name,
            color: userData.color,
            from: Math.min(userData.from, view.state.doc.length),
            to: Math.min(userData.to, view.state.doc.length),
          });
          view.dispatch({ effects: [cursor] });
        }
      }
    );
    userPresenceHandler.registerOnRemListener(
      "cursor-callback-on-rem",
      (userData) => {
        if (userData.from && userData.to) {
          let cursor = remCursor.of({
            uid: userData.uid,
            from: Math.min(userData.from, view.state.doc.length),
            to: Math.min(userData.to, view.state.doc.length),
          });
          view.dispatch({ effects: [cursor] });
        }
      }
    );
  }
}
