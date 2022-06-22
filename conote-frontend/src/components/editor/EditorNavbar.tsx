import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  PopoverAnchor,
  HStack,
  Heading,
  Flex,
  IconButton,
} from "@chakra-ui/react";

import { Link as RouteLink } from "react-router-dom";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import UserButton from "components/user/UserButton";
import { IoShare } from "react-icons/io5";

function DocShareButton({ docID, ...props }: any) {
  return (
    <Popover>
      <PopoverTrigger>
        <IconButton
          colorScheme="blue"
          variant="ghost"
          icon={<IoShare />}
          aria-label="share document"
        />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <Heading size="md">Share Note</Heading>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  );
}

export default function EditorNavbar({ docID, ...props }: any) {
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
          <DocShareButton docID={docID} />
        </Flex>
        <UserButton />
      </HStack>
    </NavbarContainer>
  );
}
