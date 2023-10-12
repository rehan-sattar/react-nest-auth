import { Button } from "@chakra-ui/button";
import {
  AbsoluteCenter,
  Alert,
  AlertIcon,
  Divider,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Tr,
} from "@chakra-ui/react";
import { useHistory } from "react-router";
import { Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/layout";
import { MeResponse, authService } from "../services/authentication";

export default function Home() {
  const [user, setUser] = useState<null | MeResponse>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const history = useHistory();

  const getAuthenticatedUserDetails = async () => {
    try {
      const authenticatedUser = await authService.me();
      setUser(authenticatedUser);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAuthenticatedUserDetails();
  }, []);

  const logoutUser = async () => {
    try {
      setLogoutLoading(true);
      await authService.signOut();
      history.push("/login");
      setLogoutLoading(false);
    } catch (error) {
      console.log("Something went wrong while logging out.");
    }
  };

  let homePageContent;

  if (loading) {
    homePageContent = (
      <Flex height="full" direction="column" justify="center" align="center">
        <Spinner />;
      </Flex>
    );
  }

  if (user) {
    homePageContent = (
      <Flex direction="column" justify="center" align="center">
        <Alert status="success" mt="b" rounded="base">
          <AlertIcon />
          <Text my="5" fontWeight="extrabold">
            Hoorayy! 🥳 You are authenticated to use the system!
          </Text>
        </Alert>
        <Divider mt="5" />

        <TableContainer width="full">
          <Table variant="simple">
            <Tbody>
              <Tr>
                <Th>Name</Th>
                <Td>{user.name}</Td>
              </Tr>
              <Tr>
                <Th>Email</Th>
                <Td>{user.email}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    );
  }

  return (
    <Box height="400px">
      {homePageContent}
      <Button my={10} onClick={logoutUser} isLoading={logoutLoading}>
        Logout
      </Button>
    </Box>
  );
}
