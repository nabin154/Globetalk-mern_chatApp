import React, { createContext, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";


const ChatContext = createContext();

const ChatProvider = ({ children}) => {
  const [user , setUser] =useState();
   const [notification, setNotification] = useState([]);
  const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState();
  const [receiverLang, setReceiverLang] = useState();
  const [fetchMsgFlag, setFetchMsgFlag] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);


  const history = useHistory();

    useEffect(() => {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      setUser(userInfo);

      if (!userInfo) history.push("/");
    }, [history]);

  return (
    <ChatContext.Provider
      value={{
        user,
        notification,
        setNotification,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        receiverLang,
        setReceiverLang,
        fetchMsgFlag,
        setFetchMsgFlag,
        onlineUsers,
        setOnlineUsers
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
