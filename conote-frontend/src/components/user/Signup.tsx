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
  FormHelperText,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import { Helmet } from "react-helmet";
import PasswordInput from "./PasswordInput";

function SignupForm(props: any) {
  const toast = useToast();
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isSame = password === confirmPassword;

  return (
    <>
      <Helmet>
        <title>Sign up - coNote</title>
      </Helmet>
      <VStack
        boxShadow="base"
        borderRadius="md"
        padding="7"
        spacing="5"
        w="70vw"
        minW="340px"
        maxW="lg"
      >
        <FormControl id="fullname">
          <FormLabel htmlFor="fullname">Your name</FormLabel>
          <Input
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            type="fullname"
            placeholder="John Doe"
          />
        </FormControl>
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
        <FormControl id="confirm-password" isInvalid={!isSame} >
          <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
          <PasswordInput
            value={confirmPassword}
            onChange={(e: any) => setConfirmPassword(e.target.value)}
            type="password"
          />
          {(confirmPassword.length === 0 || isSame) ?
            (
              <FormHelperText>
                <br></br>
              </FormHelperText>
            ) : (
              <FormErrorMessage>
                Password does not match.
              </FormErrorMessage>
            )
          }
        </FormControl>

        <Button
          onClick={() =>
            password === confirmPassword ?
              props.onButtonClick(email, password, { fullname: fullname })
              : toast({
                title: "Password confirmation doesn't match",
                status: "error",
                isClosable: true,
              })
          }
          colorScheme="blue"
          boxShadow="base"
          padding="0px 1.5em"
        >
          {props.buttonValue}
        </Button>
      </VStack>
    </>
  );
}

export default function Signup() {
  const toast = useToast();
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Sign up
        </Heading>
        <SignupForm
          onButtonClick={(email: string, password: string, props: any) => {
            authentication
              .signup(email, password, props)
              .then((response) => {
                navigate("/dashboard");
                toast({
                  title: "Logged in!",
                  status: "success",
                  isClosable: true,
                });
              })
              .catch((error) => {
                let errorTitle = "";
                switch (error.code) {
                  case "auth/email-already-in-use":
                    errorTitle = "Email is already in use";
                    break;
                  case "auth/invalid-email":
                    errorTitle = "Invalid email";
                    break;
                  case "auth/weak-password":
                    errorTitle = "Password must contain at least 6 characters";
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
          buttonValue={"Sign up"}
        />
        <Text textColor="gray.400">
          Already have an account?{" "}
          <Link
            _hover={{
              textColor: "gray.600",
              textDecoration: "underline",
            }}
            as={RouteLink}
            to="/login"
          >
            Login here.
          </Link>
        </Text>
      </VStack>
    </Flex>
  );
}
