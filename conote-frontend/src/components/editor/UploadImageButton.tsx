import { AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, Box, Button, Container, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay, FormControl, FormLabel, HStack, Icon, IconButton, Image, Input, InputGroup, InputLeftElement, InputRightAddon, InputRightElement, ModalFooter, Select, Stack, ToastId, Tooltip, useDisclosure, useToast, VStack } from "@chakra-ui/react";
import { getDatabase, onValue, push, ref, remove, set } from "firebase/database";
import { useProvideAuth } from "hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { IoCloudUpload, IoCopySharp, IoFilterSharp, IoImagesSharp, IoTrashSharp } from "react-icons/io5";
import { FiFile } from 'react-icons/fi';
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

function DeleteImageButton({ docID, isOwner, imageObject }: any) {
  const [key, image] = imageObject;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<any>();
  const storage = firebase.storage();

  return (
    <>
      <Tooltip
        label={"Delete image."}
        placement="bottom-start"
        closeDelay={500}
      >
        <IconButton
          aria-label={"delete-image-" + image}
          icon={<IoTrashSharp />}
          size='sm'
          variant='solid'
          opacity={0.3}
          _hover={{
            opacity: 0.8,
          }}
          isDisabled={!isOwner}
          onClick={onOpen}
        />
      </Tooltip>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Image
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards. All image links will be broken as well.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme='red' onClick={() => {
                if (isOwner) {
                  remove(ref(getDatabase(), `docs/${docID}/images/${key}`))
                    .then(() => {
                      storage.ref(`docs/${docID}/images/${key}`)
                        .delete()
                        .then(() => {
                          onClose();
                        })
                        .catch(e => {
                          console.log("Delete image from storage error " + e);
                        })
                    })
                    .catch(e => console.log("Remove image from database error " + e));
                }
              }} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>

  );
}

export default function SortFilterDrawer({ docID, owner }: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [images, setImages] = useState<[string, string][]>([]);

  const auth = useProvideAuth();
  const storage = firebase.storage();
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | undefined>(undefined);

  const isOwner = auth.user ? auth.user.uid === owner : false;

  // Subscribe to images bank
  useEffect(() => {
    if (!auth.user) return;
    const unsubscribe = onValue(
      ref(getDatabase(), `docs/${docID}/images`),
      (snapshot) => {
        let arr = [] as string[];
        snapshot.forEach((image) => {
          if (image.key) {
            arr.push(image.key);
          }
        })
        arr.reverse();
        Promise.all(
          arr.map(image => {
            return Promise.all([image, storage.ref(`docs/${docID}/images/${image}`).getDownloadURL()]);
          })).then(response => {
            setImages(response);
          });
      },
      (e) => {
        // TODO: Alert notification?
        console.log("Images Error: " + e);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [docID, auth.user]);

  return (
    <>
      <IconButton
        aria-label="image-bank"
        variant='ghost'
        colorScheme='blue'
        icon={<IoImagesSharp />}
        onClick={onOpen}
      />
      <Drawer onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent flexDirection="column">
          <DrawerHeader>
            {"Images"}
            <FormControl
              mt={3}
            >
              <FormLabel fontWeight='bold'>
                Upload new image
              </FormLabel>
              <InputGroup>
                <InputLeftElement
                  pointerEvents="none">
                  <Icon as={FiFile} />
                </InputLeftElement>
                <input
                  type='file'
                  ref={inputRef}
                  accept={'image/*'}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
                <Input
                  placeholder={"Your file ..."}
                  onClick={() => {
                    if (inputRef.current !== null) {
                      inputRef.current.click();
                    }
                  }}
                  readOnly={true}
                  value={file ? file.name : ''}
                />
                <InputRightElement
                  width='4.5rem'
                >
                  <Button
                    h='1.75rem'
                    size='sm'
                    mr='1.5'
                    onClick={async () => {
                      if (file) {
                        if (file && file.type.split('/')[0] === 'image') {
                          toastRef.current = toast({
                            title: "Uploading image...",
                            status: "loading",
                            isClosable: false,
                            duration: null,
                          });
                          const newImgName = push(ref(getDatabase(), `docs/${docID}/images`), true);
                          const storageRef = storage.ref(`docs/${docID}/images/${newImgName.key}`);
                          await storageRef.put(file, {
                            customMetadata: {
                              'owner': owner
                            },
                          });

                          // HACK: to reload images in `UploadImageButton` after upload is finished
                          set(ref(getDatabase(), `docs/${docID}/images`), true);

                          let link = await storageRef.getDownloadURL();
                          setFile(undefined);
                          if (toastRef.current) {
                            toast.close(toastRef.current);
                          }
                        }
                      }
                    }}
                  >
                    Upload
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </DrawerHeader>
          <DrawerBody>
            <VStack>
              {images.map((imageObject, index) => {
                const [key, image] = imageObject;
                return (
                  <Box
                    maxW='sm'
                    borderWidth='1px'
                    borderRadius='lg'
                    overflow='hidden'
                    minHeight='50px'
                    maxHeight='150px'
                    position='relative'>
                    <Image src={image} />
                    <HStack
                      position='absolute'
                      bottom={0}
                      right={0}
                      zIndex='1'
                      flexDirection='row-reverse'
                    >
                      <DeleteImageButton
                        docID={docID}
                        isOwner={isOwner}
                        imageObject={imageObject}
                      />
                      <Tooltip
                        label="Copy image markdown syntax to clipboard."
                        placement="bottom-start"
                        closeDelay={500}
                      >
                        <IconButton
                          aria-label={"copy-image-" + image}
                          icon={<IoCopySharp />}
                          size='sm'
                          variant='solid'
                          opacity={0.3}
                          _hover={{
                            opacity: 0.8,
                          }}
                          onClick={() => {
                            navigator.clipboard.writeText("![](" + image + ")");
                          }}
                        />
                      </Tooltip>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
