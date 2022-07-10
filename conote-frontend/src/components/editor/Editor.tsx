import { HStack, Box, VStack } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import useDebounce from "hooks/useDebounce";

import "firebase/compat/database";
import EditorNavbar from "./EditorNavbar";
import MarkdownPreview from "./MarkdownPreview";
import useFirepad from "./useFirepad";
import LoadingPage from "components/LoadingPage";

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const { view, docContent, available, userRole } = useFirepad(
    params.docID,
    editorRef
  );
  const [editSize, setEditSize] = useState(50);

  useEffect(() => {
    if (userRole === "viewer") {
      setEditSize(0);
    }
  }, [userRole]);

  /* TODO: Crazy hack solution in terms of top position and calc(100vh - 73px) to get the editor dimensions exactly right.
  Can't wait for this to break in the future
  */
  return (
    <Box maxH="100vh">
      <EditorNavbar
        docContent={docContent}
        docID={params.docID}
        editSize={editSize}
        setEditSize={setEditSize}
      />
      <HStack verticalAlign="top" textAlign="left" hidden={!available}>
        <VStack w={editSize + "%"} position="fixed" top="73px">
          <Box w="100%" borderRightWidth="1px" verticalAlign="top">
            <Box ref={editorRef} />
          </Box>
        </VStack>
        <VStack w={editSize + "%"}>
          <Box w="100%" verticalAlign="top"></Box>
        </VStack>
        <VStack w={100 - editSize + "%"} h="100%">
          <Box w="100%" verticalAlign="top" mt="50">
            <MarkdownPreview docContent={docContent} />
          </Box>
        </VStack>
      </HStack>
      {!available && <LoadingPage mt="45vh" msg="Editor loading..." />}
    </Box>
  );
};

export default Editor;
