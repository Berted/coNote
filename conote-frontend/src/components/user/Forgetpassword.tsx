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

function Forgetpasswordform(props: any) {
  const [email, setEmail] = useState("");

  return (
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
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="johndoe@example.com"
        />
      </FormControl>
      <Button
        onClick={() => props.onButtonClick(email)}
        colorScheme="blue"
        boxShadow="base"
        padding="0px 1.5em"
      >
        {props.buttonValue}
      </Button>
    </VStack>
  );
}

export default function Forgetpassword() {
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"}>
      <VStack spacing="6">
        <Heading size="3xl" fontFamily="League Spartan">
          Reset Password
        </Heading>
        <Forgetpasswordform
          onButtonClick={(email: string) => {
            authentication.sendPwdResetEmail(email)
              .catch(error => console.log(error));
          }}
          buttonValue={"Recover"}
        />
      </VStack>
    </Flex>
  );
}
