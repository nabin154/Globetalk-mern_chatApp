import { AddIcon } from "@chakra-ui/icons";
import { BsFillCircleFill } from "react-icons/bs";
import { Box, Stack, Text } from "@chakra-ui/layout";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { useEffect, useState } from "react";
import { getSender, getSenderPic, getSenderFull } from ".././config/ChatLogics";
import ChatLoading from "./ChatLoading";
import GroupChatModal from "./miscellaneous/GroupChatModal";
import { Avatar, Button, Badge } from "@chakra-ui/react";
import { ChatState } from "../Context/ChatProvider";
import CryptoJS from "crypto-js";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { io } from "socket.io-client";

const MyChats = ({ fetchAgain }) => {
  const [loggedUser, setLoggedUser] = useState();
  const {
    selectedChat,
    setSelectedChat,
    user,
    chats,
    setChats,
    notification,
    setNotification,
    setFetchMsgFlag,
    onlineUsers,
    setOnlineUsers,
    fetchMsgFlag,
  } = ChatState();
  const [selectedChatId, setSelectedChatId] = useState(null);
  const toast = useToast();
  const [chatKey, setChatKey] = useState();

  const generateKey = (chatId) => {
    const chatIdString = chatId.toString();
    return CryptoJS.SHA256(chatIdString).toString();
  };

  function Decrypt(word, secretKey) {
    let decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
    let bytes = CryptoJS.AES.decrypt(decData, secretKey).toString(
      CryptoJS.enc.Utf8
    );
    return JSON.parse(bytes);
  }
  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.emit("user connected", loggedUser);
    socket.on("online users", (users) => {
      setOnlineUsers(users);
    });
    return () => {
      socket.disconnect();
    };
  }, [loggedUser]);
