import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Avatar,
} from "@chakra-ui/react";
import { PhoneIcon, AddIcon } from "@chakra-ui/icons";
import io from "socket.io-client";
import { ChatState } from "../../Context/ChatProvider";
const Peer = window.SimplePeer;
const socket = io.connect("http://localhost:8080");

function VideoModal({
  receiverId,
  onClose,
  receivingCall,
  setReceivingCall,
  caller,
  setCaller,
  callerSignal,
  setCallerSignal,
  callUser,
  userVideo,
  callAccepted,
  setCallAccepted,
  connectionRef,
  stream,
  me,
  setMe,
  setStream,
  setFetchAgain,
  fetchAgain,
  callType,
  myVideo,
  // receiverId,
}) {
  const [callEnded, setCallEnded] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { onlineUsers, user } = ChatState();
  var callerInfo = Array.from(onlineUsers).find(
    ([socketId, userData]) => socketId === caller
  )?.[1];

  useEffect(() => {
    let timerInterval;

    if (callAccepted && !callEnded) {
      timerInterval = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => {
      clearInterval(timerInterval);
    };
  }, [callAccepted, callEnded]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: callType === "video" ? true : false, audio: true })
      .then((stream) => {
        setStream(stream);
      });

    const mySocketId = Array.from(onlineUsers).find(
      ([socketId, userData]) => userData._id === user._id
    )?.[0];
    setMe(mySocketId);

    // socket.on("incommingCall", (data) => {
    //   console.log(data);
    //   setReceivingCall(true);
    //   setCaller(data.from);
    //   setCallerSignal(data.signal);
    // });
  }, []);

  useEffect(() => {
    if (myVideo.current && stream && callType) {
      myVideo.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (userVideo.current && callAccepted && !callEnded && stream && callType) {
      userVideo.current.srcObject = stream;
    }
  }, [callAccepted]);

  const answerCall = () => {
    const receiverSocketId = Array.from(onlineUsers).find(
      ([socketId, userData]) => userData._id === user._id
    )?.[0];
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("answerCall", {
        signal: data,
        to: caller,
        from: receiverSocketId,
      });
    });
    peer.on("stream", (stream) => {
      userVideo.current.srcObject = stream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setReceivingCall(false);
    setCallEnded(true);
    setCallAccepted(false);
    setCaller(null);
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
    }
    setFetchAgain(!fetchAgain);
    socket.emit("endCall", { to: caller });
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {callType === "video" ? "Video Call" : "Audio Call"}
        </ModalHeader>
        <ModalBody>
          <div className="container">
            <div className="video-container">
              <div
                className="video"
                style={{
                  width: "50%",
                  float: "left",
                }}
              >
                {stream && (
                  <div>
                    <video
                      playsInline
                      muted
                      ref={myVideo}
                      autoPlay
                      style={{
                        width: "100%",
                        display: callType == "video" ? "inline" : "none",
                      }}
                    />
                    {callType == "audio" && (
                      <Avatar
                        size="2xl"
                        cursor="pointer"
                        name={user.name}
                        src={user.pic}
                      />
                    )}
                    <h3>{user.name}</h3>
                  </div>
                )}
              </div>
              <div
                className="video"
                style={{
                  width: "50%",

                  float: "left",
                }}
              >
                {callAccepted && !callEnded ? (
                  <div>
                    <video
                      playsInline
                      ref={userVideo}
                      autoPlay
                      style={{
                        width: "100%",
                        display: callType == "video" ? "inline" : "none",
                      }}
                    />
                    {callType == "audio" && (
                      <Avatar
                        size="2xl"
                        cursor="pointer"
                        name={callerInfo.name}
                        src={callerInfo.pic}
                      />
                    )}
                    {callerInfo && <h3>{callerInfo.name}</h3>}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="red" onClick={leaveCall} marginRight={4}>
            End Call
          </Button>
          {!receivingCall ? (
            <IconButton
              marginRight={4}
              colorScheme="blue"
              aria-label="call"
              onClick={callUser}
              icon={<PhoneIcon />}
            />
          ) : null}

          <div>
            {receivingCall && !callAccepted ? (
              <div className="caller">
                <Button marginLeft={4} colorScheme="green" onClick={answerCall}>
                  Answer
                </Button>
              </div>
            ) : null}
          </div>
          <div>
            {callAccepted && !callEnded && (
              <span style={{ marginRight: "10px" }}>{`Duration: ${formatTime(
                elapsedTime
              )}`}</span>
            )}
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
export default VideoModal;
