import {
  Center,
  VStack,
  Text,
  HStack,
  Button,
  Container,
  Link,
} from "@chakra-ui/react";
import { Helmet } from "react-helmet";
import { useNavigate, Link as RouteLink } from "react-router-dom";
import Logo from "./Logo";

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>coNote</title>
      </Helmet>
      <Container maxW="vw" maxH="vh">
        <Center>
          <VStack spacing="3em">
            <VStack spacing="-1em" marginTop="35vh">
              <Logo fontSize="72pt" textShadow="0px 1px 3px #00000033" />
              <Text
                size="l"
                color="gray.500"
                fontSize="18pt"
                fontFamily="DM Sans"
              >
                Simply type.
              </Text>
            </VStack>
            <HStack spacing="2.5em">
              <Button
                colorScheme="blue"
                boxShadow="base"
                padding="0px 2em"
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                boxShadow="base"
                padding="0px 2em"
                onClick={() => navigate("/signup")}
              >
                {" "}
                Sign up
              </Button>
            </HStack>
            <Link
              href="https://github.com/Berted/coNote"
              target="_blank"
              color="gray.400"
              _hover={{
                textColor: "gray.600",
                textDecoration: "underline",
              }}
            >
              What is coNote?
            </Link>
          </VStack>
        </Center>
      </Container>
    </>
  );
}
