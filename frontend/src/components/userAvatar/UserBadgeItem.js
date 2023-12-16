import { CloseIcon } from "@chakra-ui/icons";
import { Badge } from "@chakra-ui/layout";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme={admin && admin._id == user._id ? "red" : "purple"}
      cursor="pointer"
    >
      {user.name}

      <CloseIcon pl={1} onClick={handleFunction} />
    </Badge>
  );
};

export default UserBadgeItem;
