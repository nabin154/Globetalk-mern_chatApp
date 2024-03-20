import { FormControl } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import CryptoJS from "crypto-js";
import EmojiPicker from "emoji-picker-react";
import "./styles.css";
import { Button, IconButton, Spinner, useToast } from "@chakra-ui/react";
import { getSender, getSenderFull, getLanguage } from "../config/ChatLogics";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowBackIcon, ArrowForwardIcon, PhoneIcon } from "@chakra-ui/icons";
import { MdOutlineAttachFile } from "react-icons/md";
import { FaFaceSmile } from "react-icons/fa6";
import { BiSolidVideo } from "react-icons/bi";
import ProfileModal from "./miscellaneous/ProfileModal";
import VideoCallModal from "./miscellaneous/VideoModal";
import Calling from "./miscellaneous/Calling";
import ScrollableChat from "./ScrollableChat";
import { ChatState } from "../Context/ChatProvider";
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { fetchsentiment } from "./miscellaneous/sentiment/fetchSentiment";
const ENDPOINT = "http://localhost:8080";

const Peer = window.SimplePeer;
var socket, selectedChatCompare;
let path = "https://drive.google.com/uc?id=1mRKaplprzWrv4pbsvAdBZko7m4inWxc5";
let audio = new Audio(path);

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [room, setRoom] = useState("");
  const toast = useToast();
  const [flag, setFlag] = useState(false);
  const [detectedLang, setDetectedLang] = useState();
  const {
    selectedChat,
    setSelectedChat,
    user,
    notification,
    setNotification,
    receiverLang,
    setReceiverLang,
    fetchMsgFlag,
    setFetchMsgFlag,
    onlineUsers,
  } = ChatState();
  const [picLoading, setPicLoading] = useState(false);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [stream, setStream] = useState();
  const [me, setMe] = useState("");
  const userVideo = useRef();
  const myVideo = useRef();

  const connectionRef = useRef();
  const [showCallingModal, setShowCallingModal] = useState(false);
  const [callType, setCallType] = useState("video");
  const [callMethod, setCallMethod] = useState("");
  const [mood, setMood] = useState(null);
 

  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", (data) => {
      setIsTyping(true);
      console.log(room);
      setRoom(data.room);
    });
    socket.on("stop typing", (data) => {
      setIsTyping(false);
    });
    socket.on("incommingCall", (data) => {
      // console.log(data);
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
      setCallMethod(data.type);
      setShowCallingModal(true);
    });
    return () => {
      socket.off("typing");
      socket.off("stop typing");
    };
  }, []);

  useEffect(() => {
    if (fetchMsgFlag) {
      fetchMessages();
    }
    selectedChatCompare = selectedChat;
  }, [selectedChat]);

  // useEffect(() => {
  //   if (selectedChat) {
  //     let source;
  //     if (selectedChat.isGroupChat) {
  //       source = selectedChat.groupLanguage;
  //     } else {
  //       source = getLanguage(user, selectedChat.users);
  //     }
  //     localStorage.setItem("source", source);
  //   } else {
  //     localStorage.removeItem("source");
  //   }
  // }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      const source = selectedChat.isGroupChat
        ? selectedChat.groupLanguage
        : getLanguage(user, selectedChat.users);
      setReceiverLang(source);
    } else {
      setReceiverLang(null);
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
          // audio.play().catch((error) => {
          //   console.error("Failed to play audio:", error);
          // });
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

useEffect(() => {
  const fetchMessagesAndCalculateMood = async () => {
    if (!selectedChat) return;
    console.log("hello");
    const sender = getSenderFull(user, selectedChat.users);
    try {
      const response = await axios.get(`/api/message/sender/${sender._id}`);
      const messages = response.data.slice(0, 30); 
      console.log(messages);

      let positiveCount = 0;
      let negativeCount = 0;
      let neutralCount = 0;

      for (let message of messages) {
        if (message.sentiment === "Positive") {
          positiveCount++;
        } else if (message.sentiment === "Negative") {
          negativeCount++;
        } else if (message.sentiment === "Neutral") {
          neutralCount++;
        }
      }

      let calculatedMood;
      if (messages.length > 5) {
        if (positiveCount > negativeCount && positiveCount > neutralCount) {
          calculatedMood = "happy";
        } else if(negativeCount > positiveCount && negativeCount > neutralCount) {
          calculatedMood = "not happy";
        } 
        else{
          calculatedMood = "neutral"
        }
      } else {
        calculatedMood = "mood loading..";
      }

      setMood(calculatedMood);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  
  fetchMessagesAndCalculateMood();
  const intervalId = setInterval(fetchMessagesAndCalculateMood, 2 * 60 * 1000);

  
  return () => clearInterval(intervalId);
}, [selectedChat]);


 const getSentimentEmoji = (sentiment) => {
   switch (sentiment) {
     case "happy":
       return "😊";
     case "not happy":
       return "😢";
     default:
       return " ";
   }
 };








  const openVideoModal = () => {
    setCallType("video");
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setShowCallModal(false);
  };
  const openCallModal = () => {
    setCallType("audio");
    setShowCallModal(true);
  };

  const answerCall = () => {
    setShowCallingModal(false);
    if (callMethod === "video") {
      openVideoModal();
    } else {
      openCallModal();
    }
  };

  const callUser = () => {
    const receiverId = getSenderFull(user, selectedChat.users);
    const receiverSocketId = Array.from(onlineUsers).find(
      ([socketId, userData]) => userData._id === receiverId._id
    )?.[0];

    if (receiverSocketId) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on("signal", (data) => {
        socket.emit("callFriend", {
          userToCall: receiverSocketId,
          signalData: data,
          from: me,
          type: callType,
        });
      });
      peer.on("stream", (stream) => {
        userVideo.current.srcObject = stream;
      });

      socket.on("callAccepted", (data) => {
        setCallAccepted(true);
        setCaller(data.from);
        peer.signal(data.signal);
      });
      peer.on("close", () => {
        console.log("peer closed");
        socket.off("callAccepted");
      });

      connectionRef.current = peer;
    } else {
      toast({
        title: "Not online!",
        description: "User is not online",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  useEffect(() => {
    socket.on("endCall", () => {
      if (myVideo.current && myVideo.current.srcObject) {
        const tracks = myVideo.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        myVideo.current.srcObject = null;
      }

      if (userVideo.current && userVideo.current.srcObject) {
        const tracks = userVideo.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        userVideo.current.srcObject = null;
      }
      if (connectionRef.current) {
        connectionRef.current.destroy();
      }
      if (stream) {
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track) => track.stop());
        setStream(null);
      }
      toast({
        title: "Your receiver ended the call !",
        status: "warning",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    });
    return () => {
      socket.off("endCall");
    };
  }, [stream]);

  const handleEmojiClick = (emoji) => {
    // console.log(emoji.emoji);
    setNewMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  // ----------------Encryption function----------------
  function generateKey(chatId) {
    const chatIdString = chatId.toString();
    return CryptoJS.SHA256(chatIdString).toString();
  }
  function Encrypt(word, chatId) {
    const encryptionKey = generateKey(chatId);
    let encJson = CryptoJS.AES.encrypt(
      JSON.stringify(word),
      encryptionKey
    ).toString();
    let encData = CryptoJS.enc.Base64.stringify(
      CryptoJS.enc.Utf8.parse(encJson)
    );
    return encData;
  }

  // function Decrypt(word, secretKey) {
  //   let decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
  //   let bytes = CryptoJS.AES.decrypt(decData, secretKey).toString(
  //     CryptoJS.enc.Utf8
  //   );
  //   return JSON.parse(bytes);
  // }

  const imageMessage = (pics) => {
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
          setFlag(true);
          setNewMessage(data.url.toString());
          console.log(data.url.toString());
          setPicLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setPicLoading(false);
        });
    } else {
      toast({
        title: "Not supported image type!",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      setPicLoading(false);

      return;
    }
  };

  

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };

  const source = receiverLang;

  const translateMessage = async (message, detectedLang) => {
    if (source === "original" || source === detectedLang || flag == true) {
      return message;
    }

    const encodedParams = new URLSearchParams();
    encodedParams.set("q", message);
    encodedParams.set("target", source);
    encodedParams.set("source", detectedLang);

    const options = {
      method: "POST",
      url: "https://google-translate1.p.rapidapi.com/language/translate/v2",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        "X-RapidAPI-Key": process.env.REACT_APP_TRANSLATE_APIKEY,
        "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
      },
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error(error);
      return message;
    }
  };

  const sendMessage = async (event) => {
    if (newMessage) {
      socket.emit("stop typing", selectedChat._id);
      setNewMessage("");

      let translatedMessage = await translateMessage(newMessage, detectedLang);
      console.log(translatedMessage);

      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        const encryptedContent = Encrypt(newMessage, selectedChat._id);
        const encryptedTranslatedContent = Encrypt(
          translatedMessage,
          selectedChat._id
        );
        const sentiment = await fetchsentiment(newMessage);
        // if(detectedLang != 'en' ){sentiment = 'Neutral'};
        const { data } = await axios.post(
          "/api/message",
          {
            content: encryptedContent,
            chatId: selectedChat._id,
            translatedContent: encryptedTranslatedContent,
            flag: flag,
            sentiment:  sentiment,
          },
          config
        );

        setMessages([...messages, data]);
        socket.emit("new message", data);
        setShowEmojiPicker(false);
        setFlag(false);
        setFetchAgain(!fetchAgain);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the Message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && newMessage) {
      sendMessage();
    }
  };

  const typingHandler = async (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);

    setTimeout(async () => {
      const encodedParams = new URLSearchParams();
      encodedParams.set("q", newMessage);

      const options = {
        method: "POST",
        url: "https://google-translate1.p.rapidapi.com/language/translate/v2/detect",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          "X-RapidAPI-Key": process.env.REACT_APP_TRANSLATE_APIKEY,
          "X-RapidAPI-Host": "google-translate1.p.rapidapi.com",
        },
        data: encodedParams,
      };

      try {
        const response = await axios.request(options);
        console.log(response.data["data"]["detections"][0][0]["language"]);
        setDetectedLang(response.data["data"]["detections"][0][0]["language"]);
      } catch (error) {
        console.error(error);
      }
    }, 400);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "28px" }}
            pb={3}
            px={2}
            w="100%"
            color="lightblue"
            textAlign="center"
            fontFamily="Bree Serif"
            display="flex"
            justifyContent={{ base: "space-between" }}
            alignItems="center"
            textTransform="capitalize"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <h4 style={{
                  fontSize:'12px',
                }}>- {mood} {getSentimentEmoji(mood)}</h4>

                <IconButton
                  as="span"
                  bg={"none"}
                  aria-label="Start Video Call"
                  color={"white"}
                  ml={1}
                  icon={<PhoneIcon size={"28px"} />}
                  onClick={openCallModal}
                  position={{ base: "none", md: "none", lg: "absolute" }}
                  right={"14%"}
                />
                {showCallModal && (
                  <VideoCallModal
                    onClose={closeVideoModal}
                    receivingCall={receivingCall}
                    setReceivingCall={setReceivingCall}
                    caller={caller}
                    setCaller={setCaller}
                    callerSignal={callerSignal}
                    setCallerSignal={setCallerSignal}
                    callUser={callUser}
                    userVideo={userVideo}
                    callAccepted={callAccepted}
                    setCallAccepted={setCallAccepted}
                    connectionRef={connectionRef}
                    stream={stream}
                    me={me}
                    setMe={setMe}
                    setStream={setStream}
                    setFetchAgain={setFetchAgain}
                    fetchAgain={fetchAgain}
                    callType={callType}
                    myVideo={myVideo}
                  />
                )}
                <IconButton
                  as="span"
                  bg={"none"}
                  aria-label="Start Video Call"
                  color={"white"}
                  ml={1}
                  icon={<BiSolidVideo size={"26px"} />}
                  onClick={openVideoModal}
                  position={{ base: "none", md: "none", lg: "absolute" }}
                  right={"11%"}
                />
                {showVideoModal && (
                  <VideoCallModal
                    onClose={closeVideoModal}
                    receivingCall={receivingCall}
                    setReceivingCall={setReceivingCall}
                    caller={caller}
                    setCaller={setCaller}
                    callerSignal={callerSignal}
                    setCallerSignal={setCallerSignal}
                    callUser={callUser}
                    userVideo={userVideo}
                    callAccepted={callAccepted}
                    setCallAccepted={setCallAccepted}
                    connectionRef={connectionRef}
                    stream={stream}
                    me={me}
                    setMe={setMe}
                    setStream={setStream}
                    setFetchAgain={setFetchAgain}
                    fetchAgain={fetchAgain}
                    callType={callType}
                    myVideo={myVideo}
                  />
                )}

                {receivingCall && (
                  <Calling
                    isOpen={showCallingModal}
                    onClose={() => setShowCallingModal(false)}
                    onAnswer={answerCall}
                    caller={caller}
                    callMethod={callMethod}
                  />
                )}

                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}

                <UpdateGroupChatModal
                  fetchMessages={fetchMessages}
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#1e272e"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="md"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
                thickness="3px"
                speed="0.75s"
                emptyColor="gray.200"
                color="blue.500"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl
              onKeyDown={handleKeyPress}
              id="first-name"
              isRequired
              mt={3}
            >
              {istyping && selectedChat._id == room ? (
                <div class="chat-bubble">
                  <div class="typing">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </div>
              ) : (
                <></>
              )}
              <Box display={"flex"}>
                <Input
                  variant="filled"
                  color="white"
                  bg="#E0E0E0"
                  placeholder="Enter a new message.."
                  value={newMessage}
                  onChange={typingHandler}
                  width="80%"
                />

                <IconButton
                  as="span"
                  bg={"none"}
                  aria-label="Open Emoji Picker"
                  ml={1}
                  icon={<FaFaceSmile color="orange" size={"26px"} />}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
                {showEmojiPicker && (
                  <div
                    style={{
                      position: "fixed",
                      bottom: "80px",
                      right: "10px",
                      zIndex: 1000,
                    }}
                  >
                    <EmojiPicker
                      onEmojiClick={handleEmojiClick}
                      disableAutoFocus
                      searchDisabled
                      Theme="dark"
                      height={"350px"}
                      width={"300px"}
                      native
                    />
                  </div>
                )}

                <label htmlFor="fileInput">
                  <IconButton
                    as="span"
                    bg={"whiteAlpha.800"}
                    aria-label="Upload Image"
                    ml={1}
                    icon={<MdOutlineAttachFile size={"26px"} />}
                  />
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => imageMessage(e.target.files[0])}
                />
                <Button
                  rightIcon={<ArrowForwardIcon />}
                  colorScheme={picLoading ? "red" : "linkedin"}
                  variant="solid"
                  fontFamily="Noto Serif"
                  letterSpacing={0.7}
                  onClick={sendMessage}
                  ml={1}
                  isLoading={picLoading}
                >
                  Send
                </Button>
              </Box>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text
            border="1px"
            color="lightblue"
            fontSize="3xl"
            pb={4}
            fontFamily="Bree Serif"
          >
            " Click on a user to start chatting"
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
