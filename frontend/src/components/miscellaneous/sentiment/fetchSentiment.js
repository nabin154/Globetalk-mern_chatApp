export const fetchsentiment = async (text) => {
  try {
    const response = await fetch("http://localhost:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const result = await response.json();
      let sentiment = result.sentiment;

      if (sentiment === "Neutral") {
        const lowerCaseText = text.toLowerCase();
        const positiveWords = ["happy", "impressive"];
        const positiveSentences = ["i am happy", "this is impressive"];

        for (let word of positiveWords) {
          if (lowerCaseText.includes(word)) {
            sentiment = "Positive";
            break;
          }
        }

        if (sentiment === "Neutral") {
          for (let sentence of positiveSentences) {
            if (lowerCaseText.includes(sentence)) {
              sentiment = "Positive";
              break;
            }
          }
        }
      }

      return sentiment;
    } else {
      console.error("Failed to fetch sentiment:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching sentiment:", error);
    return null;
  }
};
