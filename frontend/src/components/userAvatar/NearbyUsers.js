import { Avatar } from "@chakra-ui/avatar";
import { Box, Text } from "@chakra-ui/layout";
import { ImLocation2 } from "react-icons/im";




const NearbyUsers = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="lightblue"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="90%"
      display="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      borderRadius="3xl"
      position={"relative"}
    >
      <Avatar
        mr={2}
        size="md"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>
        <Text fontSize="xs" color={"darkred"}>
          <b>-Near you </b>
          <b style={{marginLeft:'15px',fontSize:"12px"}}>{user.distance} K.M </b>
        </Text>
      </Box>

      <ImLocation2
        color="darkred"
        style={{ position: "absolute", top: "20px", right: "20px" }}
      />
    </Box>
  );
};

export default NearbyUsers;
