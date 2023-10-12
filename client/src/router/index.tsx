import { BrowserRouter, Route } from "react-router-dom";
import { Container } from "@chakra-ui/react";

import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/Signup";

export default function ApplicationRoutes() {
  return (
    <BrowserRouter>
      <Container>
        <Route path="/" exact>
          <SignUp />
        </Route>
        <Route path="/login" exact>
          <Login />
        </Route>
        <Route path="/home" exact>
          <Home />
        </Route>
      </Container>
    </BrowserRouter>
  );
}
