import Cookies from "universal-cookie";
import { useEffect, useState } from "react";

export const useAuthSession = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const cookies = new Cookies(null, { path: "/" });

  useEffect(() => {
    const sessionCookie = cookies.get("session-id");

    if (sessionCookie) {
      setIsAuthenticated(true);
    }
  }, []);

  return { isAuthenticated };
};
