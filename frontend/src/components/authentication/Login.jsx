import React from "react";
import { Button } from "@chakra-ui/button";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const Login = () => {
    const [show, setShow] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
     const history = useHistory();
       const [picLoading, setPicLoading] = useState(false);
        const {setUser,setSelectedChat } = ChatState();

       const toast = useToast();

     const handleClick = () => setShow(!show);

   
  const submitHandler = async () => {
    localStorage.removeItem("source");
    setSelectedChat(null);

    setPicLoading(true);
    if (!email || !password) {
      toast({
        title: "Please Fill all the Feilds",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data } = await axios.post(
        "/api/user/login",
        { email, password },
        config
      );

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      localStorage.setItem("userInfo", JSON.stringify(data));
      setPicLoading(false);

       history.push("/chats");
     
       
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
    }
  };



  return (
    <VStack spacing="7px">
      <FormControl id="email" isRequired>
        <FormLabel style={{ fontWeight: "bold" }}>Email Address</FormLabel>
        <Input
          value={email}
          backgroundColor="white"
          type="email"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password2" isRequired>
        <FormLabel style={{ fontWeight: "bold" }}>Password</FormLabel>
        <InputGroup size="md">
          <Input
            value={password}
            backgroundColor="white"
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Enter password"
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <Button
        colorScheme="green"
        width="100%"
        style={{
          marginTop: 10,
          marginBottom: 0,
          fontWeight: 800,
          letterSpacing: 0.8,
        }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
