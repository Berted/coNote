import {
  AvatarGroup,
  Avatar,
  AvatarBadge,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Table,
  TableContainer,
  Tbody,
  Tr,
  Td,
  Text,
  PopoverArrow,
  Divider,
  Link,
} from "@chakra-ui/react";
import { IoPerson } from "react-icons/io5";

function UserPresencePopover({ userPresence, ...props }: any) {
  return (
    <PopoverContent w="sm">
      <PopoverArrow />
      <PopoverBody textAlign="left">
        <Text fontSize="xs" mb={1} textColor="blue.500">
          <b>Active Users</b>
        </Text>
        <TableContainer marginTop="-10px">
          <Table size="sm">
            <Tbody>
              <Tr>
                <Td></Td>
                <Td></Td>
                <Td></Td>
              </Tr>
              {Object.keys(userPresence).map((x) => {
                return (
                  <Tr>
                    <Td paddingRight="0px" paddingLeft="6px" width="32px">
                      <Avatar
                        fontWeight="600"
                        src={userPresence[x].img_url}
                        bg={userPresence[x].color}
                        borderColor={userPresence[x].color}
                        borderWidth="2px"
                        name={userPresence[x].name}
                        color="whiteAlpha.900"
                        key={"user-presence-avatar-" + userPresence[x].uid}
                        icon={<IoPerson />}
                        size="sm"
                      ></Avatar>
                    </Td>
                    <Td>
                      <b>{userPresence[x].name}</b>
                    </Td>
                    <Td width="45px">
                      <Badge colorScheme="green" variant="solid">
                        Online
                      </Badge>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </PopoverBody>
    </PopoverContent>
  );
}

export default function UserPresenceAvatars({ userPresence, ...props }: any) {
  return userPresence ? (
    <Popover placement="bottom-end">
      <PopoverTrigger>
        <AvatarGroup
          max={3}
          size="sm"
          transition="100ms"
          _hover={{
            filter: "brightness(0.9)",
          }}
          mr="1px"
          role="button"
        >
          {Object.keys(userPresence).map((x) => {
            return (
              <Avatar
                fontWeight="600"
                src={userPresence[x].img_url}
                bg={userPresence[x].color}
                borderColor={userPresence[x].color}
                name={userPresence[x].name}
                color="whiteAlpha.900"
                key={"user-presence-avatar-" + x}
                icon={<IoPerson />}
                pointerEvents="none"
              ></Avatar>
            );
          })}
        </AvatarGroup>
      </PopoverTrigger>
      <UserPresencePopover userPresence={userPresence} />
    </Popover>
  ) : (
    <></>
  );
}
