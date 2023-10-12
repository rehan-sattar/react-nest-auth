import { Redirect, Route, RouteProps } from "react-router";
import { useAuthSession } from "../hooks/useAuthSession";

interface PrivateRouteProps extends RouteProps {
  component: React.FC<RouteProps>;
  path: string;
}

export default function PrivateRoute({ component: Component, path }: PrivateRouteProps) {
  const { isAuthenticated } = useAuthSession();

  return (
    <Route
      path={path}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
}
