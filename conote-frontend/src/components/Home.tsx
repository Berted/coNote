import {
  Center,
  Heading,
  VStack,
  Text,
  HStack,
  Button,
  Container,
  Link,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container maxW="vw" maxH="vh">
      <Center>
        <VStack spacing="3em">
          <VStack spacing="-5px" marginTop="35vh">
            <Heading size="4xl" fontSize="72pt" fontFamily="League Spartan">
              coNote
            </Heading>
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
  );
}
