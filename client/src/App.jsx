import { createContext, useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header/Header.jsx";
import Footer from "./components/Footer/Footer.jsx";

export const UserState = createContext(); // Create a context for the user data

function App() {

  return (
    <>
    <Header />
    <Footer />
    </>
  );
}

export default App;
