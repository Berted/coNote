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
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import { getDatabase, onValue, ref, set } from "firebase/database";
import { useEffect, useState } from "react";

function EditUserButton() {
  const auth = useProvideAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [fullname, setFullname] = useState<string | undefined>(undefined);

  if (!auth.user) return <></>;

  const uid = auth.user.uid;
  const email = auth.user.email;

  return (
    <>
      <Button
        onClick={() => {
          setFullname(auth.userData?.fullname);
          onOpen();
        }}
        boxShadow="base"
        padding="0px 1.5em"
        m={1}
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
              <FormControl>
                <FormLabel>
                  Email address
                </FormLabel>
                <Input
                  value={email === null ? "" : email}
                  isDisabled={true}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Your name
                </FormLabel>
                <Input
                  value={fullname}
                  onChange={e => setFullname(e.target.value)}
                  type="fullname"
                  placeholder="John Doe"
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={() => {
              set(ref(getDatabase(), `users/${uid}/fullname`), fullname)
                .then(() => setFullname(fullname))
                .catch((e) => console.log("Set fullname error: " + e));
              onClose();
            }}>
              Save
            </Button>
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
            bg="blue.400"
            transition="background-color 100ms linear"
            _hover={{
              bg: "blue.600",
            }}
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
            <EditUserButton
            />
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
              m={1}
            >
              Logout
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
}
