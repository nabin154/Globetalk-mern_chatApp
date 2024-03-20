import React, { useState, useEffect } from "react";
import axios from "axios";

const MoodChecker = ({ selectedChatUserId }) => {
  const [mood, setMood] = useState(null);

  useEffect(() => {
    const fetchMessagesAndCalculateMood = async () => {
      try {
        const response = await axios.get(`/messages/${selectedChatUserId}`);
        const messages = response.data.slice(0, 30); 

        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        for (let message of messages) {
          if (message.sentiment === "positive") {
            positiveCount++;
          } else if (message.sentiment === "negative") {
            negativeCount++;
          } else if (message.sentiment === "neutral") {
            neutralCount++;
          }
        }

        let calculatedMood;
        if (messages.length > 5) {
          if (positiveCount > negativeCount && positiveCount > neutralCount) {
            calculatedMood = "happy";
          } else {
            calculatedMood = "not happy";
          }
        } else {
          calculatedMood = "neutral";
        }

        setMood(calculatedMood);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessagesAndCalculateMood();
    const intervalId = setInterval(
      fetchMessagesAndCalculateMood,
      2 * 60 * 1000
    );

    return () => clearInterval(intervalId);
  }, [selectedChatUserId]);

  return (
    <div>
      {mood !== null ? (
        <p>Mood of selected chat user: {mood}</p>
      ) : (
        <p>Loading mood...</p>
      )}
    </div>
  );
};

export default MoodChecker;
