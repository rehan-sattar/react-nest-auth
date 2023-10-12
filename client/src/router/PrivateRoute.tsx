import { Navigate } from "react-router";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const isUserAuthenticated = () => {
  const sessionId = cookies.get("session-id");

  return sessionId ? true : false;
};

export const PrivateRoute = ({ children }: any) => {
  return isUserAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};
