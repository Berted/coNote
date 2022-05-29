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
import Userform from "components/user/Userform";

export default function Login() {
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Sign up
        </Heading>
        <Userform
          onButtonClick={(email: string, password: string) => {
            authentication.signup(email, password)
              .then(response => navigate("/dashboard"))
              .catch(error => console.log(error));
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
