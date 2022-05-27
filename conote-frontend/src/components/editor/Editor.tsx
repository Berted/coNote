import {
  Remirror,
  useRemirror,
  useHelpers,
  EditorComponent,
} from "@remirror/react";
import { languages } from "@codemirror/language-data";
import { CodeMirrorExtension } from "@remirror/extension-codemirror6";
import { HStack, Box } from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import "github-markdown-css";

const extensions = () => [new CodeMirrorExtension({ languages })];

function MarkdownPreview() {
  const { getText } = useHelpers(true);
  return <ReactMarkdown children={getText()} className="markdown-body" />;
}

const Editor = () => {
  const { manager, onChange, state } = useRemirror({
    extensions,
    content: "Hello _world_, **Markdown**",
    stringHandler: "html",
    selection: "end",
  });

  return (
    <Remirror onChange={onChange} manager={manager} initialContent={state}>
      <HStack w="vw" padding="2">
        <Box w="50%">
          <EditorComponent />
        </Box>
        <Box w="50%">
          <MarkdownPreview />
        </Box>
      </HStack>
    </Remirror>
  );
};

export default Editor;
