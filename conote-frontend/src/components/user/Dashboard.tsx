import {
  Heading,
  VStack,
  HStack,
  Flex,
  Link,
  LinkBox,
  LinkOverlay,
  Text,
  Button,
  Box,
  useDisclosure,
  IconButton,
  SimpleGrid,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
import React from "react";
import { useState, useEffect } from "react";
import { Link as RouteLink } from "react-router-dom";

import { useProvideAuth } from "hooks/useAuth";

import { IoTime, IoTrashSharp } from "react-icons/io5";
import { getDatabase, get, ref, child, remove } from "firebase/database";
import DashboardNavbar from "./DashboardNavbar";

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

function DocCard({ docID, ...props }: any) {
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
      </Flex>
    </LinkBox>
  );
}

export default function Dashboard() {
  const { userData, ...auth } = useProvideAuth();

  return (
    auth.user && (
      <Box minH="100vh">
        <DashboardNavbar />

        <SimpleGrid minChildWidth="240px" paddingX="7" marginTop="2" gap="5">
          {userData !== undefined &&
            Object.keys(userData.owned_documents).map((item) => {
              return <DocCard docID={item} />;
            })}
        </SimpleGrid>
      </Box>
    )
  );
}

/*
  Deprecated.
*/
function PlaceholderText({ auth, ...props }: any) {
  return (
    <VStack spacing="6">
      <Heading size="3xl" fontFamily="League Spartan">
        Hi, {auth.user.email}!
      </Heading>
      <Text maxW="50%">
        Sadly, we have not implemented an interface for file management and
        storage. However, you can try out a basic version of{" "}
        <Link
          textDecor="underline"
          _hover={{
            textColor: "blue.500",
          }}
          as={RouteLink}
          to="/editor"
        >
          the editor!
        </Link>
      </Text>
    </VStack>
  );
}
