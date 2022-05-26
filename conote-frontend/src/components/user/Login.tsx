import {
  Heading,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Flex,
  InputGroup,
  InputRightElement,
  Button,
  Link,
  Text,
} from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import { useState } from "react";

function PasswordInput() {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <InputGroup size="md">
      <Input
        pr="4.5rem"
        type={show ? "text" : "password"}
        placeholder={show ? "Your (visible) password" : "Your password"}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? "Hide" : "Show"}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

export default function Login() {
  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Login
        </Heading>
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
            <Input type="email" placeholder="johndoe@example.com" />
          </FormControl>
          <FormControl id="password">
            <FormLabel htmlFor="email">Password</FormLabel>
            <PasswordInput />
          </FormControl>
          <Button colorScheme="blue" boxShadow="base" padding="0px 1.5em">
            Login
          </Button>
        </VStack>
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
        </Text>
      </VStack>
    </Flex>
  );
}
