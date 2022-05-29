import { Heading, VStack, Flex, Link, Text, Button } from "@chakra-ui/react";
import { Link as RouteLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";

export default function Dashboard() {
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  return (
    authentication.user && (
      <Flex minH={"100vh"} align={"center"} justify={"center"}>
        <VStack spacing="6">
          <Heading size="3xl" fontFamily="League Spartan">
            Hi, {authentication.user.email}!
          </Heading>
          <Text maxW="50%">
            Sadly, we have not implemented an interface for file management and
            storage. However, you can try out a basic version of{" "}
            <Link
              _hover={{
                textColor: "blue.500",
                textDecoration: "underline",
              }}
              as={RouteLink}
              to="/editor"
            >
              the editor!
            </Link>
          </Text>
          <Button
            onClick={() => {
              authentication
                .signout()
                .then((response) => navigate("/"))
                .catch((error) => console.log(error));
            }}
            colorScheme="blue"
            boxShadow="base"
            padding="0px 1.5em"
          >
            Logout
          </Button>
        </VStack>
      </Flex>
    )
  );
}
