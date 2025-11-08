import React, { useState, useRef, useEffect } from "react";
import "../styles/terminal.css";
import { BACKEND_URL } from "../config";
import axios from "axios";

const Terminal = () => {
  const didFetch = useRef(false);
  const terminalBodyRef = useRef(null);

  const [messages, setMessages] = useState([
    { text: "System Boot Initialized... [OK]", type: "system" },
    { text: "Target: ALTIUS 2K25 Security Core", type: "system" },
  ]);
  const [questions, setQuestions] = useState([]);
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0); // start at 0
  const [input, setInput] = useState("");

  const TOTAL_FLAGS = 4; // total number of flags

  // Fetch question by flag ID
  const getQuestion = async (flagId) => {
    try {
      const response = await fetch(`${BACKEND_URL}/flag/${flagId}`);
      const data = await response.json();
      console.log("Fetched question data:", data);
      if (data.flag) {
        setQuestions((prev) => [
          ...prev,
          {
            id: data.flagId,
            prompt: data.flag.question,
            hint: data.flag.hint,
          },
        ]);

        console.log("Questions state updated:", questions[data.flagId - 1]);

        // Show question in terminal
        setMessages((prev) => [
          ...prev,
          { text: data.flag.question, type: "prompt" },
        ]);
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setMessages((prev) => [
        ...prev,
        { text: `Error fetching Flag ${flagId}`, type: "error" },
      ]);
    }
  };

  const checkAnswer = async (flagId, answer) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/flag/${flagId}`, {
        answer,
      });
      return response.data.correct;
    } catch (error) {
      console.error("Error checking answer:", error);
      return false;
    }
  };

  // Initial fetch of first flag
  useEffect(() => {
    if (!didFetch.current) {
      getQuestion(1); // fetch first flag
      didFetch.current = true;
    }
  }, []);

  // Scroll terminal to bottom on new messages
  useEffect(() => {
    if (terminalBodyRef.current) {
      setTimeout(() => {
        terminalBodyRef.current.scrollTop =
          terminalBodyRef.current.scrollHeight;
      }, 50);
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isFinished) return;

    const currentQuestion = questions[currentFlagIndex];
    if (!currentQuestion) return;

    const userInput = input.trim();
    const currentPromptText = `ALTIUS_FLAG_${currentQuestion.id} > `;

    const inputMessage = {
      text: userInput,
      type: "user-input",
      prompt: currentPromptText,
    };

    let newMessages = [...messages, inputMessage];

    const isCorrect = await checkAnswer(currentQuestion.id, userInput);

    if (isCorrect) {
      newMessages[newMessages.length - 1].type = "correct-input";
      newMessages.push({
        text: `ACCESS GRANTED: Flag ${currentQuestion.id} verified.`,
        type: "success",
      });

      const nextIndex = currentFlagIndex + 1;

      if (nextIndex < TOTAL_FLAGS) {
        // Fetch next flag
        await getQuestion(nextIndex + 1);
      } else {
        newMessages.push({
          text: "MISSION COMPLETE: All flags acquired!",
          type: "system",
        });
      }

      setCurrentFlagIndex(nextIndex);
    } else {
      newMessages[newMessages.length - 1].type = "incorrect-input";
      newMessages.push({
        text: `ACCESS DENIED: Incorrect command. Try again for Flag ${currentQuestion.id}.`,
        type: "error",
      });
    }

    setMessages(newMessages);
    setInput("");
  };

  const isFinished = currentFlagIndex >= TOTAL_FLAGS;

  const promptText = isFinished
    ? "GOAL_REACHED > "
    : `ALTIUS_FLAG_${questions[currentFlagIndex]?.id || 1} > `;
  return (
    <div className="terminal-container">
      <div className="terminal-header">ALTIUS 2K25 - CAPTURE THE FLAG</div>

      <div className="terminal-body" ref={terminalBodyRef}>
        {messages.map((msg, index) => (
          <p key={index} className={msg.type}>
            {(msg.type === "correct-input" || msg.type === "incorrect-input") ? (
              <>
                <span className="user-prompt">{msg.prompt}</span>
                {msg.text}
              </>
            ) : (
              msg.text
            )}
          </p>
        ))}

        {!isFinished && (
          <p className="active-input-line">
            <span className="user-prompt">{promptText}</span>
            <input
              type="text"
              value={input}
              className="terminal-inline-input"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
              autoFocus
              autoComplete="off"
            />
            <span className="cursor-active">█</span>
          </p>
        )}

        {isFinished && (
          <p className="success">
            GOAL_REACHED - Access Granted. Console Locked.
          </p>
        )}
      </div>
    </div>
  );
};

export default Terminal;
