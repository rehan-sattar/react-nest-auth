import { useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { Box, Button, Flex, Heading, Input, Link } from "@chakra-ui/react";
import { authService } from "../services/authentication";
import ErrorDialog from "../components/ErrorDialog";

export default function SignUp() {
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const signUpUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      await authService.signUp({ email, name, password });
      history.push("/home");
    } catch (err: any) {
      setErrorMessage(err.message[0]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setName(value);
  };

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setPassword(value);
  };

  const onCloseErrorDialog = () => {
    setErrorMessage("");
  };

  return (
    <Box marginTop="10">
      <Flex flexDirection="column" justify="center" alignItems="center">
        <Heading> Sign Up 🚀 </Heading>

        {errorMessage && <ErrorDialog errorMessage={errorMessage} onClose={onCloseErrorDialog} />}

        <Box width={["full", 400]}>
          <form onSubmit={signUpUser}>
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
                name="name"
                type="name"
                placeholder="User Name"
                variant="filled"
                required
                value={name}
                onChange={handleNameChange}
              />
            </Box>
            <Box mt="5">
              <Input
                name="password"
                type="password"
                placeholder="Password (must be 8 characters long)"
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
                Sign Up
              </Button>
            </Box>
          </form>
        </Box>
        <Box fontSize="lg" mt="8">
          Already have account?{" "}
          <RouterLink to="/login">
            <Link fontWeight="bold" textDecor="underline">
              Login
            </Link>
          </RouterLink>
        </Box>
      </Flex>
    </Box>
  );
}
