import React, { useEffect } from "react";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Avatar,
} from "@chakra-ui/react";
import { Box, Text } from "@chakra-ui/layout";

import { ChatState } from "../../Context/ChatProvider";
// let path = "https://drive.google.com/uc?id=1ZKhEC9mITE226orcMDxqM0uzvPDME5J3";
// let audio = new Audio(path);

const CallingModal = ({ isOpen, onClose, onAnswer, caller, callMethod }) => {
  const { onlineUsers } = ChatState();

  useEffect(() => {
    if (isOpen) {
      // audio.play();
    } else {
      // audio.pause();
      // audio.currentTime = 0;
    }
  }, [isOpen]);

  var callerInfo = Array.from(onlineUsers).find(
    ([socketId, userData]) => socketId === caller
  )?.[1];

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader style={{ textAlign: "center", fontWeight: "bolder",fontSize:"25px" }}>
          {callMethod == "video" ? "Incoming Video Call" : "Audio call"}
        </ModalHeader>
        <ModalBody>
          {
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Avatar
                size="2xl"
                cursor="pointer"
                name={callerInfo.name}
                src={callerInfo.pic}
              />
              <Text
                fontFamily={"Bree Serif"}
                fontSize={"22px"}
                marginTop={"8px"}
              >
                <span style={{ color: "green", fontWeight: "bolder" }}>
                  {callerInfo.name}{" "}
                </span>{" "}
                - is calling...
              </Text>
            </div>
          }
        </ModalBody>
        <ModalFooter>
          <Box
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
          >
            <Button colorScheme="green" onClick={onAnswer} marginRight={4}>
              Proceed to Call
            </Button>
            <Button colorScheme="red" onClick={onClose}>
              Reject
            </Button>
          </Box>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CallingModal;
