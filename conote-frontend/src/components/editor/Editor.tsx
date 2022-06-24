import { HStack, Box, VStack, Text, Spinner } from "@chakra-ui/react";
import { useRef } from "react";
import { useParams } from "react-router-dom";

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

  /* TODO: Crazy hack solution in terms of top position and calc(100vh - 73px) to get the editor dimensions exactly right.
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
      {!available && <LoadingPage mt="45vh" msg="Editor loading..." />}
    </Box>
  );
};

export default Editor;
