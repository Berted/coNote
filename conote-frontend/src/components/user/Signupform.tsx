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

function PasswordInput(props: any) {
  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);

  return (
    <InputGroup size="md">
      <Input
        onChange={(e) => props.onChange(e)}
        pr="4.5rem"
        type={show ? "text" : "password"}
        placeholder={show ? "Your (visible) password" : "Your password"}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick}>
          {show ? "Hide" : "Show"}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

export default function Signupform(props: any) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
      <FormControl id="fullname">
        <FormLabel htmlFor="fullname">Your name</FormLabel>
        <Input
          onChange={(e) => setFullname(e.target.value)}
          type="fullname"
          placeholder="John Doe"
        />
      </FormControl>
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
        <PasswordInput onChange={(e: any) => setPassword(e.target.value)} />
      </FormControl>
      <Button
        onClick={() => props.onButtonClick(email, password, { fullname: fullname })}
        colorScheme="blue"
        boxShadow="base"
        padding="0px 1.5em"
      >
        {props.buttonValue}
      </Button>
    </VStack>
  );
}
