import { HStack, Box, VStack, Text, Link } from "@chakra-ui/react";
import { useRef, useEffect, useState } from "react";
import { useParams, Link as RouteLink, useNavigate } from "react-router-dom";

import { EditorView } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { basicSetup } from "codemirror";
import { languages } from "@codemirror/language-data";

import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import Firepad from "@lucafabbian/firepad";

import { useProvideAuth } from "hooks/useAuth";
import { compatApp } from "config/firebaseConfig";
import { set, get, getDatabase, ref, serverTimestamp } from "firebase/database";
import firebase from "firebase/compat/app";
import "firebase/compat/database";

import EditorNavbar from "./EditorNavbar";

function MarkdownPreview({ docContent, ...props }: any) {
  return (
    <>
      <ReactMarkdown
        children={docContent}
        className="markdown-body"
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      />
    </>
  );
}

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const navigate = useNavigate();
  const auth = useProvideAuth();
  const [view, setView] = useState<EditorView>();
  const [docContent, setDocContent] = useState("");
  const [available, setAvailable] = useState<boolean>(false);

  useEffect(() => {
    if (!editorRef.current) return;

    let docRef = "debug_doc";

    if (params.docID) {
      docRef = "docs/" + params.docID;
      if (auth.user) {
        get(ref(getDatabase(), docRef + "/roles/" + auth.user.uid))
          .then((snapshot) => {
            if (!snapshot.exists() || snapshot.val() === "viewer") {
              navigate("/error/403");
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
        markdown({ base: markdownLanguage, codeLanguages: languages }),
        EditorView.lineWrapping,
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

  return (
    <Box minH="100vh">
      <EditorNavbar docID={params.docID} />
      <HStack
        paddingX="2"
        marginTop="20px"
        verticalAlign="top"
        textAlign="left"
        h="90vh"
      >
        <VStack w="50%" h="100%">
          <Text>Editor:</Text>
          <Box w="100%" borderWidth="1px" borderRadius="md" verticalAlign="top">
            <div ref={editorRef} hidden={!available} />
            <Text>{available ? "" : "Editor is loading..."}</Text>
          </Box>
        </VStack>
        <VStack w="50%" h="100%">
          <Text>Preview:</Text>
          <Box w="100%" borderWidth="1px" borderRadius="md" verticalAlign="top">
            <MarkdownPreview docContent={docContent} />
          </Box>
        </VStack>
      </HStack>
    </Box>
  );
};

export default Editor;
