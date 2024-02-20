import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/tooltip";
import { ViewIcon } from "@chakra-ui/icons";
import CryptoJS from "crypto-js";
import { useState, useRef, useEffect } from "react";
import { ChatState } from "../Context/ChatProvider";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";



const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();
  const chatContainerRef = useRef(null);

function generateKey(chatId) {
  const chatIdString = chatId.toString();
  return CryptoJS.SHA256(chatIdString).toString();
}


function Decrypt(word, chatId) {
  const encryptionKey = generateKey(chatId);
  const decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
  const bytes = CryptoJS.AES.decrypt(decData, encryptionKey).toString(
    CryptoJS.enc.Utf8
  );
  return JSON.parse(bytes);
}

  const [showOriginalMap, setShowOriginalMap] = useState({});
   const [sentimentIcons, setSentimentIcons] = useState({});

  function toggleOriginal(messageId) {
    setShowOriginalMap((prevShowOriginalMap) => ({
      ...prevShowOriginalMap,
      [messageId]: !prevShowOriginalMap[messageId], 
    }));
  }

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
    // messages.forEach((message) => {
    //   if (!sentimentIcons[message._id]) {
    //     fetchSentiment(Decrypt(message.content, message.chat._id), message._id);
    //   }
    // });
  }, [messages]);

//  const fetchSentiment = async (text, messageId) => {
//    try {
//      const response = await fetch("http://localhost:5000/analyze", {
//        method: "POST",
//        headers: {
//          "Content-Type": "application/json",
//        },
//        body: JSON.stringify({ text }),
//      });

//      if (response.ok) {
//        const result = await response.json();
//        const sentiment = result.sentiment;
//        console.log(sentiment);

//        setSentimentIcons((prevSentimentIcons) => ({
//          ...prevSentimentIcons,
//          [messageId]: sentiment,
//        }));
//      } else {
//        console.error("Failed to fetch sentiment:", response.statusText);
//      }
//    } catch (error) {
//      console.error("Error fetching sentiment:", error);
//    }
//  };

 const getSentimentEmoji = (sentiment) => {
   switch (sentiment) {
     case "Positive":
       return "😊";
     case "Negative":
       return "😢";
     default:
       return "-";
   }
 };



  return (
    <div
      style={{ overflowX: "hidden", overflowY: "auto" }}
      ref={chatContainerRef}
    >
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  style={{
                    marginTop: m.imageUrl ? "220px" : "17px",
                  }}
                  mr={2}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}

            <div
              style={{
                // backgroundColor: `${
                //   m.sender._id === user._id ? "#4E65FF" : "#4b6584"
                // }`,
                backgroundColor: `${
                  m.sender._id === user._id
                    ? "#4E65FF"
                    : m.sentiment === "Positive"
                    ? "#78e08f" // Green for Positive
                    : m.sentiment === "Negative"
                    ? "#e55039" // Red for Negative
                    : "#4b6584"
                }`,
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i, user._id) ? 4 : 10,
                borderRadius: "10px",
                padding: m.imageUrl ? "0" : "15px 15px",
                maxWidth: "75%",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "Noto Serif",
                alignItems: "center",
                boxShadow:
                  "rgba(0, 0, 0, 0.17) 0px -23px 25px 0px inset, rgba(0, 0, 0, 0.15) 0px -36px 30px 0px inset, rgba(0, 0, 0, 0.1) 0px -79px 40px 0px inset, rgba(0, 0, 0, 0.06) 0px 2px 1px, rgba(0, 0, 0, 0.09) 0px 4px 2px, rgba(0, 0, 0, 0.09) 0px 8px 4px, rgba(0, 0, 0, 0.09) 0px 16px 8px, rgba(0, 0, 0, 0.09) 0px 32px 15px",
              }}
            >
              {m.imageUrl ? (
                <a
                  href={Decrypt(m.content, m.chat._id)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src={Decrypt(m.content, m.chat._id)}
                    alt="Image"
                    boxSize="250px"
                    borderRadius={"5"}
                    objectFit="cover"
                  />
                </a>
              ) : m.sender._id === user._id ? (
                Decrypt(m.content, m.chat._id)
              ) : (
                <div>
                  {showOriginalMap[m._id]
                    ? Decrypt(m.content, m.chat._id)
                    : Decrypt(m.translatedContent, m.chat._id)}
                </div>
              )}

              {m.imageUrl || m.sender._id === user._id ? null : (
                <button
                  className="eye-button"
                  onClick={() => toggleOriginal(m._id)}
                >
                  <ViewIcon ml={3} />
                </button>
              )}
            </div>
            {sentimentIcons[m._id] && m.sender._id !== user._id && (
              <div style={{ marginLeft: "6px", alignSelf: "center" }}>
                {getSentimentEmoji(m.sentiment)}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default ScrollableChat;
