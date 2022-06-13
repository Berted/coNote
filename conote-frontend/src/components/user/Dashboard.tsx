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
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouteLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import { IoCreateSharp } from "react-icons/io5";
import { getDatabase, get, ref } from "firebase/database";

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

function Navbar({ auth, ...props }: any) {
  const [userData, setUserData] = useState({
    fullname: "",
    img_url: "",
    owned_documents: [],
  });
  console.log("UID: " + auth.user.uid);
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
        <Button leftIcon={<IoCreateSharp />} colorScheme="blue">
          New Note
        </Button>
        <Flex align="center">
          <UserButton auth={auth} userData={userData} />
        </Flex>
      </HStack>
    </NavbarContainer>
  );
}

export default function Dashboard() {
  const authentication = useProvideAuth();

  return (
    authentication.user && (
      <Box minH="100vh">
        <Navbar auth={authentication} />
        <Flex align={"center"} justify={"center"}>
          <VStack spacing="6">
            <Heading size="3xl" fontFamily="League Spartan">
              Hi, {authentication.user.email}!
            </Heading>
            <Text maxW="50%">
              Sadly, we have not implemented an interface for file management
              and storage. However, you can try out a basic version of{" "}
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
        </Flex>
      </Box>
    )
  );
}
