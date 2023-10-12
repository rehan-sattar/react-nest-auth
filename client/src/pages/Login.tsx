import { useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { Box, Button, Flex, Heading, Input, Link } from "@chakra-ui/react";

import ErrorDialog from "../components/ErrorDialog";
import { authService } from "../services/authentication";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
  };

  const SignInUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.signIn({ email, password });
      history.push("/home");
    } catch (err: any) {
      setErrorMessage(err.message[0]);
    } finally {
      setLoading(false);
    }
  };

  const onCloseErrorDialog = () => {
    setErrorMessage("");
  };

  return (
    <Box marginTop="10">
      <Flex flexDirection="column" justify="center" alignItems="center">
        <Heading> Login 🚀 </Heading>

        {errorMessage && <ErrorDialog errorMessage={errorMessage} onClose={onCloseErrorDialog} />}

        <Box width={["full", 400]}>
          <form onSubmit={SignInUser}>
            <Box mt="5">
              <Input
                name="email"
                type="email"
                placeholder="Email"
                variant="filled"
                required
                value={email}
                onChange={handleEmailChange}
              />
            </Box>
            <Box mt="5">
              <Input
                name="password"
                type="password"
                placeholder="Password"
                variant="filled"
                required
                value={password}
                onChange={handlePasswordChange}
              />
            </Box>
            <Box mt="5">
              <Button
                type="submit"
                variant="solid"
                colorScheme="cyan"
                width="full"
                isLoading={loading}
              >
                Login
              </Button>
            </Box>
          </form>
        </Box>
        <Box fontSize="lg" mt="8">
          Do not have account?{" "}
          <RouterLink to="/">
            <Link fontWeight="bold" textDecor="underline">
              Sign Up
            </Link>
          </RouterLink>
        </Box>
      </Flex>
    </Box>
  );
}
