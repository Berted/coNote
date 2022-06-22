import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
  IconButton,
  LinkBox,
  LinkOverlay,
  HStack,
  Flex,
  Button,
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Tag,
  Input,
  TagLabel,
  TagCloseButton,
  FormHelperText,
  FormErrorMessage,
  FormControl,
} from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import React from "react";
import { useState, useEffect } from "react";
import { IoPricetagsSharp, IoTime, IoTrashSharp } from "react-icons/io5";
import { getDatabase, get, ref, child, remove, update, onValue, set, push, orderByValue, query, equalTo } from "firebase/database";
import { useProvideAuth } from "hooks/useAuth";
import { getModularInstance } from "@firebase/util";

function DeleteDocButton({ docID, title, ...props }: any) {
  const auth = useProvideAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const onDelete = (e: any) => {
    if (!auth.user) return;

    remove(ref(getDatabase(), `docs/${docID}`));
    remove(
      ref(getDatabase(), `users/${auth.user.uid}/owned_documents/${docID}`)
    ).catch((e) => {
      console.log(docID + " delete error: " + e); //TODO: Alert Notification?
    });
    onClose();
  };

  return (
    <>
      <IconButton
        textColor="blue.500"
        colorScheme="telegram"
        icon={<IoTrashSharp />}
        aria-label={"Delete note '" + title + "'"}
        size="md"
        variant="ghost"
        onClick={onOpen}
      />

      <AlertDialog
        leastDestructiveRef={cancelRef}
        isOpen={isOpen}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Note</AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              Are you sure you want to delete <i>'{title}'</i>?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} mr="3">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onDelete}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

