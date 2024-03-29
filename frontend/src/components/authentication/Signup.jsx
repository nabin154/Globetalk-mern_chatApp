import React, { useState, useEffect } from "react";
import { Button } from "@chakra-ui/button";
import { Select } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/form-control";
import { Input, InputGroup, InputRightElement } from "@chakra-ui/input";
import { VStack } from "@chakra-ui/layout";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import { useHistory } from "react-router-dom";
import { ChatState } from "../../Context/ChatProvider";

const SignUp = () => {
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [pic, setPic] = useState("");
  const [picLoading, setPicLoading] = useState(false);
  const [Language, setSelectedLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const { setSelectedChat } = ChatState();

  const toast = useToast();
  const history = useHistory();
  const handleClick = () => setShow(!show);
  useEffect(() => {
    fetch("/api/user/languages")
      .then((response) => response.json())
      .then((data) => {
        setLanguages(data);
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
      });
  }, []);

  const changelanguage = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
  };


   const validatePassword = (password) => {
    
     const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
     return passwordRegex.test(password);
   };

  const validateForm = () => {
    if (!name || !email || !password || !confirmpassword) {
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return false;
    }

    if (password !== confirmpassword) {
      toast({
        title: "Passwords Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return false;
    }

    if (!validatePassword(password)) {
      toast({
        title:
          "Password validation failed !!",
          description:"Password Should Be At Least 6 Characters With One Uppercase And One Numeric Value",
        status: "warning",
        duration: 7000,
        isClosable: true,
        position: "top",
      });
      return false;
    }

    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

   


  const submitHandler = async () => {
    localStorage.removeItem("source");
    setSelectedChat(null);
    setPicLoading(true);

    if (!validateForm()) {
      setPicLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email Address",
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
        "/api/user",
        { name, email, password, pic, Language },
        config
      );
      toast({
        title: "Registration Successful",
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
        title: "Error Occurred!",
        description: error.response?.data?.message || "Unknown error",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);

    if (!pics) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      const data = new FormData();
      data.append("file", pics);
      data.append("upload_preset", "globetalk");
      data.append("cloud_name", "dobmlogth");

      fetch("https://api.cloudinary.com/v1_1/dobmlogth/image/upload", {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          setPic(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);
      return;
    }
  };

  return (
    <VStack spacing="5px">
      <FormControl id="first-name" isRequired>
        <FormLabel style={{ fontWeight: "bold" }}>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          backgroundColor="white"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>
      <FormControl id="email1" isRequired>
        <FormLabel style={{ fontWeight: "bold" }}>Email Address</FormLabel>
        <Input
          type="email"
          backgroundColor="white"
          placeholder="Enter Your Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>
      <FormControl id="password" isRequired>
        <FormLabel style={{ fontWeight: "bold" }}>Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Password"
            backgroundColor="white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="password1" isRequired>
        <FormLabel style={{ fontWeight: "bold" }}>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            backgroundColor="white"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      <FormControl id="pic">
        <FormLabel style={{ fontWeight: "bold" }}>
          Upload your Picture
        </FormLabel>
        <Input
          type="file"
          backgroundColor="white"
          p={1}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>
      <Select
        placeholder="Select Language"
        mt="1.8"
        style={{ fontWeight: "bold" }}
        value={Language}
        onChange={changelanguage}
      >
        {languages &&
          languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
      </Select>
      <Button
        colorScheme="green"
        width="100%"
        style={{ marginTop: 15, fontWeight: 800, letterSpacing: 0.7 }}
        onClick={submitHandler}
        isLoading={picLoading}
      >
        Sign Up
      </Button>
    </VStack>
  );
};

export default SignUp;
