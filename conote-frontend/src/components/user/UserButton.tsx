import {
  Avatar,
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";

export default function UserButton(props: any) {
  const navigate = useNavigate();
  const auth = useProvideAuth();

  if (!auth.user) return <></>;
  else {
    return (
      <Popover placement="bottom-end" autoFocus={false}>
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
            <Button
              onClick={() => {
                auth
                  .signout()
                  .then((response: any) => navigate("/"))
                  .catch((error: any) => console.log(error));
              }}
              colorScheme="blue"
              boxShadow="base"
              padding="0px 1.5em"
            >
              Logout
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    );
  }
}
