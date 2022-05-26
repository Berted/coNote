import {
  Center,
  Heading,
  VStack,
  Text,
  HStack,
  Button,
  Container,
  Link,
  chakra,
} from "@chakra-ui/react";

export default function Home() {
  return (
    <Container maxW="vw" maxH="vh">
      <Center>
        <VStack spacing="3em">
          <VStack spacing="-5px" marginTop="35vh">
            <Heading size="4xl" fontSize="72pt" fontFamily="League Spartan">
              <chakra.span color="blue.700">co</chakra.span>
              <chakra.span color="blue.400">Note</chakra.span>
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
            <Button colorScheme="blue" boxShadow="base" padding="0px 2em">
              Login
            </Button>
            <Button boxShadow="base" padding="0px 2em">
              {" "}
              Signup
            </Button>
          </HStack>
          <Link
            href="https://github.com/Berted/coNote"
            target="_blank"
            color="gray.400"
          >
            What is coNote?
          </Link>
        </VStack>
      </Center>
    </Container>
  );
}
