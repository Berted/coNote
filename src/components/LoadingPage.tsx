import { VStack, Spinner, Text } from "@chakra-ui/react";

export default function LoadingPage({
  msg,
  spinnerSize,
  fontSize,
  ...props
}: any) {
  return (
    <VStack spacing="3" {...props}>
      <Spinner
        size={spinnerSize || "xl"}
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="blue.500"
      />
      <Text fontSize={fontSize || "xl"}>{msg || "Loading..."}</Text>
    </VStack>
  );
}
