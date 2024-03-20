import { Button } from "@chakra-ui/button";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import { VStack, HStack } from "@chakra-ui/react";
import io from "socket.io-client";

import {
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from "@chakra-ui/menu";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/modal";
import { Tooltip } from "@chakra-ui/tooltip";
import { BellIcon, ChevronDownIcon, ChatIcon } from "@chakra-ui/icons";
import { FaUserFriends } from "react-icons/fa";
import { Avatar } from "@chakra-ui/avatar";
import { useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@chakra-ui/toast";
import ChatLoading from "../ChatLoading";
import { Spinner } from "@chakra-ui/spinner";
import ProfileModal from "./ProfileModal";

import { getSender } from "../../config/ChatLogics";
import NearbyUsers from "../userAvatar/NearbyUsers";
import UserListItem from "../userAvatar/UserListItem";

import { ChatState } from "../../Context/ChatProvider";
const socket = io.connect("http://localhost:8080");

function SideDrawer() {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [nearbyFriends, setNearbyFriends] = useState([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const {
    setSelectedChat,
    user,
    setUser,
    notification,
    setNotification,
    chats,
    setChats,
  } = ChatState();

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const history = useHistory();
  const [flag, setFlag] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);

  const handleOpenRight = () => {
    setIsOpenRight(true);
  };

  const handleCloseRight = () => {
    setIsOpenRight(false);
  };

  const logoutHandler = () => {
    socket.emit("logout", user);
    localStorage.removeItem("userInfo");
    setUser(null);
    setChats([]);

    history.push("/");
  };

  const getLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
      });
    } else {
      console.error("Geolocation is not available in this browser.");
    }
  };

  useEffect(() => {
    if (user.location.coordinates) {
      setLatitude(user.location.coordinates[1]);
      setLongitude(user.location.coordinates[0]);
      setFlag(true);
    }
  }, []);

  const postLocation = () => {
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };
    const data = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
    axios
      .post("api/user/location", data, config)
      .then((response) => {
        console.log(response);
        setLatitude(response.data.location.coordinates[1]);
        setLongitude(response.data.location.coordinates[0]);
        setFlag(true);
        setInitialFetchDone(false);

        toast({
          title: "Location Updated",
          description: "Userlocation has been updated successfully.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      })
      .catch((error) => {
        toast({
          title: "Error Occured!",
          description: "Failed to update the location",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      });
  };

  useEffect(() => {
    if (flag) {
      const fetchNearbyFriends = async () => {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          };

          const response = await axios.get("/api/user/nearbyusers", {
            params: {
              maxDistance: 20,
            },
            headers: config.headers,
          });

          setNearbyFriends(response.data);
          setInitialFetchDone(true);
        } catch (error) {
          console.error("Error fetching nearby friends:", error);
        }
      };

      if (!initialFetchDone && flag) {
        fetchNearbyFriends();
      }
    }
  }, [flag, postLocation]);

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: "Please Enter something in search",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
      return;
    }

    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);

      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Search Results",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-left",
      });
    }
  };

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(`/api/chat`, { userId }, config);

      if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setSelectedChat(data);
      setLoadingChat(false);
      onClose();
      setIsOpenRight(false);
    } catch (error) {
      toast({
        title: "Error fetching the chat",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="#2e333d"
        color={"white"}
        w="90%"
        p="10px 10px 10px 10px"
        marginLeft="5%"
        borderRadius="lg"
        style={{
          boxShadow:
            "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 7px, rgba(0, 0, 0, 0.09) 0px 30px 19px",
        }}
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button colorScheme="blue" variant="solid" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px={4}>
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text
          fontSize={{ base: "none", md: "2xl", lg: "4xl" }}
          display={{ base: "none", md: "none", lg: "inline" }}
          fontFamily="Agbalumo"
          fontWeight="600"
          letterSpacing="1.9px"
          textTransform={"uppercase"}
          textShadow=" 4px -2px 3px rgba(30,53,213,0.74)"
        >
          Globe -Talk{" "}
          <i style={{ color: "#3182ce" }} className="fas fa-comments"></i>
        </Text>
        <div style={{ display: "flex", alignItems: "center" }}>
          <FaUserFriends
            style={{ fontSize: "22px", marginRight: "10px" }}
            onClick={handleOpenRight}
            cursor="pointer"
          />
          <Menu>
            <MenuButton p={1}>
              <div style={{ position: "relative" }}>
                {notification.length > 0 && (
                  <div className="notification-badge">
                    <span className="badge">{notification.length}</span>
                  </div>
                )}
              </div>

              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList pl={2} color={"black"}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectedChat(notif.chat);
                    setNotification(notification.filter((n) => n !== notif));
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              colorScheme="#131313"
              rightIcon={<ChevronDownIcon />}
            >
              <Avatar
                size="md"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList bg={"#131313"}>
              <ProfileModal user={user}>
                <MenuItem bg={"#131313"}>My Profile</MenuItem>{" "}
              </ProfileModal>
              <MenuDivider />
              <MenuItem bg={"#131313"} onClick={logoutHandler}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="#202329">
          <DrawerHeader borderBottomWidth="1px" color={"white"}>
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                _placeholder={{ color: "white" }}
                mr={2}
                color={"white"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch} colorScheme="green">
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChat(user._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer placement="right" onClose={handleCloseRight} isOpen={isOpenRight}>
        <DrawerOverlay />
        <DrawerContent bg="#202329">
          <DrawerHeader
            borderBottomWidth="1px"
            color="white"
            fontFamily={"Noto Serif"}
          >
            Find Nearby Users
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <Input
                type="number"
                color={"white"}
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <Input
                type="number"
                color={"white"}
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
              <HStack>
                <Button onClick={getLocation} size={"sm"}>
                  Get Location(auto)
                </Button>
                <Button onClick={postLocation} colorScheme="green" size={"sm"}>
                  Update Location
                </Button>
              </HStack>
              <Text color={"white"} fontFamily={"Bree Serif"}>
                Recommended users by location:
              </Text>
              {user.location.coordinates &&
                nearbyFriends.map(
                  (friend) =>
                    user._id !== friend._id && (
                      <NearbyUsers
                        user={friend}
                        key={friend._id}
                        handleFunction={() => accessChat(friend._id)}
                      />
                    )
                )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default SideDrawer;
