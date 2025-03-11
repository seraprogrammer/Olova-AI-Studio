import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./components/Chat";

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
