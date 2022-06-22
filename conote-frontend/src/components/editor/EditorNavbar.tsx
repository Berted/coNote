import { HStack, Flex } from "@chakra-ui/react";

import { Link as RouteLink } from "react-router-dom";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import UserButton from "components/user/UserButton";

export default function EditorNavbar(props: any) {
  return (
    <NavbarContainer>
      <Logo
        fontSize="24pt"
        marginBottom="-0.4em"
        transition="transform 100ms linear"
        _hover={{
          transform: "scale(1.05)",
        }}
        as={RouteLink}
        to="/"
      />
      <HStack spacing="4">
        <Flex align="center">
          <UserButton />
        </Flex>
      </HStack>
    </NavbarContainer>
  );
}
