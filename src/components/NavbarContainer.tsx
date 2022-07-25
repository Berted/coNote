import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

interface Props {
  children?: ReactNode;
}

export default function NavbarContainer({ children, ...props }: Props) {
  return (
    <Flex
      as="nav"
      id="navbar-container"
      zIndex="50"
      align="center"
      justify="space-between"
      position="fixed"
      top="0"
      wrap="wrap"
      w="100%"
      mb={8}
      py={{ base: 3 }}
      px={{ base: 5 }}
      borderBottomWidth={1}
      borderStyle={"solid"}
      bg="white"
      {...props}
    >
      {children}
    </Flex>
  );
}

//color={["white", "white", "primary.700", "primary.700"]}
