import { Heading, VStack, Link, Text, Box, SimpleGrid } from "@chakra-ui/react";

import { Link as RouteLink } from "react-router-dom";

import { useProvideAuth } from "hooks/useAuth";

import DashboardNavbar from "./DashboardNavbar";
import DocCard from "./DocCard";

export default function Dashboard() {
  const { userData, ...auth } = useProvideAuth();

  return (
    auth.user && (
      <Box minH="100vh">
        <DashboardNavbar />

        <SimpleGrid minChildWidth="240px" paddingX="7" marginTop="2" gap="5">
          {userData !== undefined &&
            Object.keys(userData.owned_documents).map((item) => {
              return <DocCard key={'doc-card-' + item} docID={item} />;
            })}
        </SimpleGrid>
      </Box>
    )
  );
}

/*
  Deprecated.
*/
function PlaceholderText({ auth, ...props }: any) {
  return (
    <VStack spacing="6">
      <Heading size="3xl" fontFamily="League Spartan">
        Hi, {auth.user.email}!
      </Heading>
      <Text maxW="50%">
        Sadly, we have not implemented an interface for file management and
        storage. However, you can try out a basic version of{" "}
        <Link
          textDecor="underline"
          _hover={{
            textColor: "blue.500",
          }}
          as={RouteLink}
          to="/editor"
        >
          the editor!
        </Link>
      </Text>
    </VStack>
  );
}
