import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { compatApp } from "config/firebaseConfig";
import {
  set,
  get,
  getDatabase,
  ref,
  serverTimestamp,
  onDisconnect,
} from "firebase/database";
import firebase from "firebase/compat/app";

import { EditorView, keymap } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { basicSetup } from "codemirror";
import { languages } from "@codemirror/language-data";
import { indentWithTab } from "@codemirror/commands";

import Firepad from "@lucafabbian/firepad";

import { useProvideAuth } from "hooks/useAuth";
import UserPresenceHandler from "./userPresence/UserPresenceHandler";
import selectionPlugin from "./userPresence/selectionPlugin";
import cursorPlugin from "./userPresence/cursorPlugin";
import CursorHandler from "./userPresence/CursorHandler";

export default function useFirepad(
  docID: string | undefined,
  editorRef: React.RefObject<HTMLDivElement>
) {
  const auth = useProvideAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<EditorView>();
  const [docContent, setDocContent] = useState("");
  const [available, setAvailable] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<String | undefined>();
  const [userPresence, setUserPresence] = useState<any>();

  // TODO: Declare const file?
  const CURSOR_UPDATE_INTERVAL = 100;

  useEffect(() => {
    if (auth.user === null) return;

    let docRef = "debug_doc";
    if (docID) docRef = "docs/" + docID;

    get(ref(getDatabase(), docRef + "/public"))
      .then((snap1) => {
        if (auth.user) {
          get(ref(getDatabase(), docRef + "/roles/" + auth.user.uid))
            .then((snap2) => {
              if (!snap2.exists()) {
                if (snap1.val()) setUserRole("viewer");
                else navigate("/error/403");
              } else {
                setUserRole(snap2.val());
              }
            })
            .catch((e) => {
              if (e.toString() === "Error: Permission denied")
                navigate("/error/403");
              else navigate("/error/" + e);
            });
        } else if (snap1.val()) {
          setUserRole("viewer");
        } else {
          navigate("/error/403");
        }
      })
      .catch((e) => {
        if (e.toString() === "Error: Permission denied") navigate("/error/403");
        else navigate("/error/" + e);
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  useEffect(() => {
    if (!editorRef.current || !userRole || auth.user === null) return;

    let docRef = "debug_doc",
      uid = auth.user ? auth.user.uid : undefined;
    if (docID) docRef = "docs/" + docID;

    let lastSecond: number = 0;
    let lastCursorUpdate: number = 0;
    let cursorUpdate: any = null;

    let updatedYet: boolean = false;
    let upHandler = new UserPresenceHandler(docRef);

    upHandler.registerListener("react-state-update", (up: any) => {
      setUserPresence(Object.assign({}, up));
    });
    // TODO: Remember to doc esc+tab to escape focus.
    const view = new EditorView({
      extensions: [
        basicSetup,
        EditorView.editable.of(userRole !== "viewer"),
        keymap.of([indentWithTab]),
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.lineWrapping,
        EditorView.theme({
          ".cm-content, .cm-gutter": { fontSize: "14px", minHeight: "92vh" },
          "&": { height: "calc(100vh - 73px)" },
          ".cm-scroller": { overflow: "auto" },
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setDocContent(update.state.doc.toString());
            // Only update timestamp every second.
            if (updatedYet && Date.now() - lastSecond >= 1_000) {
              set(ref(getDatabase(), docRef + "/timestamp"), serverTimestamp());
              lastSecond = Date.now();
            }
            // TODO: Hacky solution to get timestamp to not update on document enter.
            updatedYet = true;
          }

          if ((update.docChanged || update.selectionSet) && uid) {
            // Based on Firepad's original cursor tracking logic:
            // We want to push cursor changes to Firebase AFTER edits to the history,
            // because the cursor coordinates will already be in post-change units.
            // Sleeping for (at least) 1ms ensures that sendCursor happens after sendOperation.
            if (cursorUpdate) {
              clearTimeout(cursorUpdate);
              cursorUpdate = null;
            }
            cursorUpdate = setTimeout(() => {
              if (!uid) return;
              set(ref(getDatabase(), docRef + "/users/" + uid + "/cursor"), {
                from: update.state.selection.main.from,
                to: update.state.selection.main.to,
              });
              lastCursorUpdate = Date.now();
            }, Math.max(1, CURSOR_UPDATE_INTERVAL - (Date.now() - lastCursorUpdate)));
          }
        }),
        selectionPlugin(uid),
        cursorPlugin(uid),
      ],
      parent: editorRef.current,
    });

    setView(view);
    let firepad: any;

    // If you modify the default text, make sure it's non-empty.
    // Otherwise, the timestamp bug issue will be a slight issue.
    // TODO: Add to tests.
    if (uid) {
      firepad = Firepad.fromCodeMirror6(
        firebase.database(compatApp).ref(docRef),
        view,
        {
          defaultText: "# Type your title here!",
          userId: uid,
        }
      );
    } else {
      firepad = Firepad.fromCodeMirror6(
        firebase.database(compatApp).ref(docRef),
        view,
        {
          defaultText: "# Type your title here!",
        }
      );
    }

    firepad.on("ready", () => {
      let cursorHandler = new CursorHandler(view, upHandler);
      if (uid) {
        onDisconnect(ref(getDatabase(), `docs/${docID}/users/${uid}`))
          .remove()
          .catch((e) => {
            console.log("Unable to set onDisconnect: " + e);
          });
      }
      setAvailable(true);
    });
    return () => {
      // Lucafabbian's firepad.dispose not working.
      // Needs to be done manually. Perhaps should
      // create an issue.
      if (uid) {
        set(ref(getDatabase(), `docs/${docID}/users/${uid}`), null);
      }
      firepad.off("ready");
      upHandler.deregister();
      view.destroy();
      setView(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current, userRole]);

  return { view, docContent, available, userRole, userPresence };
}
