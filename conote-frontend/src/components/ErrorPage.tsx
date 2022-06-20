import { Flex, Heading, Text, Link } from "@chakra-ui/react";
import Logo from "./Logo";
import { useParams } from "react-router-dom";
import { Link as RouteLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const ErrorMsg: any = {
  403: "You do not have the correct permissions to access the resource. Please contact the owner of the resource to resolve this issue.",
  404: "The resource that you attempted to access could not be found.",
  500: "Internal Server Error. Please contact the website administrator.",
};

const defaultRemainingTime = 7;

export default function ErrorPage() {
  const navigate = useNavigate();
  const params = useParams();
  const [remainingTime, setRemainingTime] = useState(defaultRemainingTime);

  useEffect(() => {
    const deadTime = Date.now() + defaultRemainingTime * 1_000;
    const interval = setInterval(() => {
      console.log("Test");
      setRemainingTime(Math.round((deadTime - Date.now()) / 1000));
      if (Date.now() >= deadTime) {
        navigate("/");
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex minH="100vh" p="4" flexDirection="column">
      <Logo fontSize="52pt" textShadow="0px 1px 3px #00000033" mt="7vh" />
      <Heading size="4xl" fontFamily="League Spartan" mt="13vh">
        {params.errorID}
      </Heading>
      <Heading fontFamily="League Spartan" mt="1em">
        We're Sorry!
      </Heading>
      <Text>
        {params.errorID ? ErrorMsg[params.errorID] || ErrorMsg[500] : ""}
      </Text>
      <Text mt="20vh">
        You'll be redirected to home in {remainingTime} seconds. Alternatively,
        you can{" "}
        <Link
          textDecor="underline"
          _hover={{
            textColor: "blue.500",
          }}
          as={RouteLink}
          to="/"
        >
          click here
        </Link>{" "}
        to be redirected immediately.
      </Text>
    </Flex>
  );
}
