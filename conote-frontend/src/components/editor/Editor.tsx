import {
  HStack,
  Box,
  VStack,
  Text,
  Link,
  Spinner,
  Flex,
} from "@chakra-ui/react";
import { useRef, useEffect, useState } from "react";
import { useParams, Link as RouteLink, useNavigate } from "react-router-dom";

import { EditorView, keymap } from "@codemirror/view";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { basicSetup } from "codemirror";
import { languages } from "@codemirror/language-data";
import { indentWithTab } from "@codemirror/commands";

import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import ReactMarkdown from "react-markdown";
import "./github-markdown-light.css";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import remarkSimpleUML from "@akebifiky/remark-simple-plantuml";
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
import SplitPanel from "./SplitPanel";

function MarkdownPreview({ docContent, ...props }: any) {
  return (
    <>
      <ReactMarkdown
        children={docContent}
        className="markdown-body"
        remarkPlugins={[remarkMath, remarkGfm, remarkSimpleUML]}
        rehypePlugins={[
          rehypeKatex,
          [rehypeHighlight, { ignoreMissing: true }],
        ]}
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
    // TODO: Assumes editor is signed in, what if not the case?
    if (!editorRef.current || !auth.user) return;

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

  /* TODO: Crazy hack solution in terms of top position and calc(100vh - 73px) to get the dimensions exactly right.
  Seems like a problem waiting to happen in the future...
  */
  return (
    <Box maxH="100vh">
      <EditorNavbar docID={params.docID} />
      <HStack verticalAlign="top" textAlign="left" hidden={!available}>
        <VStack w="50%" position="fixed" top="73px">
          <Box w="100%" borderRightWidth="1px" verticalAlign="top">
            <Box ref={editorRef} />
          </Box>
        </VStack>
        <VStack w="50%">
          <Box w="100%" verticalAlign="top"></Box>
        </VStack>
        <VStack w="50%" h="100%">
          <Box w="100%" verticalAlign="top" mt="50">
            <MarkdownPreview docContent={docContent} />
          </Box>
        </VStack>
      </HStack>
      {!available && (
        <VStack mt="45vh" spacing="3">
          <Spinner
            size="xl"
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="blue.500"
          />
          <Text fontSize="xl">Loading editor...</Text>
        </VStack>
      )}
    </Box>
  );
};

export default Editor;
