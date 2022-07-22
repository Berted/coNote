import {
  Avatar,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  VStack,
  FormControl,
  FormLabel,
  Input,
  ModalFooter,
  useToast,
  FormHelperText,
  FormErrorMessage,
  InputGroup,
  InputLeftElement,
  Icon,
  ToastId,
  Flex,
  HStack,
  InputRightElement,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import { getDatabase, onValue, push, ref, set } from "firebase/database";
import { useEffect, useRef, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import PasswordInput from "./PasswordInput";
import { FiFile } from "react-icons/fi";

function EditUserButton() {
  const auth = useProvideAuth();
  const toast = useToast();
  const storage = firebase.storage();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [pass, setPass] = useState<string>(""); // current password
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  const [fullname, setFullname] = useState<string | undefined>(undefined);

  const [password, setPassword] = useState(""); // new password
  const [confirmPassword, setConfirmPassword] = useState("");
  const isError = confirmPassword.length > 0 && password !== confirmPassword;

  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | undefined>(undefined);

  const toastRef = useRef<ToastId>();

  const resetValues = () => {
    setPass("");
    setAuthenticated(false);
    setFullname(auth.userData?.fullname);
    setPassword("");
    setConfirmPassword("");
    setFile(undefined);
  };

  if (!auth.user) return <></>;

  const uid = auth.user.uid;
  const email = auth.user.email;

  return (
    <>
      <Button
        onClick={() => {
          resetValues();
          onOpen();
        }}
        boxShadow="base"
        padding="0px 1.5em"
        m={1.5}
      >
        Edit
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Edit User
            <ModalCloseButton />
          </ModalHeader>
          <ModalBody>
            <VStack>
              {!authenticated ? (
                <FormControl>
                  <FormLabel>Re-enter password</FormLabel>
                  <PasswordInput
                    value={pass}
                    onChange={(e: any) => setPass(e.target.value)}
                    type="password"
                  />
                </FormControl>
              ) : (
                <>
                  <FormControl>
                    <FormLabel>Email address</FormLabel>
                    <Input
                      value={email === null ? "" : email}
                      isDisabled={true}
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Your name</FormLabel>
                    <Input
                      value={fullname}
                      onChange={(e) => setFullname(e.target.value)}
                      type="fullname"
                      placeholder="John Doe"
                    />
                  </FormControl>
                  <FormControl id="password">
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <PasswordInput
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      type="password"
                    />
                  </FormControl>
                  <FormControl id="confirm-password" isInvalid={isError}>
                    <FormLabel htmlFor="confirm-password">
                      Confirm password
                    </FormLabel>
                    <PasswordInput
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                      type="password"
                    />
                    {!isError ? (
                      <FormHelperText>
                        <br></br>
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>
                        Password does not match.
                      </FormErrorMessage>
                    )}
                  </FormControl>

                  <FormControl>
                    <FormLabel>Change avatar</FormLabel>
                    <HStack>
                      <Avatar
                        src={
                          file
                            ? URL.createObjectURL(file)
                            : auth.userData?.img_url
                        }
                        bg="blue.400"
                        size="lg"
                        borderColor="blue.400"
                        borderWidth="2px"
                      />
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiFile} />
                        </InputLeftElement>
                        <input
                          type="file"
                          ref={inputRef}
                          accept={"image/*"}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            if (e.target.files) {
                              setFile(e.target.files[0]);
                            }
                          }}
                        />
                        <Input
                          placeholder={"Your file ..."}
                          onClick={() => {
                            if (inputRef.current !== null) {
                              inputRef.current.click();
                            }
                          }}
                          readOnly={true}
                          value={file ? file.name : ""}
                        />
                        <InputRightElement></InputRightElement>
                      </InputGroup>
                    </HStack>
                  </FormControl>
                </>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose} mr="3">
              Cancel
            </Button>
            {!authenticated ? (
              <Button
                onClick={() => {
                  if (auth.user) {
                    if (pass.length === 0) {
                      toast({
                        title: "Wrong password",
                        status: "error",
                        isClosable: true,
                      });
                      return;
                    }
                    auth
                      .reauthenticateUser(auth.user, pass)
                      .then((response) => {
                        setPassword(pass);
                        setConfirmPassword(pass);
                      })
                      .then((response) => {
                        setAuthenticated(true);
                      })
                      .catch((error) => {
                        let errorTitle = "";
                        switch (error.code) {
                          case "auth/wrong-password":
                            errorTitle = "Wrong password";
                            break;
                          case "auth/too-many-requests":
                            errorTitle = "Too many attempts!";
                            break;
                          default:
                            errorTitle = "Error";
                            console.log(error.code);
                            break;
                        }
                        toast({
                          title: errorTitle,
                          status: "error",
                          isClosable: true,
                        });
                      });
                  }
                }}
                colorScheme="blue"
              >
                Next
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                onClick={() => {
                  if (password !== confirmPassword) {
                    toast({
                      title: "Password confirmation doesn't match",
                      status: "error",
                      isClosable: true,
                    });
                    return;
                  }
                  if (auth.user) {
                    auth
                      .reauthenticateUser(auth.user, pass)
                      .then((response) => {
                        if (auth.user) {
                          auth
                            .changePassword(auth.user, password)
                            .then(async (response) => {
                              set(
                                ref(getDatabase(), `users/${uid}/fullname`),
                                fullname
                              )
                                .then(() => setFullname(fullname))
                                .catch((e) =>
                                  console.log("Set fullname error: " + e)
                                );
                              if (file && file.type.split("/")[0] === "image") {
                                toastRef.current = toast({
                                  title: "Saving...",
                                  status: "loading",
                                  isClosable: false,
                                  duration: null,
                                });
                                const storageRef = storage.ref(
                                  `users/${uid}/avatar`
                                );
                                await storageRef.put(file);
                                set(
                                  ref(getDatabase(), `users/${uid}/img_url`),
                                  await storageRef.getDownloadURL()
                                ).catch((e) =>
                                  console.log("Set url error: " + e)
                                );
                                if (toastRef.current) {
                                  toast.close(toastRef.current);
                                }
                              }
                            })
                            .then((response) => {
                              resetValues();
                              onClose();
                            })
                            .catch((error) => {
                              let errorTitle = "";
                              switch (error.code) {
                                case "auth/email-already-in-use":
                                  errorTitle = "Email is already in use";
                                  break;
                                case "auth/invalid-email":
                                  errorTitle = "Invalid email";
                                  break;
                                case "auth/weak-password":
                                  errorTitle =
                                    "Password must contain at least 6 characters";
                                  break;
                                default:
                                  console.log(error.code);
                                  errorTitle = "Error";
                                  break;
                              }
                              toast({
                                title: errorTitle,
                                status: "error",
                                isClosable: true,
                              });
                            });
                        }
                      })
                      .catch((error) => {
                        // This shouldn't trigger during intended use
                        let errorTitle = "";
                        switch (error.code) {
                          case "auth/wrong-password":
                            errorTitle = "Wrong password";
                            break;
                          case "auth/too-many-requests":
                            errorTitle = "Too many attempts!";
                            break;
                          default:
                            errorTitle = "Error";
                            console.log(error.code);
                            break;
                        }
                        toast({
                          title: errorTitle,
                          status: "error",
                          isClosable: true,
                        });
                      });
                  }
                }}
              >
                Save
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function UserButton(props: any) {
  const navigate = useNavigate();
  const auth = useProvideAuth();

  if (!auth.user) return <></>;
  else {
    return (
      <Popover placement="bottom-end" autoFocus={true}>
        <PopoverTrigger>
          <Avatar
            src={auth.userData?.img_url}
            bg="blue.400"
            transition="100ms"
            _hover={
              auth.userData?.img_url
                ? {
                    filter: "brightness(0.9)",
                  }
                : {
                    bg: "blue.500",
                  }
            }
            // _hover={{
            //   bg: "blue.600",
            // }}
            //_hover={{
            //  transform: "scale(1.05)",
            //}}
            role="button"
          />
        </PopoverTrigger>
        <PopoverContent boxShadow="sm">
          <PopoverArrow />
          <PopoverHeader>
            Hi,{" "}
            <b>{auth.userData === undefined ? "" : auth.userData.fullname}</b>!
          </PopoverHeader>
          <PopoverBody>
            <EditUserButton />
            <Button
              onClick={() => {
                // Navigates to dashboard first so any components can run unsubscription events that rely on authentication.
                // IMPORTANT: Make sure Dashboard does not have any unsubscription events that rely on auth.
                navigate("/dashboard");
                auth
                  .signout()
                  .then((response: any) => navigate("/"))
                  .catch((error: any) => console.log(error));
              }}
              colorScheme="blue"
              boxShadow="base"
              padding="0px 1.5em"
              m={1.5}
            >
              Logout
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
}