function EditTagsButton({ docID, title, ...props }: any) {
  const { user, ...auth } = useProvideAuth();
  const tagsRef = child(ref(getDatabase(), `docs/${docID}`), "tags");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [tags, setTags] = useState<Object | undefined>(undefined);
  const [input, setInput] = useState("");
  const [tagError, setTagError] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = onValue(tagsRef,
      snapshot => setTags(
        snapshot.exists() ? snapshot.val() :
          undefined),
      (e) => {
        // TODO: Alert notification?
        console.log("Tags fetch error: " + e);
      }
    );
    return () => {
      unsubscribe();
    };
  }, [user]);

  const findTagKey = (value: string) => {
    if (tags !== undefined) {
      const key = Object.entries(tags)
        .filter((val) => val[1] === value);
      return key.length === 0 ? undefined : key[0][0];
    }
    return undefined;
  };

  const handleTagCreate = (value: string) => {
    if (!user) return;
    push(tagsRef, value);
  };

  const handleTagDelete = async (value: string) => {
    if (!user) return;
    let key = findTagKey(value);
    if (key !== undefined) {
      remove(child(tagsRef, key))
        .catch(e => {
          // TODO: Alert notification?
          console.log("Tags fetch error: " + e);
        });
    }
  };

  return (
    <>
      <IconButton
        textColor="blue.500"
        colorScheme="telegram"
        icon={<IoPricetagsSharp />}
        aria-label={"Edit tags for note '" + title + "'"}
        size="md"
        variant="ghost"
        onClick={() => {
          setInput("");
          setTagError("");
          onOpen();
        }}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit tags
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            {tags !== undefined && Object.values(tags).map(tag => {
              return (
                <Tag>
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => handleTagDelete(tag)} />
                </Tag>
              );
            })}
            <FormControl isInvalid={tagError.length !== 0}>
              <Input
                autoFocus
                placeholder="Type new tags here..."
                value={input}
                onChange={({ target: { value } }) => {
                  value = value.replaceAll(',', '').trim();
                  setInput(value);
                }}
                onKeyDown={(e) => {
                  let { key, currentTarget: { value } } = e;
                  value = value.replaceAll(',', '').trim();
                  switch (key) {
                    case 'Tab':
                    case 'Enter':
                    case ',':
                      e.preventDefault();
                      if (value.length === 0) {
                        setTagError("Empty tag");
                      } else if (findTagKey(value) !== undefined) {
                        setTagError("Tag already exists");
                      } else {
                        setInput("");
                        setTagError("");
                        handleTagCreate(value);
                      }
                      break;
                    case 'Backspace':
                      if (value.length === 0) {
                        e.preventDefault();
                        if (tags === undefined) {
                          setTagError("No tags to delete");
                        } else {
                          let lastTag = Object.values(tags).pop();
                          handleTagDelete(lastTag);
                          setInput(lastTag);
                          setTagError("");
                        }
                      }
                      break;
                    default:
                      setTagError("");
                      break;
                  }
                }}
                variant="outline"
              />
              {tagError.length === 0 ? (
                <FormHelperText>
                  Press Enter key to add tag
                </FormHelperText>
              ) : (
                <FormErrorMessage>
                  {tagError}
                </FormErrorMessage>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function parseTime(timeStamp: number | undefined): string {
  let curTime: number = Date.now();
  const isLeap = (year: number) => new Date(year, 1, 29).getDate() === 29;

  if (timeStamp === undefined) return "";
  if (timeStamp > curTime) {
    // Local time might be out of sync with server time. Assume timeStamp is better.
    // Perhaps get serverTime instead?
    curTime = timeStamp;
    //console.log("Misidentified time");
    //return "ERROR";
  }

  const pastDate: Date = new Date(timeStamp);
  const curDate: Date = new Date(curTime);

  if (
    curTime - timeStamp >=
    (365 + +isLeap(curDate.getFullYear())) * 86_400_000
  ) {
    if (curDate.getFullYear() - pastDate.getFullYear() === 1) return "a year";
    else return curDate.getFullYear() - pastDate.getFullYear() + " years";
  } else if (curDate.getMonth() !== pastDate.getMonth()) {
    let diff = curDate.getMonth() - pastDate.getMonth();
    if (diff < 0) diff += 12;

    if (diff === 1) return "a month";
    else return diff + " months";
  } else if (curTime - timeStamp >= 86_400_000) {
    let diff = Math.floor((curTime - timeStamp) / 86_400_000);
    if (diff === 1) return "a day";
    else return diff + " days";
  } else if (curTime - timeStamp >= 3_600_000) {
    let diff = Math.floor((curTime - timeStamp) / 3_600_000);
    if (diff === 1) return "an hour";
    else return diff + " hours";
  } else if (curTime - timeStamp >= 60_000) {
    let diff = Math.floor((curTime - timeStamp) / 60_000);
    if (diff === 1) return "a minute";
    else return diff + " minutes";
  } else if (curTime - timeStamp >= 1000) {
    if (curTime - timeStamp < 2_000) return "a second";
    else return Math.floor((curTime - timeStamp) / 1_000) + " seconds";
  } else {
    return "less than a second";
  }
}

export default function DocCard({ docID, ...props }: any) {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);

  // TOTHINK: Data is not updated in realtime. Perhaps should be reconsidered?
  useEffect(() => {
    const docRef = ref(getDatabase(), `docs/${docID}`);
    get(child(docRef, `title`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setTitle(snapshot.val());
        }
      })
      .catch((e) => console.log("Title Error: " + e)); // TODO: Alert notification?

    get(child(docRef, `timestamp`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setTimestamp(snapshot.val());
        }
      })
      .catch((e) => console.log("Timestamp Error: " + e)); // TODO: Alert notification?
  }, [docID]);

  return (
    <LinkBox
      flexGrow="1"
      minH="120px"
      borderWidth="1px"
      borderRadius="lg"
      borderColor="gray.200"
      overflow="hidden"
      px="5px"
      paddingY="2"
      paddingX="5"
      textAlign="left"
      verticalAlign="top"
      transition="background-color 100ms linear"
      _hover={{ bgColor: "gray.50" }}
    >
      <LinkOverlay as={RouteLink} to={"/docs/edit/" + docID}>
        <Box
          mt="1"
          fontWeight="semibold"
          fontSize="lg"
          as="h4"
          lineHeight="tight"
          noOfLines={1}
        >
          {title}
        </Box>
      </LinkOverlay>

      <HStack mt="2px" textColor="gray.400" fontSize="xs">
        <IoTime />
        <Text>Modified {parseTime(timestamp)} ago</Text>
      </HStack>

      <Flex w="vw" mt="10px" mr="-5px" flexDirection="row-reverse">
        <DeleteDocButton docID={docID} title={title} />
        <EditTagsButton docID={docID} title={title} />
      </Flex>
    </LinkBox>
  );
}
