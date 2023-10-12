import { BrowserRouter, Route } from "react-router-dom";
import { Container } from "@chakra-ui/react";

import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/Signup";
import PrivateRoute from "./PrivateRoute";

export default function ApplicationRoutes() {
  return (
    <BrowserRouter>
      <Container>
        <Route exact path="/" component={SignUp} />
        <Route exact path="/login" component={Login} />
        <PrivateRoute exact path="/home" component={Home} />
      </Container>
    </BrowserRouter>
  );
}
