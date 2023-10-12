import { Box, Button, Flex, Heading, Input, Link } from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import ErrorDialog from "../components/ErrorDialog";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const history = useHistory();

  const signUpUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      //   Call API At This point!
      history.push("/home");
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEmail(value);
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
                name="password"
                type="password"
                placeholder="Password (must be 6 characters long)"
                variant="filled"
                minLength={8}
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
                disabled={loading}
              >
                Signup
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
      {errorMessage && <ErrorDialog errorMessage={errorMessage} onClose={onCloseErrorDialog} />}
    </Box>
  );
}
