import { FaUserAlt } from "react-icons/fa";
import { MdAddAPhoto } from "react-icons/md";
import { useState, useEffect } from "react";
import axios from "axios";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  IconButton,
  Text,
  Select,
  Image,
  Input,
} from "@chakra-ui/react";

const ProfileModal = ({ user,children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [languages, setLanguages] = useState();
  const [selectedLanguage, setSelectedLanguage] = useState();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pic, setPic] = useState();
  const [picLoading, setPicLoading] = useState(false);
  const [picUploaded, setPicUploaded] = useState(false);

  const toast = useToast();
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("userInfo"))
  );

  useEffect(() => {
    fetch("/api/user/languages")
      .then((response) => response.json())
      .then((data) => {
        setLanguages(data);
      })
      .catch((error) => {
        console.error("Error fetching languages:", error);
      });
    setSelectedLanguage(userInfo.Language);
  }, [userInfo]);

  

  const changelanguage = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
  };

  const updateLang = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/user/languages",
        {
          userId: user._id,
          languageCode: selectedLanguage,
        },
        config
      );

      toast({
        title: "Language Updated",
        description: "User language has been updated successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to change the language",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const changePassword = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/user/change-password",
        {
          userId: user._id,
          oldPassword,
          newPassword,
        },
        config
      );

      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to change the password",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const changeImage = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        "/api/user/change-image",
        {
          userId: user._id,
         image :pic,
        },
        config
      );
setPicUploaded(false);
  localStorage.setItem("userInfo", JSON.stringify(data));    
      

      toast({
        title: "Profile picture Changed",
        description: "Your profile has been changed successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to change the picture",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const postDetails = (pics) => {
    setPicLoading(true);
    if (pics === undefined) {
      toast({
        title: "Please Select an Image!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    console.log(pics);
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
          setPicUploaded(true);
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
    <>
      {children ? (
        <span onClick={onOpen}>{children}</span>
      ) : (
        <IconButton
          display={{ base: "flex" }}
          size={"sm"}
          icon={<FaUserAlt size={"22px"} />}
          onClick={onOpen}
        />
      )}
      <Modal
        size={userInfo._id == user._id ? "lg" : "md"}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <ModalOverlay />
        <ModalContent
          overflowY="auto"
          height={{
            base: userInfo._id === user._id ? "500px" : "410px",
            md: userInfo._id === user._id ? "550px" : "410px",
          }}
        >
          <ModalHeader
            fontSize="30px"
            fontFamily="Bree serif"
            display="flex"
            justifyContent="center"
            textTransform="capitalize"
          >
            {user.name}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            justifyContent="space-between"
          >
            <label htmlFor="avatar-upload">
              <div style={{ position: "relative", display: "inline-block" }}>
                <Image
                  borderRadius="full"
                  boxSize="150px"
                  src={user.pic}
                  alt={user.name}
                  cursor="pointer"
                  border={picUploaded ? "5px solid red" : "3px solid blue"}
                />
                {userInfo._id === user._id && (
                  <MdAddAPhoto
                    style={{
                      position: "absolute",
                      bottom: "8px",
                      right: "8px",
                      backgroundColor: "white",
                      cursor: "pointer",
                    }}
                  />
                )}
              </div>
              {userInfo._id === user._id ? (
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => postDetails(e.target.files[0])}
                />
              ) : null}
            </label>
            <Text
              textAlign="center"
              fontSize={{ base: "28px", md: "22px" }}
              fontFamily="Bree Serif"
              fontWeight={600}
            >
              Email: {user.email}
            </Text>
            {userInfo._id == user._id ? (
              <>
                {" "}
                <Select
                  placeholder="Select Language"
                  mt="4.8"
                  style={{ fontWeight: "bold" }}
                  value={selectedLanguage}
                  onChange={changelanguage}
                >
                  {languages &&
                    languages.map((language) => (
                      <option key={language.code} value={language.code}>
                        {language.name}
                      </option>
                    ))}
                </Select>
                <label
                  style={{
                    fontFamily: "Bree Serif",
                    fontWeight: "bold",
                  }}
                >
                  Change Password :
                  <Input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    mt={2}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </label>
              </>
            ) : null}
          </ModalBody>
          <ModalFooter>
            {userInfo._id == user._id ? (
              <>
                <Button
                  colorScheme="green"
                  variant="solid"
                  onClick={updateLang}
                  marginRight={2}
                  fontSize={"14px"}
                >
                  Update Language
                </Button>
                <Button
                  colorScheme="blue"
                  variant="solid"
                  onClick={changePassword}
                  marginRight={2}
                  fontSize={"14px"}
                >
                  Change Password
                </Button>

                <Button
                  colorScheme="blue"
                  variant="solid"
                  onClick={changeImage}
                  marginRight={2}
                  isLoading={picLoading}
                  fontSize={"14px"}
                >
                  Change Picture
                </Button>
              </>
            ) : null}
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default ProfileModal;
