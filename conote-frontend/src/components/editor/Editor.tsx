import { HStack, Box, VStack, Spacer, chakra } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

import "firebase/compat/database";
import EditorNavbar from "./EditorNavbar";
import MarkdownPreview from "./MarkdownPreview";
import useFirepad from "./useFirepad";
import LoadingPage from "components/LoadingPage";
import { Helmet } from "react-helmet";
import { getDatabase, ref, get } from "firebase/database";
import { Allotment, AllotmentHandle } from "allotment";
import "allotment/dist/style.css";
import PanelValue from "./userPresence/PanelValue";

const Editor = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<AllotmentHandle>(null!);
  const params = useParams();
  const { view, docContent, available, userRole, userPresence } = useFirepad(
    params.docID,
    editorRef
  );
  const [docTitle, setDocTitle] = useState("");
  const [panelType, setPanelType] = useState<PanelValue>(PanelValue.Split);

  useEffect(() => {
    if (userRole === "viewer") {
      setPanelType(PanelValue.View);
    }
  }, [userRole]);

  useEffect(() => {
    get(ref(getDatabase(), `docs/${params.docID}/title`)).then((snapshot) => {
      if (snapshot.val()) setDocTitle(snapshot.val());
    });
  }, []);

  /* TODO: Crazy hack solution in terms of top position and calc(100vh - 73px) to get the editor dimensions exactly right.
  Can't wait for this to break in the future
  */
  return (
    <>
      <Helmet>
        <title>{docTitle + " - coNote"}</title>
      </Helmet>
      <Box maxH="100vh">
        <EditorNavbar
          docContent={docContent}
          docID={params.docID}
          panelType={panelType}
          setPanelType={setPanelType}
          userPresence={userPresence}
        />

        <chakra.div
          w="100vw"
          h={`calc(100vh - 73px)`}
          mt="73px"
          hidden={!available}
        >
          <Allotment
            minSize={300}
            defaultSizes={[50, 50]}
            vertical={false}
            ref={splitRef}
            snap={false}
          >
            <Allotment.Pane visible={panelType !== PanelValue.View}>
              <VStack w={"100%"} textAlign="left" zIndex="5">
                <Box w="100%" borderRightWidth="1px" verticalAlign="top">
                  <Box ref={editorRef} />
                </Box>
              </VStack>
            </Allotment.Pane>

            <Allotment.Pane visible={panelType !== PanelValue.Edit}>
              <VStack w="100%" h="100%" overflow="auto">
                <Box w="100%" verticalAlign="top" mt="-23px" textAlign="left">
                  {panelType !== PanelValue.Edit && (
                    <MarkdownPreview docContent={docContent} />
                  )}
                </Box>
              </VStack>
            </Allotment.Pane>
          </Allotment>
        </chakra.div>

        {!available && <LoadingPage mt="45vh" msg="Editor loading..." />}
      </Box>
    </>
  );
};

export default Editor;
