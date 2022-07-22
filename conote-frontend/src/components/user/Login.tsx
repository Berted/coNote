import {
  Heading,
  VStack,
  Flex,
  Link,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";
import { Link as RouteLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import PasswordInput from "./PasswordInput";
import { Helmet } from "react-helmet";
import queryStringType from "components/interfaces/queryStringType";

function LoginForm(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <VStack
      boxShadow="base"
      borderRadius="md"
      padding="7"
      spacing="5"
      w="70vw"
      minW="340px"
      maxW="lg"
    >
      <FormControl id="email">
        <FormLabel htmlFor="email">Email address</FormLabel>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="johndoe@example.com"
        />
      </FormControl>
      <FormControl id="password">
        <FormLabel htmlFor="password">Password</FormLabel>
        <PasswordInput
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          type="password"
        />
      </FormControl>
      <Button
        onClick={() => props.onButtonClick(email, password)}
        colorScheme="blue"
        boxShadow="base"
        padding="0px 1.5em"
      >
        {props.buttonValue}
      </Button>
    </VStack>
  );
}

export default function Login() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const authentication = useProvideAuth();

  return (
    <>
      <Helmet>
        <title>Login - coNote</title>
      </Helmet>
      <Flex minH={"100vh"} align={"center"} justify={"center"}>
        <VStack spacing="6">
          <Heading size="3xl" fontFamily="League Spartan">
            Login
          </Heading>
          <LoginForm
            onButtonClick={(email: string, password: string) => {
              authentication
                .signin(email, password)
                .then((response) => {
                  if (location.state) {
                    let { continueUrl } = location.state as queryStringType;
                    navigate(continueUrl);
                  } else {
                    navigate("/dashboard");
                  }
                  toast({
                    title: "Logged in!",
                    status: "success",
                    isClosable: true,
                  });
                })
                .catch((error) => {
                  let errorTitle = "";
                  switch (error.code) {
                    case "auth/invalid-email":
                      errorTitle = "Invalid email";
                      break;
                    case "auth/user-disabled":
                      errorTitle = "User is disabled";
                      break;
                    case "auth/user-not-found":
                      errorTitle = "Incorrect email";
                      break;
                    case "auth/wrong-password":
                      errorTitle = "Incorrect password";
                      break;
                    case "auth/too-many-requests":
                      errorTitle = "Too many attempts!"
                      break;
                    default:
                      console.log(error.code);
                      errorTitle = "Error";
                      break;
                  }
                  toast({
                    title: errorTitle,
                    status: "error",
                    isClosable: true,
                  });
                });
            }}
            buttonValue={"Login"}
          />
          <Text textColor="gray.400">
            New to coNote?{" "}
            <Link
              _hover={{
                textColor: "gray.600",
                textDecoration: "underline",
              }}
              as={RouteLink}
              to="/signup"
            >
              Sign up!
            </Link>
            <br></br>
            <Link
              _hover={{
                textColor: "gray.600",
                textDecoration: "underline",
              }}
              as={RouteLink}
              to="/forget_password"
            >
              Forgot your password?
            </Link>
          </Text>
        </VStack>
      </Flex>
    </>
  );
}
