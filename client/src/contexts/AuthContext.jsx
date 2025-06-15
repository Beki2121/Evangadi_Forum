//imports
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";


// Creates the actual context object. Initially, it has null as its default value.
const AuthContext = createContext(null);




// Defines a custom hook to make consuming the context easier in other components
export const useAuth = () => {
  return useContext(AuthContext);
};
// NB:
//  importing with custom hook:import { useAuth } from "../contexts/AuthContext";
//  and using it:const { user, isAuthenticated, loading } = useAuth();


// importing if there is no custom hook:
// import { AuthContext } from "../contexts/AuthContext";
// and using it: const { user, isAuthenticated, loading } = useContext(AuthContext);





// This is the wrapper component. It wraps our app and provides the authentication state to all components inside it.
export const AuthProvider = ({ children }) => {

  // our states
  const [user, setUser] = useState(null); // user state will hold the authenticated user's data
  const [loading, setLoading] = useState(true); // To indicate if auth state is being loaded
  const [authReady, setAuthReady] = useState(false); // New state to indicate when auth check is complete



  // Function to check user's login status via token in localStorage
  const checkAuthStatus = useCallback(async () => {
    
    setLoading(true);


    // Assuming JWT token is stored here (if not, token will be null -- falsey)
    const token = localStorage.getItem("token"); 

  
    // If token exists, we will verify it with the backend
    if (token) {

      try {

        // Call your backend to verify the token and get user details
        const response = await fetch("http://localhost:5000/api/check-user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });


        // If the response is ok(If the token is valid), parse the JSON and set the user state
        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Set the user data from the backend response
          console.log("AuthContext: User authenticated via token:", data.user);
        } 
        // If the response is not ok(If the token is invalid or expired), it means the token is invalid or expired
        else {          
          console.error("AuthContext: Token verification failed or expired.");
          localStorage.removeItem("token"); // Remove invalid token
          setUser(null);
        }
      } catch (error) {
        console.error("AuthContext: Error checking auth status:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false); // Mark loading as complete
        setAuthReady(true); // If no token exists/invalid, just skip the fetch and mark as not authenticated.
      }
    } else {
      setUser(null);
      setLoading(false); // Mark loading as complete
      setAuthReady(true); // If no token exists, just skip the fetch and mark as not authenticated.
    }
  }, []);









  // Runs checkAuthStatus once when the component mounts (first render), to determine if user is logged in.
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]); // Dependency array includes checkAuthStatus for useCallback optimization





  // The value provided to consumers of this context
  const authContextValue = {
    user,
    loading, // Expose loading state
    authReady, // Expose authReady state
    isAuthenticated: !!user, // Convenience boolean
  };



  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};


// ---Note---
// AuthContext = the actual context object
// AuthProvider = the wrapper that provides the context
// useAuth() = the custom hook that makes it easy to access the context