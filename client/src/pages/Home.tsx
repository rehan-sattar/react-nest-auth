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
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { Box, Flex } from "@chakra-ui/layout";
import { Spinner, Center } from "@chakra-ui/react";
import { MeResponse, authService } from "../services/authentication";

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<null | MeResponse>(null);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const toast = useToast();

  const getAuthenticatedUserDetails = async () => {
    try {
      const authenticatedUser = await authService.me();
      setUser(authenticatedUser);
    } catch (error: any) {
      if (
        error.statusCode === 403 ||
        (error.statusCode === 400 && error.path === "/authentication/refresh-tokens")
      ) {
        handleUnAuthorizedException();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnAuthorizedException = () => {
    toast({
      title: "You are logged out.",
      description: "Please login again to use the application.",
      status: "warning",
      position: "top-right",
      duration: 9000,
      isClosable: true,
    });

    navigate("/login");
  };

  useEffect(() => {
    getAuthenticatedUserDetails();
  }, []);

  const logoutUser = async () => {
    try {
      setLogoutLoading(true);
      await authService.signOut();
      navigate("/login");
      setLogoutLoading(false);
    } catch (error: any) {
      if (error.statusCode === 403) {
        handleUnAuthorizedException();
      }
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
    <Center>
      <Box height="400px" width="container.sm">
        {homePageContent}
        <Button my={10} onClick={logoutUser} isLoading={logoutLoading}>
          Logout
        </Button>
      </Box>
    </Center>
  );
}
