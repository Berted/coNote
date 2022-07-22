import {
  HStack,
  Box,
  VStack,
  useToast,
  ToastId,
  Spacer,
  chakra,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/database";
import EditorNavbar from "./EditorNavbar";
import MarkdownPreview from "./MarkdownPreview";
import useFirepad from "./useFirepad";
import LoadingPage from "components/LoadingPage";
import { Helmet } from "react-helmet";
import { getDatabase, ref, get, push, set } from "firebase/database";
import { Allotment, AllotmentHandle } from "allotment";
import "allotment/dist/style.css";
import PanelValue from "./userPresence/PanelValue";

const Editor = () => {
  const storage = firebase.storage();
  const toast = useToast();
  const toastRef = useRef<ToastId[]>([]);

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

  const [owner, setOwner] = useState<string>(""); // document owner
  useEffect(() => {
    get(ref(getDatabase(), `docs/${params.docID}/roles`)).then((snapshot) => {
      snapshot.forEach((userID) => {
        if (userID.key && userID.val() === "owner") {
          setOwner(userID.key);
        }
      });
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
          userRole={userRole}
          userPresence={userPresence}
          owner={owner}
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
                  <Box
                    ref={editorRef}
                    onPaste={async (args) => {
                      if (!view) return;
                      let clipboard = args.clipboardData;
                      if (clipboard.getData("text").length === 0) {
                        // empty string
                        for (let i = 0; i < clipboard.files.length; i += 1) {
                          let file = clipboard.files[i];
                          if (file && file.type.split("/")[0] === "image") {
                            toastRef.current.push(
                              toast({
                                title: "Uploading image...",
                                status: "loading",
                                isClosable: false,
                                duration: null,
                              })
                            );
                            const newImgName = push(
                              ref(getDatabase(), `docs/${params.docID}/images`),
                              true
                            );
                            const storageRef = storage.ref(
                              `docs/${params.docID}/images/${newImgName.key}`
                            );
                            await storageRef.put(file, {
                              customMetadata: {
                                owner: owner,
                              },
                            });

                            // HACK: to reload images in `UploadImageButton` after upload is finished
                            set(
                              ref(getDatabase(), `docs/${params.docID}/images`),
                              true
                            );

                            let link = await storageRef.getDownloadURL();
                            let changes = view.state.replaceSelection(
                              "![](" + link + ")"
                            );
                            view.dispatch(changes);
                            if (
                              toastRef.current &&
                              toastRef.current.length > 0
                            ) {
                              toast.close(toastRef.current[0]);
                              toastRef.current.splice(0, 1);
                            }
                          }
                        }
                      }
                    }}
                  />
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