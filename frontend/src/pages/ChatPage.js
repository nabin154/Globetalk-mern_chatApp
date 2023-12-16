import { Box } from "@chakra-ui/layout";
import { useState ,useEffect, createContext} from "react";
import Chatbox from "../components/Chatbox";
import MyChats from "../components/MyChats";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { ChatState } from "../Context/ChatProvider";
import { useHistory } from "react-router-dom";


const Chatpage = () => {
    const [fetchAgain, setFetchAgain] = useState(false);
const {user,setUser} = ChatState();
const history = useHistory();

useEffect(() => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  setUser(userInfo);
  if (!userInfo) history.push("/");
}, [history]);

  return (
    <div style={{ width: "100%" }}>
      {user && <SideDrawer />}
      <Box display="flex" justifyContent="space-between" w="100%" h="86.5vh" p="1px">
         {user && <MyChats fetchAgain={fetchAgain} />}
        {user && (
          <Chatbox fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
        )}
      </Box>
    </div>
  );
};

export default Chatpage;
