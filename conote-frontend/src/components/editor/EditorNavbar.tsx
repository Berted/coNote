import {
  FormControl,
  FormLabel,
  FormHelperText,
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
  Input,
  InputGroup,
  InputRightAddon,
  Select,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  FormErrorMessage,
  Box,
  useToast,
} from "@chakra-ui/react";

import { useEffect, useState } from "react";
import { Link as RouteLink } from "react-router-dom";
import NavbarContainer from "components/NavbarContainer";
import Logo from "components/Logo";
import UserButton from "components/user/UserButton";
import { IoShare } from "react-icons/io5";

import { get, set, onValue, getDatabase, ref } from "firebase/database";
import { useProvideAuth } from "hooks/useAuth";

function validateEmail(email: string) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

function DeleteUserRoleButton({ uid, docID, ...props }: any) {}

function AddCollaboratorForm({ docID, ...props }: any) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  const onSubmit = () => {
    if (validateEmail(email)) {
      let filteredEmail = email.toLowerCase().replaceAll(".", ",");
      get(ref(getDatabase(), `email_to_uid/${filteredEmail}`)).then(
        (snapshot) => {
          if (!snapshot.exists()) {
            toast({
              title: "Error",
              description:
                "We can't find the e-mail in our database. Please make sure you entered the correct e-mail. (Milestone 2 note: In case of issues due to mismatched database structures, try logging in to the e-mail to be collaborated to fix this issue)",
              status: "error",
              duration: 8_000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Success",
              description: "UID: " + snapshot.val(),
              status: "success",
              duration: 5_000,
              isClosable: true,
            });
          }
        }
      );
    } else {
      toast({
        title: "Error",
        description:
          "The e-mail you entered is invalid. Please enter a valid e-mail",
        status: "error",
        duration: 5_000,
        isClosable: true,
      });
    }
  };

  return (
    <FormControl paddingX="1">
      <InputGroup
        size="sm"
        variant="flushed"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit();
          }
        }}
      >
        <Input
          placeholder="Collaborator's e-mail here"
          size="sm"
          variant="flushed"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        ></Input>
        <InputRightAddon w="25%">
          <Select
            size="sm"
            variant="flushed"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
            }}
          >
            <option value="editor">Editor</option>
            <option value="viewer">Viewer</option>
          </Select>
        </InputRightAddon>
      </InputGroup>
      <Box mt="-5px">
        <FormErrorMessage fontSize="xs"></FormErrorMessage>
        <FormHelperText fontSize="xs">
          Press enter to add a collaborator.
        </FormHelperText>
      </Box>
    </FormControl>
  );
}

function DocShareButton({ docID, ...props }: any) {
  const auth = useProvideAuth();
  const [docRoles, setDocRoles] = useState<any>();
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Effect to get user roles.
  useEffect(() => {
    const unsub = onValue(
      ref(getDatabase(), `docs/${docID}/roles`),
      (snapshot) => {
        let snapvar = snapshot.val();
        setDocRoles(
          Object.keys(snapvar).map((key, i) => {
            return [
              key,
              key,
              snapvar[key].charAt(0).toUpperCase() + snapvar[key].slice(1),
            ];
          })
        );
        if (auth.user && snapvar[auth.user.uid] === "owner") {
          setIsOwner(true);
        }
        for (const x in snapvar) {
          get(ref(getDatabase(), `users/${x}/fullname`)).then((snapshot) => {
            setDocRoles((val: any) => {
              return val.map((element: any) => {
                if (element[0] === x)
                  return [element[0], snapshot.val(), element[2]];
                else return element;
              });
            });
          });
        }
      }
    );
    return () => unsub();
  }, [auth.user, docID]);

  return (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <IconButton
          colorScheme="blue"
          variant="ghost"
          icon={<IoShare />}
          aria-label="share document"
        />
      </PopoverTrigger>
      <PopoverContent w="md">
        <PopoverArrow />
        <PopoverHeader>
          <Heading size="md">Share Note</Heading>
        </PopoverHeader>
        <PopoverBody textAlign="left">
          <Text fontSize="xs" mb={1} textColor="blue.500">
            <b>Collaborators</b>
          </Text>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Th>User</Th>
                <Th>Role</Th>
                <Th></Th>
              </Thead>
              <Tbody>
                {docRoles !== undefined &&
                  Object.keys(docRoles).map((key, i) => {
                    return (
                      <Tr>
                        <Td>
                          <b>{docRoles[key][1]}</b>
                        </Td>
                        <Td>{docRoles[key][2]}</Td>
                        <Td></Td>
                      </Tr>
                    );
                  })}
              </Tbody>
            </Table>

            <Text fontSize="xs" mt={4} mb={2} textColor="blue.500">
              <b>Add Collaborators</b>
            </Text>
            <AddCollaboratorForm />
          </TableContainer>
        </PopoverBody>
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