const isUserOnline = (userId) => {
  return onlineUsers.some((userArray) => userArray[1]._id === userId);
};


  const fetchChats = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get("/api/chat", config);

      const chatKeys = {};
      data.forEach((chat) => {
        const key = generateKey(chat._id);
        chatKeys[chat._id] = key;
      });

      if (selectedChat) {
        var selectedChatId = selectedChat._id;
      }

      const updatedSelectedChat = data.find(
        (chat) => chat._id === selectedChatId
      );

      setChats(data);
      setChatKey(chatKeys);

      if (updatedSelectedChat) {
        setSelectedChat(updatedSelectedChat);
        setFetchMsgFlag(false);
      } else {
        setSelectedChat(null);
      }
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the chats",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom-left",
      });
    }
  };

  useEffect(() => {
    setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
    fetchChats();
  }, [fetchAgain]);

  useEffect(() => {
    if (selectedChatId) {
      const updatedSelectedChat = chats.find(
        (chat) => chat._id === selectedChatId
      );
      const receiverUser = getSenderFull(user, updatedSelectedChat.users);

      if (updatedSelectedChat && user._id !== receiverUser._id) {
        setSelectedChat(updatedSelectedChat);
        setFetchMsgFlag(false);
      } else {
        setSelectedChat(null);
      }
    }
    setFetchMsgFlag(true);
  }, [selectedChat]);

  return (
    <Box
      display={{ base: selectedChat ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="#202329"
      w={{ base: "100%", md: "49%", lg: "31%" }}
      borderRadius="lg"
      marginLeft="5%"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: "28px", md: "30px" }}
        fontFamily="Bree Serif"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
        color="white"
      >
        Chats
        <GroupChatModal>
          <Button
            size={"sm"}
            display="flex"
            fontSize={{ base: "17px", md: "10px", lg: "15px" }}
            rightIcon={<AddIcon />}
            colorScheme="blue"
            fontFamily="sans-serif"
          >
            New GroupChat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#202329"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat) => {
              const onUser = getSenderFull(user, chat.users);
              const isUserOnlineInChat = isUserOnline(onUser._id);
              const isGroupChat = chat.isGroupChat;

              const onlineUsersInChat = chat.users.filter((chatUser) =>
                isUserOnline(chatUser._id)
              );
              const onlineUserCount = onlineUsersInChat.length;
              const lastMessageTime =
                chat.latestMessage &&
                formatDistanceToNow(new Date(chat.latestMessage.createdAt), {
                  addSuffix: false,
                });
              const hasNotification = notification.some(
                (notif) => notif.chat._id === chat._id
              );

              return (
                <Box
                  onClick={() => {
                    if (hasNotification) {
                      setNotification(
                        notification.filter(
                          (notif) => notif.chat._id !== chat._id
                        )
                      );
                    }
                    setSelectedChat(chat);
                  }}
                  cursor="pointer"
                  bg={selectedChat === chat ? "#3182ce" : "#222f3e"}
                  color={selectedChat === chat ? "white" : "white"}
                  px={3}
                  py={2}
                  // border={selectedChat==chat ?'0.2px solid lightblue':'none'}
                  borderRadius="2xl"
                  key={chat._id}
                  height={20}
                  _hover={{ bg: "#70a1ff" }}
                  style={{
                    boxShadow:
                      "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                  }}
                  position="relative"
                >
                  <Box display="flex">
                    <Box>
                      <Avatar
                        size="lg"
                        name="Group Chat"
                        cursor="pointer"
                        src={
                          !chat.isGroupChat
                            ? getSenderPic(loggedUser, chat.users)
                            : "none"
                        }
                      />
                    </Box>

                    <Box>
                      <Text
                        marginLeft={5}
                        fontSize="18px"
                        textTransform={"capitalize"}
                        fontFamily={"Bree Serif"}
                        letterSpacing={"1.2"}
                      >
                        {!chat.isGroupChat
                          ? getSender(loggedUser, chat.users)
                          : chat.chatName}
                      </Text>

                      {chat.latestMessage && (
                        <Text
                          fontSize="xs"
                          textAlign="left"
                          fontWeight={hasNotification ? "800" : "normal"}
                          ml={4}
                          mt={1}
                          textTransform={
                            chat.latestMessage.imageUrl
                              ? "uppercase"
                              : "capitalize"
                          }
                          color={hasNotification ? "whiteAlpha.800" : "#bdc3c7"}
                        >
                          <b>
                            {chat.latestMessage.sender.name &&
                              chat.latestMessage.sender.name.split(" ")[0]}{" "}
                            :{" "}
                          </b>
                          {chat.latestMessage.imageUrl
                            ? "sent a photo."
                            : Decrypt(
                                chat.latestMessage.content,
                                chatKey[chat._id]
                              ).length > 15
                            ? Decrypt(
                                chat.latestMessage.content,
                                chatKey[chat._id]
                              ).substring(0, 15) + "..."
                            : Decrypt(
                                chat.latestMessage.content,
                                chatKey[chat._id]
                              )}
                        </Text>
                      )}
                    </Box>

                    {lastMessageTime && (
                      <Text
                        fontSize="xs"
                        color={"#bdc3c7"}
                        position="absolute"
                        top="0"
                        right="0"
                        mr={2}
                        mt={2}
                      >
                        {lastMessageTime}
                      </Text>
                    )}
                    <Text
                      fontSize="xs"
                      fontWeight={"bold"}
                      position="absolute"
                      bottom="0"
                      right="0"
                      mr={2}
                      mb={2}
                    >
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {isUserOnlineInChat && !isGroupChat && (
                          <BsFillCircleFill
                            color="lightgreen"
                            style={{ marginRight: "5px" }}
                          />
                        )}
                        {!chat.isGroupChat && (
                          <div>
                            {isUserOnlineInChat ? (
                              <Badge colorScheme="green" variant="solid">
                                Online
                              </Badge>
                            ) : (
                              "OFFLINE"
                            )}
                          </div>
                        )}
                        {isGroupChat && (
                          <Badge
                            colorScheme="blue"
                            variant="solid"
                            ml={2}
                            fontSize="xs"
                          >
                            {onlineUserCount} online
                          </Badge>
                        )}
                      </div>
                    </Text>
                  </Box>
                  {hasNotification && (
                    <Badge
                      colorScheme="red"
                      size="sm"
                      variant="solid"
                      position="absolute"
                      bottom="18px"
                      right="20%"
                      mr={2}
                      mt={2}
                    >
                      New
                    </Badge>
                  )}
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
