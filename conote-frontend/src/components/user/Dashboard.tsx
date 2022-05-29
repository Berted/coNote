import {
  Heading,
  VStack,
  Flex,
  Link,
  Text,
  Button,
} from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  return authentication.user && (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Hi, {authentication.user.email}!
        </Heading>
        <Button
          onClick={() => {
            authentication.signout()
              .then(response => navigate("/"))
              .catch(error => console.log(error));
          }}
          colorScheme="blue"
          boxShadow="base"
          padding="0px 1.5em"
        >
          Logout
        </Button>
      </VStack>
    </Flex>
  );
}
