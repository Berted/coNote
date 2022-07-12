import {
  Button,
  HStack,
  Flex,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  VStack,
  Container,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  DrawerHeader,
  FormHelperText,
  FormErrorMessage,
  Select,
  Box,
  Stack,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";

import UserButton from "./UserButton";
import { useState } from "react";
import { Link as RouteLink } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";

import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import { IoCreateSharp, IoFilterSharp } from "react-icons/io5";
import {
  set,
  ref,
  getDatabase,
  push,
  serverTimestamp,
} from "firebase/database";
import ColorfulTag from "./ColorfulTag";

function NewDocButton(props: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");
  const { userData, ...auth } = useProvideAuth();

  const onNewDoc = (e: any) => {
    if (!auth.user) return;
    const newDocRef = push(ref(getDatabase(), `docs`), {
      public: false,
      roles: {
        [auth.user.uid]: "owner",
      },
      timestamp: serverTimestamp(),
      title: title,
    });

    set(
      ref(
        getDatabase(),
        `users/${auth.user?.uid}/owned_documents/${newDocRef.key}`
      ),
      true
    ).catch((e) => {
      console.log("Set Error: " + e); // TODO: Alert notification?
    });
    setTitle("");
    onClose();
  };

  return (
    <>
      <Button leftIcon={<IoCreateSharp />} colorScheme="blue" onClick={onOpen}>
        New Note
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create a New Note</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl id="title">
              <FormLabel htmlFor="title">Title</FormLabel>
              <Input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                placeholder="Your note title"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" paddingX="1.5em" onClick={onNewDoc}>
              Create
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function SortFilterDrawer({
  tags,
  setTags,
  filterOption,
  setFilterOption,
  sorter,
  setSorter,
  ...props
}: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [input, setInput] = useState("");
  const [tagError, setTagError] = useState("");

  const handleTagCreate = (value: string) => {
    setTags([...tags, value]);
  };

  const handleTagDelete = (value: string) => {
    setTags((tags as string[]).filter((x) => x !== value));
  };

  return (
    <>
      <Button leftIcon={<IoFilterSharp />} colorScheme="gray" onClick={onOpen}>
        {"Sort & Filter"}
      </Button>
      <Drawer onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent flexDirection="column">
          <DrawerHeader>{"Sort & Filter"}</DrawerHeader>
          <DrawerBody>
            <Stack spacing="24px">
              <Box>
                <FormLabel fontWeight="bold">Sort</FormLabel>
                <Select
                  value={sorter}
                  onChange={(e) => setSorter(e.target.value)}
                >
                  <option value="time">Most Recent</option>
                  <option value="title-asc">Title Ascending</option>
                  <option value="title-dec">Title Descending</option>
                </Select>
              </Box>
              <Box>
                <FormLabel fontWeight="bold">Filter</FormLabel>
                <VStack>
                  <Container>
                    {tags !== undefined &&
                      Object.values(tags).map((tag: any) => {
                        return (
                          <ColorfulTag
                            key={"filter-tag-" + tag}
                            tag={tag}
                            handleTagDelete={handleTagDelete}
                          />
                        );
                      })}
                  </Container>
                  <FormControl isInvalid={tagError.length !== 0}>
                    <Input
                      autoFocus
                      placeholder="Type new tags here..."
                      value={input}
                      onChange={({ target: { value } }) => {
                        value = value.replaceAll(",", "").trim();
                        setInput(value);
                      }}
                      onKeyDown={(e) => {
                        let {
                          key,
                          currentTarget: { value },
                        } = e;
                        value = value.replaceAll(",", "").trim().toLowerCase();
                        switch (key) {
                          case "Tab":
                          case "Enter":
                          case ",":
                            e.preventDefault();
                            if (value.length === 0) {
                              setTagError("Empty tag");
                            } else {
                              if (tags.includes(value)) {
                                setTagError("Tag already exists");
                              } else {
                                setInput("");
                                setTagError("");
                                handleTagCreate(value);
                              }
                            }
                            break;
                          case "Backspace":
                            if (value.length === 0) {
                              e.preventDefault();
                              if (tags.length === 0) {
                                setTagError("No tags to delete");
                              } else {
                                let lastTag = Object.values(
                                  tags
                                ).pop() as string;
                                handleTagDelete(lastTag);
                                setInput(lastTag);
                                setTagError("");
                              }
                            }
                            break;
                          default:
                            setTagError("");
                            break;
                        }
                      }}
                      variant="outline"
                    />
                    {tagError.length === 0 ? (
                      <FormHelperText>
                        Press Enter key to add tag
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>{tagError}</FormErrorMessage>
                    )}
                  </FormControl>
                  <Select
                    value={filterOption}
                    onChange={(e) => setFilterOption(e.target.value)}
                  >
                    <option value="and">Contain all of the tags</option>
                    <option value="or">Contain one of the tags</option>
                  </Select>
                </VStack>
              </Box>
            </Stack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function DocumentTypeTab({ setDocType, ...props }: any) {
  return (
    <Tabs
      variant="soft-rounded"
      colorScheme="blue"
      onChange={(idx) => setDocType(idx === 0 ? "owned" : "shared")}
    >
      <TabList>
        <Tab>Owned</Tab>
        <Tab>Shared</Tab>
      </TabList>
    </Tabs>
  );
}

export default function DashboardNavbar({ setDocType, ...props }: any) {
  return (
    <NavbarContainer>
      <HStack spacing="7">
        <Logo
          fontSize="24pt"
          marginBottom="-0.25em"
          transition="transform 100ms linear"
          _hover={{
            transform: "scale(1.05)",
          }}
          as={RouteLink}
          to="/"
        />
        <DocumentTypeTab setDocType={setDocType} />
      </HStack>
      <HStack spacing="4">
        <SortFilterDrawer {...props} />
        <NewDocButton />
        <Flex align="center">
          <UserButton />
        </Flex>
      </HStack>
    </NavbarContainer>
  );
}
