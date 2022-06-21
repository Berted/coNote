import {
  Avatar,
  Button,
  HStack,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
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
  useDisclosure,
} from "@chakra-ui/react";

import { useState } from "react";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";

import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import { IoCreateSharp } from "react-icons/io5";
import {
  set,
  ref,
  getDatabase,
  push,
  serverTimestamp,
} from "firebase/database";

function UserButton(props: any) {
  const navigate = useNavigate();
  const auth = useProvideAuth();

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
          Hi, <b>{auth.userData === undefined ? "" : auth.userData.fullname}</b>
          !
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

function NewDocButton(props: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");
  const { userData, ...auth } = useProvideAuth();

  const onNewDoc = (e: any) => {
    if (!auth.user) return;
    const newDocRef = push(ref(getDatabase(), `docs`), {
      public: false,
      roles: {
        [auth.user.uid]: "owner",
      },
      timestamp: serverTimestamp(),
      title: title,
    });

    set(
      ref(
        getDatabase(),
        `users/${auth.user?.uid}/owned_documents/${newDocRef.key}`
      ),
      true
    ).catch((e) => {
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

export default function DashboardNavbar(props: any) {
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
        <NewDocButton />
        <Flex align="center">
          <UserButton />
        </Flex>
      </HStack>
    </NavbarContainer>
  );
}
