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
} from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import { Link as RouteLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import { IoCreateSharp } from "react-icons/io5";
import { getDatabase, get, ref, push, set } from "firebase/database";
import userType from "components/interfaces/userType";

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
          Hi, <b>{userData.fullname}</b>!
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

function NewDocButton({ auth, ...props }: any) {
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
    ).catch((e) => {
      console.log("Set Error: " + e);
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

class Navbar extends React.Component<{ auth: any }, { userData: userType }> {
  constructor(props: any) {
    super(props);
    this.state = {
      userData: {
        fullname: "",
        img_url: "",
        owned_documents: {},
      },
    };
  }

  componentDidMount() {
    get(ref(getDatabase(), `users/${this.props.auth.user.uid}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          this.setState({
            userData: snapshot.val(),
          });
        } else {
          this.setState({
            userData: {
              fullname: this.props.auth.user.email,
              img_url: "",
              owned_documents: [],
            },
          });
        }
        console.log("Get Ran");
      })
      .catch((e) => console.log("ERROR: " + e));
  }

  render() {
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
          <NewDocButton auth={this.props.auth} />
          <Flex align="center">
            <UserButton auth={this.props.auth} userData={this.state.userData} />
          </Flex>
        </HStack>
      </NavbarContainer>
    );
  }
}

function DocCard() {}

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

export default function Dashboard() {
  const authentication = useProvideAuth();

  return (
    authentication.user && (
      <Box minH="100vh">
        <Navbar auth={authentication} />
        <Flex align={"center"} justify={"center"}>
          <PlaceholderText auth={authentication} />
        </Flex>
      </Box>
    )
  );
}
