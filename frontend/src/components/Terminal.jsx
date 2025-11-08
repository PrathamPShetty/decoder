import React, { useState, useRef, useEffect } from "react";
import "../styles/terminal.css";
import { BACKEND_URL } from "../config";



const Terminal = () => {
  const [messages, setMessages] = useState([
    { text: "System Boot Initialized... [OK]", type: "system" },
    { text: "Target: ALTIUS 2K25 Security Core", type: "system" },
    { text: questions[0].prompt, type: "prompt" },
  ]);

  const [input, setInput] = useState("");
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);
  const terminalBodyRef = useRef(null);

  const [questions,setQuestion] = useState(1);

  const getQuestions = async() =>{
    try{
      const response = await fetch(`{BACKEND_URL}/flag/${questions}`);
      const data = await response.json();
      if(data.flag){
        const newQuestion = {
          id: questions,
          prompt: `ALTIUS_FLAG_${data.flag.id} > ${data.flag.question}`,
          answer: data.flag.answer,
          successMessage: `ACCESS GRANTED: Correct! You've captured Flag ${data.flag.id}.`,
        };
        setQuestions(prev => [...prev, newQuestion]);
        setQuestion(questions + 1);
      }
    }catch(error){
      console.error("Error fetching question:", error);
    }
  }

  const isFinished = currentFlagIndex >= questions.length;

  useEffect(() => {
    if (terminalBodyRef.current) {
      setTimeout(() => {
        terminalBodyRef.current.scrollTop =
          terminalBodyRef.current.scrollHeight;
      }, 50);
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFinished) return;

    const currentQuestion = questions[currentFlagIndex];
    const userInput = input.trim();
    const currentPromptText = `ALTIUS_FLAG_${currentFlagIndex + 1} > `;

    const inputMessage = {
      text: userInput,
      type: "user-input",
      prompt: currentPromptText,
    };

    let newMessages = [...messages, inputMessage];
    const isCorrect =
      userInput.toLowerCase() === currentQuestion.answer.toLowerCase();

    if (isCorrect) {
      newMessages[newMessages.length - 1].type = "correct-input";
      newMessages.push({ text: currentQuestion.successMessage, type: "success" });

      const nextFlagIndex = currentFlagIndex + 1;

      if (nextFlagIndex < questions.length) {
        newMessages.push({
          text: questions[nextFlagIndex].prompt,
          type: "prompt",
        });
        setCurrentFlagIndex(nextFlagIndex);
      } else {
        setCurrentFlagIndex(nextFlagIndex);
      }
    } else {
      newMessages[newMessages.length - 1].type = "incorrect-input";
      newMessages.push({
        text: `ACCESS DENIED: Incorrect command or flag. Try again for Flag ${currentQuestion.id}.`,
        type: "error",
      });
    }

    setMessages(newMessages);
    setInput("");
  };

  const promptText = isFinished
    ? "GOAL_REACHED > "
    : `ALTIUS_FLAG_${currentFlagIndex + 1} > `;

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
