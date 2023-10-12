import { Button } from "@chakra-ui/button";
import { Box, Flex, Heading } from "@chakra-ui/layout";

export default function Home() {
  const logoutUser = async () => {};

  return (
    <Box height="400px">
      <Flex height="full" direction="column" justify="center" align="center">
        <Heading textAlign="center">Congratulations ✨</Heading>
        <Heading mt="10" textAlign="center">
          You are Authenticated!
        </Heading>
        <Button mt="10" onClick={logoutUser}>
          Logout
        </Button>
      </Flex>
    </Box>
  );
}
