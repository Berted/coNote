import { Text, chakra } from "@chakra-ui/react";

export default function Logo({ ...props }) {
  return (
    <Text fontFamily="League Spartan" {...props}>
      <chakra.span color="blue.700">co</chakra.span>
      <chakra.span color="blue.400">Note</chakra.span>
    </Text>
  );
}
