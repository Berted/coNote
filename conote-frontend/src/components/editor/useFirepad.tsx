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
    // TODO: Assumes editor is signed in, what if not the case?
    if (!editorRef.current || !auth.user) return;

    let docRef = "debug_doc";

    if (docID) {
      docRef = "docs/" + docID;
      if (auth.user) {
        get(ref(getDatabase(), docRef + "/roles/" + auth.user.uid))
          .then((snapshot) => {
            if (!snapshot.exists()) {
              navigate("/error/403");
            } else {
              setUserRole(snapshot.val());
            }
          })
          .catch((e) => {
            if (e.toString() === "Error: Permission denied")
              navigate("/error/403");
            else {
              navigate("/error/" + e);
            }
          });
      }
      // TODO: Not authenticated case is not yet done.
    }

    let lastSecond: number = 0;

    const view = new EditorView({
      extensions: [
        basicSetup,
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
            if (Date.now() - lastSecond >= 1_000) {
              set(ref(getDatabase(), docRef + "/timestamp"), serverTimestamp());
              lastSecond = Date.now();
            }
          }
        }),
      ],
      parent: editorRef.current,
    });

    setView(view);

    let firepad = Firepad.fromCodeMirror6(
      firebase.database(compatApp).ref(docRef),
      view,
      {
        defaultText: "",
        userId: auth.user.uid,
      }
    );

    firepad.on("ready", () => {
      setAvailable(true);
    });

    return () => {
      view.destroy();
      setView(undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef.current, auth.user]);

  return { view, docContent, available, userRole };
}
