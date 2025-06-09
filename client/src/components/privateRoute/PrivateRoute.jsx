import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserState } from "../../App.jsx";

const PrivateRoute = ({ children }) => {
  const { user } = useContext(UserState);

  if (!user?.userid) {
    return <Navigate to="/auth" replace />; //replace prevents the redirect from being added to the browser history (so hitting back won’t take them back to the private route).
  }

  return children;
};

export default PrivateRoute;
