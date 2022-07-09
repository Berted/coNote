import {
  Checkbox,
  FormControl,
  FormHelperText,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
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
  Tooltip,
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
import { IoShareSocial, IoPersonRemove, IoClipboard } from "react-icons/io5";

import { get, set, onValue, getDatabase, ref } from "firebase/database";
import { useProvideAuth } from "hooks/useAuth";
import EditorViewSlider from "./EditorViewSlider";
import ExportButton from "./ExportButton";
import { AiOutlineConsoleSql } from "react-icons/ai";

function validateEmail(email: string) {
  return email.match(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
}

// The following assumes the Owner is never modified from this method.
async function modifyUserRole(docID: string, uid: string, role: string | null) {
  let editDocContent = new Promise(() => {});

  if (role === "editor") {
    editDocContent = set(
      ref(getDatabase(), `users/${uid}/shared_documents/${docID}`),
      true
    );
  } else {
    editDocContent = set(
      ref(getDatabase(), `users/${uid}/shared_documents/${docID}`),
      null
    );
  }

  return Promise.all([
    set(ref(getDatabase(), `docs/${docID}/roles/${uid}`), role),
    editDocContent,
  ]);
}

function EditUserRoleDropdown({ uid, role, docID, ...props }: any) {
  const toast = useToast();

  return (
    <Select
      value={role.toLowerCase()}
      size="xs"
      fontSize="sm"
      variant="flushed"
      onChange={(e) => {
        modifyUserRole(docID, uid, e.target.value).catch((e) => {
          toast({
            title: "Error",
            description:
              "Unable to modify user role. Please report bug to developer. Error: " +
              e,
            status: "error",
            duration: 7_500,
            isClosable: true,
          });
        });
      }}
    >
      <option value="editor">Editor</option>
      <option value="viewer">Viewer</option>
    </Select>
  );
}

function DeleteUserRoleButton({ uid, docID, ...props }: any) {
  const toast = useToast();

  return (
    <IconButton
      aria-label={"delete user " + uid}
      icon={<IoPersonRemove />}
      colorScheme="blue"
      variant="ghost"
      size="xs"
      onClick={(e) => {
        modifyUserRole(docID, uid, null).catch((e) => {
          toast({
            title: "Error",
            description:
              "Unable to delete user. Please report bug to developer. Error: " +
              e,
            status: "error",
            duration: 7_500,
            isClosable: true,
          });
        });
      }}
    />
  );
}

function AddCollaboratorForm({ docID, docRoles, disabled, ...props }: any) {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  const onSubmit = () => {
    if (!docRoles) {
      toast({
        title: "Error",
        description:
          "We're unable to retrieve the list of user roles. Please wait for a moment or check your internet connection.",
        status: "error",
        duration: 5_000,
        isClosable: true,
      });
    }
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
          } else if (docRoles.map((k: any) => k[0]).includes(snapshot.val())) {
            toast({
              title: "Warning",
              description:
                "The user already collaborates in this document. You may use the dropdown menu in the table to modify their role.",
              status: "warning",
              duration: 5_000,
              isClosable: true,
            });
          } else {
            modifyUserRole(docID, snapshot.val(), role);
            setEmail("");
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
    <FormControl paddingX="1" isDisabled={disabled} marginBottom="8px">
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
            onKeyDown={(e) => {
              if (e.key === "Enter") e.preventDefault();
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
          {disabled
            ? "You must be the document owner to add collaborators."
            : "Press enter to add a collaborator."}
        </FormHelperText>
      </Box>
    </FormControl>
  );
}

function UserRoleTable({ docID, docRoles, isOwner, ...props }: any) {
  return (
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
                <Tr h="10">
                  <Td>
                    <b>{docRoles[key][1]}</b>
                  </Td>
                  <Td>
                    {isOwner && docRoles[key][2] !== "Owner" ? (
                      <EditUserRoleDropdown
                        uid={docRoles[key][0]}
                        role={docRoles[key][2]}
                        docID={docID}
                      />
                    ) : (
                      docRoles[key][2]
                    )}
                  </Td>
                  <Td>
                    {isOwner && docRoles[key][2] !== "Owner" && (
                      <DeleteUserRoleButton
                        uid={docRoles[key][0]}
                        docID={docID}
                      />
                    )}
                  </Td>
                </Tr>
              );
            })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function PublicViewCheckbox({ docID, isOwner, ...props }: any) {
  const [isPublic, setIsPublic] = useState(false);
  const auth = useProvideAuth();
  const toast = useToast();

  useEffect(() => {
    const unsub = onValue(
      ref(getDatabase(), `docs/${docID}/public`),
      (snapshot) => {
        console.log("CAUGHT: " + snapshot.val() + " " + typeof snapshot.val());
        if (snapshot.val() === true) {
          console.log("TRIGGERED");
          setIsPublic(true);
        } else setIsPublic(false);
      },
      (e) => {
        toast({
          title: "Error",
          description: "Error getting document public status: " + e,
          status: "error",
          duration: 5_000,
          isClosable: true,
        });
      }
    );
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.user, docID]);

  return (
    <Checkbox
      size="sm"
      disabled={!isOwner}
      isChecked={isPublic}
      onChange={(e) => {
        set(ref(getDatabase(), `docs/${docID}/public`), e.target.checked).catch(
          (e) => {
            toast({
              title: "Error",
              description: "Error setting document public status: " + e,
              status: "error",
              duration: 5_000,
              isClosable: true,
            });
          }
        );
      }}
    >
      Allow anyone with a link to view this document.
    </Checkbox>
  );
}

function DocShareButton({ docID, ...props }: any) {
  const auth = useProvideAuth();
  const [docRoles, setDocRoles] = useState<any>();
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [clipboardLabel, setClipboardLabel] = useState<String>(
    "Copies document link to clipboard"
  );

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
    <Popover placement="bottom-end" autoFocus={true}>
      <PopoverTrigger>
        <IconButton
          colorScheme="blue"
          variant="ghost"
          fontSize="lg"
          icon={<IoShareSocial />}
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
          <UserRoleTable docID={docID} docRoles={docRoles} isOwner={isOwner} />
          <Text fontSize="xs" mt={4} mb={2} textColor="blue.500">
            <b>Add Collaborators</b>
          </Text>
          <AddCollaboratorForm
            docID={docID}
            docRoles={docRoles}
            disabled={!isOwner}
          />

          <Text fontSize="xs" mt={4} mb={2} textColor="blue.500">
            <b>Additional Settings</b>
          </Text>
          <PublicViewCheckbox docID={docID} isOwner={isOwner} />
        </PopoverBody>
        <PopoverFooter textAlign="right">
          <Tooltip
            label={clipboardLabel}
            placement="bottom-start"
            closeDelay={500}
          >
            <IconButton
              aria-label="copy share link"
              icon={<IoClipboard />}
              colorScheme="blue"
              size="sm"
              variant="ghost"
              onClick={(e) => {
                navigator.clipboard.writeText(window.location.href);
                setClipboardLabel("Copied!");
                setTimeout(
                  () => setClipboardLabel("Copy document link to clipboard."),
                  500
                );
              }}
            ></IconButton>
          </Tooltip>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

export default function EditorNavbar({
  docID,
  docContent,
  editSize,
  setEditSize,
  ...props
}: any) {
  return (
    <NavbarContainer {...props}>
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

      <Flex align="center" w="40vw">
        <EditorViewSlider editSize={editSize} setEditSize={setEditSize} />
      </Flex>

      <HStack spacing="4">
        <HStack align="center" spacing="1">
          <ExportButton docContent={docContent} />
          <DocShareButton docID={docID} />
        </HStack>
        <UserButton />
      </HStack>
    </NavbarContainer>
  );
}
