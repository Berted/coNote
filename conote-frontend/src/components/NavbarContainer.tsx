import React, { ReactNode } from "react";
import { Flex } from "@chakra-ui/react";

interface Props {
  children?: ReactNode;
}

export default function NavbarContainer({ children, ...props }: Props) {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={8}
      py={{ base: 3 }}
      px={{ base: 5 }}
      borderBottomWidth={1}
      borderStyle={"solid"}
      bg={["primary.500", "primary.500", "transparent", "transparent"]}
      {...props}
    >
      {children}
    </Flex>
  );
}

//color={["white", "white", "primary.700", "primary.700"]}
