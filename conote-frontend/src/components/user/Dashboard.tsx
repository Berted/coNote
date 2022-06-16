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
  SimpleGrid,
} from "@chakra-ui/react";
import React from "react";
import { useState, useEffect } from "react";
import { Link as RouteLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import { IoCreateSharp } from "react-icons/io5";
import { getDatabase, get, ref, push, set, child } from "firebase/database";
import userType from "components/interfaces/userType";

async function getUserData(auth: any, setUserData: any) {
  get(ref(getDatabase(), `users/${auth.user.uid}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        setUserData(snapshot.val());
      } else {
        setUserData({
          fullname: auth.user.email,
          img_url: "",
          owned_documents: [],
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
        setTitle("");
        getUserData(auth, setUserData);
      })
      .catch((e) => {
        console.log("Set Error: " + e); // TODO: Alert notification?
      });

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

function DocCard({ docID, ...props }: any) {
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [timestamp, setTimestamp] = useState<number | undefined>(undefined);

  // TOTHINK: Data is not updated in realtime. Perhaps should be reconsidered?
  useEffect(() => {
    console.log("Queries: " + docID);
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
