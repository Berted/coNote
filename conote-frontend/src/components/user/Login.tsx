import {
  Heading,
  VStack,
  Flex,
  Link,
  Text,
} from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import Loginform from "./Loginform";

export default function Login() {
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Login
        </Heading>
        <Loginform
          onButtonClick={(email: string, password: string) => {
            authentication.signin(email, password)
              .then(response => navigate("/dashboard"))
              .catch(error => console.log(error));
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
        </Text>
      </VStack>
    </Flex>
  );
}
