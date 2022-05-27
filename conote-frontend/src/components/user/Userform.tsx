import {
  FormControl,
  FormLabel,
  Input,
  VStack,
  InputGroup,
  InputRightElement,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";

export default function Userform(props: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

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
      <FormControl id="password">
        <FormLabel htmlFor="email">Password</FormLabel>
        <InputGroup size="md">
          <Input
            onChange={(e) => setPassword(e.target.value)}
            pr="4.5rem"
            type={show ? "text" : "password"}
            placeholder={show ? "Your (visible) password" : "Your password"}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={() => setShow(!show)}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        onClick={() => props.onButtonClick(email, password)}
        colorScheme="blue"
        boxShadow="base"
        padding="0px 1.5em"
      >
        {props.buttonValue}
      </Button>
    </VStack>
  );
}
