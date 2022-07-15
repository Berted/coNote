import {
  Heading,
  VStack,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  FormHelperText,
  FormErrorMessage,
  Container,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import { Helmet } from "react-helmet";
import PasswordInput from "./PasswordInput";

export default function ResetPassword() {
  const toast = useToast();
  const navigate = useNavigate();
  const authentication = useProvideAuth();

  const [email, setEmail] = useState("");
  const [errorTitle, setErrorTitle] = useState("Password reset code is invalid.");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const isError = confirmPassword.length > 0 && password !== confirmPassword;

  const urlParams = new URLSearchParams(window.location.search);
  const oobCode = urlParams.get('oobCode');

  useEffect(() => {
    if (oobCode !== null) {
      authentication.verifyPwdResetCode(oobCode)
        .then(e => {
          console.log(e);
          setEmail(e);
          setErrorTitle("");
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/expired-action-code":
              setErrorTitle("Password reset code has expired.");
              break;
            case "auth/invalid-action-code":
              setErrorTitle("Password reset code is invalid.");
              break;
            case "auth/user-not-found":
              setErrorTitle("User not found");
              break;
            default:
              console.log(error.code);
              setErrorTitle("Password reset code is invalid.");
              break;
          }
        })
    }
  }, [oobCode]);

  return (
    <>
      <Helmet>
        <title>Reset Password</title>
      </Helmet>
      <Flex minH={"100vh"} align={"center"} justify={"center"}>
        <VStack spacing="6">
          <Heading size="3xl" fontFamily="League Spartan">
            Reset Password
          </Heading>
          {errorTitle.length === 0 ?
            (
              <VStack
                boxShadow="base"
                borderRadius="md"
                padding="7"
                spacing="5"
                w="70vw"
                minW="340px"
                maxW="lg"
              >
                <FormControl id="email">
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <Input
                    value={email}
                    isDisabled={true}
                    type="email"
                    placeholder="johndoe@example.com"
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
                <FormControl id="confirm-password" isInvalid={isError} >
                  <FormLabel htmlFor="confirm-password">Confirm password</FormLabel>
                  <PasswordInput
                    value={confirmPassword}
                    onChange={(e: any) => setConfirmPassword(e.target.value)}
                    type="password"
                  />
                  {!isError ?
                    (
                      <FormHelperText>
                        <br></br>
                      </FormHelperText>
                    ) : (
                      <FormErrorMessage>
                        Password does not match.
                      </FormErrorMessage>
                    )
                  }
                </FormControl>
                <Button
                  onClick={() => {
                    oobCode === null ?
                      toast({
                        title: "Password reset code is invalid",
                        status: "error",
                        isClosable: true,
                      }) :
                      password !== confirmPassword ?
                        toast({
                          title: "Password confirmation doesn't match",
                          status: "error",
                          isClosable: true,
                        }) :
                        authentication
                          .confirmPwdReset(oobCode, password)
                          .then((response) => {
                            navigate("/login");
                            toast({
                              title: "Password successfully reset",
                              status: "info",
                              isClosable: true,
                            });
                          })
                          .catch((error) => {
                            let errorTitle = "";
                            switch (error.code) {
                              case "auth/expired-action-code":
                                errorTitle = "Password reset code has expired.";
                                break;
                              case "auth/invalid-action-code":
                                errorTitle = "Password reset code is invalid.";
                                break;
                              case "auth/user-not-found":
                                errorTitle = "User not found";
                                break;
                              case "auth/weak-password":
                                errorTitle = "Password must contain at least 6 characters";
                                break;
                              default:
                                console.log(error.code);
                                errorTitle = "Password reset code is invalid.";
                                break;
                            }
                            toast({
                              title: errorTitle,
                              status: "error",
                              isClosable: true,
                            });
                          });
                  }}
                  colorScheme="blue"
                  boxShadow="base"
                  padding="0px 1.5em"
                >
                  Reset
                </Button>
              </VStack>
            ) : (
              <VStack
                boxShadow="base"
                borderRadius="md"
                padding="7"
                spacing="5"
                w="70vw"
                minW="340px"
                maxW="lg"
              >
                <Container>
                  {errorTitle}
                </Container>
              </VStack>
            )}
        </VStack>
      </Flex>
    </>
  );
}
