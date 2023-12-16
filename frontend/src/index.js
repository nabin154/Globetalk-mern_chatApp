import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from 'react-router-dom/cjs/react-router-dom.min';
import ChatProvider from "./Context/ChatProvider";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
     <ChakraProvider>
    <BrowserRouter>
      <ChatProvider>
        <App />
      </ChatProvider>
    </BrowserRouter>
  </ChakraProvider>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
