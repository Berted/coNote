import {
  Heading,
  VStack,
  HStack,
  Flex,
  Link,
  Text,
  Button,
  Box,
  Avatar,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
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
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import { IoCreateSharp, IoTime, IoTrashSharp } from "react-icons/io5";
import {
  getDatabase,
  get,
  ref,
  push,
  set,
  child,
  remove,
} from "firebase/database";
import userType from "components/interfaces/userType";

async function getUserData(auth: any, setUserData: any) {
  get(ref(getDatabase(), `users/${auth.user.uid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        let snapvar = snapshot.val();
        if (snapvar.owned_documents === undefined) {
          snapvar.owned_documents = {};
        }
        setUserData(snapvar);
      } else {
        setUserData({
          fullname: auth.user.email,
          img_url: "",
          owned_documents: {},
        });

        // TOTHINK: Currently auto-populates the database with default values if user is not in database. Maybe change?
        set(ref(getDatabase(), `users/${auth.user.uid}`), {
          fullname: auth.user.email,
          img_url: "",
          owned_documents: {},
        });
      }
    })
    .catch((e) => console.log("ERROR: " + e));
}

function UserButton({ auth, userData, ...props }: any) {
  const navigate = useNavigate();

  return (
    <Popover placement="bottom-end" autoFocus={false}>
      <PopoverTrigger>
        <Avatar
          bg="blue.400"
          _hover={{
            bg: "blue.600",
          }}
          role="button"
        />
      </PopoverTrigger>
      <PopoverContent boxShadow="sm">
        <PopoverArrow />
        <PopoverHeader>
          Hi, <b>{userData === undefined ? "" : userData.fullname}</b>!
        </PopoverHeader>
        <PopoverBody>
          <Button
            onClick={() => {
              auth
                .signout()
                .then((response: any) => navigate("/"))
                .catch((error: any) => console.log(error));
            }}
            colorScheme="blue"
            boxShadow="base"
            padding="0px 1.5em"
          >
            Logout
          </Button>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

function NewDocButton({ auth, setUserData, ...props }: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");

  const onNewDoc = (e: any) => {
    const newDocRef = push(ref(getDatabase(), `docs`), {
      content: "",
      public: false,
      roles: {
        [auth.user.uid]: "owner",
      },
      timestamp: Math.floor(Date.now() / 1000),
      title: title,
    });

    set(
      ref(
        getDatabase(),
        `users/${auth.user.uid}/owned_documents/${newDocRef.key}`
      ),
      true
    )
      .then(() => {
        getUserData(auth, setUserData);
      })
      .catch((e) => {
        console.log("Set Error: " + e); // TODO: Alert notification?
      });
    setTitle("");
    onClose();
  };

  return (
    <>
      <Button leftIcon={<IoCreateSharp />} colorScheme="blue" onClick={onOpen}>
        New Note
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl id="title">
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                placeholder="Your note title"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" paddingX="1.5em" onClick={onNewDoc}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function DeleteDocButton({ docID, title, auth, setUserData, ...props }: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef(null);

  const onDelete = (e: any) => {
    remove(ref(getDatabase(), `docs/${docID}`));
    remove(
      ref(getDatabase(), `users/${auth.user.uid}/owned_documents/${docID}`)
    )
      .then(() => {
        getUserData(auth, setUserData);
      })
      .catch((e) => {
        console.log(docID + " delete error: " + e); //TODO: Alert Notification?
      });
    onClose();
  };

  return (
    <>
      <IconButton
        textColor="blue.500"
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

function Navbar({ auth, userData, setUserData, ...props }: any) {
  return (
    <NavbarContainer>
      <Logo
        fontSize="24pt"
        marginBottom="-0.4em"
        _hover={{
          textShadow: "1px 1px 3px #00000033",
        }}
        as={RouteLink}
        to="/"
      />
      <HStack spacing="4">
        <NewDocButton auth={auth} setUserData={setUserData} />
        <Flex align="center">
          <UserButton auth={auth} userData={userData} />
        </Flex>
      </HStack>
    </NavbarContainer>
  );
}

function parseTime(timeStamp: number | undefined): string {
  const curTime: number = Math.floor(Date.now() / 1000);
  const isLeap = (year: number) => new Date(year, 1, 29).getDate() === 29;

  if (timeStamp === undefined) return "";
  if (timeStamp > curTime) {
    // TODO: Alert notification?
    console.log("Misidentified time");
    return "ERROR";
  }

  const pastDate: Date = new Date(timeStamp * 1000);
  const curDate: Date = new Date(curTime * 1000);

  if (curTime - timeStamp >= (365 + +isLeap(curDate.getFullYear())) * 86400) {
    if (curDate.getFullYear() - pastDate.getFullYear() === 1) return "a year";
    else return curDate.getFullYear() - pastDate.getFullYear() + " years";
  } else if (curDate.getMonth() !== pastDate.getMonth()) {
    let diff = curDate.getMonth() - pastDate.getMonth();
    if (diff < 0) diff += 12;

    if (diff === 1) return "a month";
    else return diff + " months";
  } else if (curTime - timeStamp >= 86400) {
    let diff = Math.floor((curTime - timeStamp) / 86400);
    if (diff === 1) return "a day";
    else return diff + " days";
  } else if (curTime - timeStamp >= 3600) {
    let diff = Math.floor((curTime - timeStamp) / 3600);
    if (diff === 1) return "an hour";
    else return diff + " hours";
  } else if (curTime - timeStamp >= 60) {
    let diff = Math.floor((curTime - timeStamp) / 60);
    if (diff === 1) return "a minute";
    else return diff + " minutes";
  } else if (curTime - timeStamp > 0) {
    if (curTime - timeStamp === 1) return "a second";
    else return curTime - timeStamp + " seconds";
  } else {
    return "less than a second";
  }
}

function DocCard({ docID, setUserData, auth, ...props }: any) {
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
    <Box
      flexGrow="1"
      minH="120px"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      px="5px"
      paddingY="2"
      paddingX="5"
      textAlign="left"
      verticalAlign="top"
    >
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
      <HStack mt="2px" textColor="gray.300" fontSize="xs">
        <IoTime />
        <Text>Modified {parseTime(timestamp)} ago</Text>
      </HStack>

      <Flex w="vw" mt="10px" mr="-5px" flexDirection="row-reverse">
        <DeleteDocButton
          docID={docID}
          title={title}
          setUserData={setUserData}
          auth={auth}
        />
      </Flex>
    </Box>
  );
}

export default function Dashboard() {
  const auth = useProvideAuth();

  const [userData, setUserData] = useState<userType | undefined>(undefined);

  useEffect(() => {
    if (auth.user) {
      getUserData(auth, setUserData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user]);

  return (
    auth.user && (
      <Box minH="100vh">
        <Navbar auth={auth} userData={userData} setUserData={setUserData} />

        <SimpleGrid minChildWidth="240px" paddingX="7" marginTop="2" gap="5">
          {userData !== undefined &&
            Object.keys(userData.owned_documents).map((item) => {
              return (
                <DocCard docID={item} setUserData={setUserData} auth={auth} />
              );
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
