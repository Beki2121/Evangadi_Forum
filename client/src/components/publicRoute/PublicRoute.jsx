import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserState } from "../../App.jsx";

const PublicRoute = ({ children }) => {
  const { user } = useContext(UserState);

  // If logged in, redirect to home
  if (user?.userid) {
    return <Navigate to="/" replace />;
  }

  // Otherwise show the public route (e.g. login/register)
  return children;
};

export default PublicRoute;
