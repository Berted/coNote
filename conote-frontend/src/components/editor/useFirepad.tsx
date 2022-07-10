import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { compatApp } from "config/firebaseConfig";
import { set, get, getDatabase, ref, serverTimestamp } from "firebase/database";
import firebase from "firebase/compat/app";

import { EditorView, keymap } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { basicSetup } from "codemirror";
import { languages } from "@codemirror/language-data";
import { indentWithTab } from "@codemirror/commands";

import Firepad from "@lucafabbian/firepad";

import { useProvideAuth } from "hooks/useAuth";
import UserPresenceHandler from "./userPresence/UserPresenceHandler";
import cursorPlugin from "./userPresence/cursorPlugin";

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

    let docRef = "debug_doc";
    if (docID) docRef = "docs/" + docID;

    let lastSecond: number = 0;
    let updatedYet: boolean = false;
    let upHandler = new UserPresenceHandler(docRef);
    upHandler.registerListener("debug-console-log-listener", (up: any) => {
      for (let x in up) {
        console.log("User Present: " + x);
        console.log("User " + x + " fullname: " + up[x].name);
        console.log("User " + x + " [" + up[x].from + ", " + up[x].to + "]");
      }
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
          if (update.changes) {
            setDocContent(update.state.doc.toString());
          }

          if (update.docChanged) {
            // Only update timestamp every second.
            if (updatedYet && Date.now() - lastSecond >= 1_000) {
              set(ref(getDatabase(), docRef + "/timestamp"), serverTimestamp());
              lastSecond = Date.now();
            }
            // TODO: Hacky solution to get timestamp to not update on document enter.
            updatedYet = true;
          }

          if (update.selectionSet && auth?.user) {
            set(
              ref(
                getDatabase(),
                docRef + "/users/" + auth.user.uid + "/cursor"
              ),
              {
                from: update.state.selection.main.from,
                to: update.state.selection.main.to,
              }
            );
          }
        }),
        cursorPlugin(auth.user ? auth.user.uid : undefined, upHandler),
      ],
      parent: editorRef.current,
    });

    setView(view);
    let firepad: any;

    // If you modify the default text, make sure it's non-empty.
    // Otherwise, the timestamp bug issue will be a slight issue.
    // TODO: Add to tests.
    if (auth?.user) {
      firepad = Firepad.fromCodeMirror6(
        firebase.database(compatApp).ref(docRef),
        view,
        {
          defaultText: "# Type your title here!",
          userId: auth.user.uid,
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
      setAvailable(true);
    });

    return () => {
      // Lucafabbian's firepad.dispose not working.
      // Needs to be done manually. Perhaps should
      // create an issue.
      if (auth.user) {
        set(ref(getDatabase(), `docs/${docID}/users/${auth.user.uid}`), null);
      }
      upHandler.deregister();
      view.destroy();
      setView(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current, userRole]);

  return { view, docContent, available, userRole };
}
