import {
  Heading,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";

export default function Forgetpassword() {
  const navigate = useNavigate();
  const authentication = useProvideAuth();
  const [email, setEmail] = useState("");

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Reset Password
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
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="johndoe@example.com"
            />
          </FormControl>
          <Button
            onClick={() => {
              authentication.sendPwdResetEmail(email)
                .then(response => setEmail(""))
                .catch(error => console.log(error));
            }}
            colorScheme="blue"
            boxShadow="base"
            padding="0px 1.5em"
          >
            Recover
          </Button>
        </VStack>
      </VStack>
    </Flex>
  );
}
