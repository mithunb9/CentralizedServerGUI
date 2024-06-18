import React, { useState, useEffect } from "react";
import "./App.css";

type WSMessage = {
  message_type: string;
};

type Context = WSMessage & {
  message_type: "context";
  clients: {
    id: string;
    type: string;
  }[];
};

type Message = WSMessage & {
  content: string;
};

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [ip, setIp] = useState<string>("ws://localhost:8765");
  const [context, setContext] = useState<Context | null>(null);
  const [user, setUser] = useState<string>("mithunb9");
  const [inputMessage, setInputMessage] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    if (isLoggedIn && ip && user) {
      const socket = new WebSocket(ip);
      setWs(socket);

      socket.onopen = () => {
        console.log("WebSocket connection established to ", ip);

        // send user
        socket.send(`${user} user`);
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const message_type = message.message_type;

        if (message_type === "context") {
          // Save context to state
          setContext(message);
        } else {
          // Save message to messages
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => {
        socket.close();
      };
    }
  }, [isLoggedIn, ip, user]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(inputMessage);
      setInputMessage("");
    }
  };

  const handleLogin = () => {
    if (ip && user) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div>
      <h2>WebSocket Client</h2>
      <div className="flex" style={{ display: "flex", flexDirection: "row" }}>
        {context &&
          context.clients.map((content, index) => (
            <div
              key={index}
              style={{ display: "inline-block", margin: "10px" }}
            >
              <h3>Context {index + 1}</h3>
              <ul>
                <p>
                  Type: {content.type} Name: {content.id}
                </p>
                <img src={`/${content.type}.png`} width={200} />
              </ul>
            </div>
          ))}
      </div>
      {!isLoggedIn ? (
        <div>
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Enter WebSocket IP"
          />
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Enter Username"
          />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <div>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Enter message"
            />
            <button onClick={sendMessage}>Send</button>
          </div>
          <div>
            <h3>Messages</h3>
            <ul>
              {messages.map((msg, index) => (
                <li key={index}>{msg.content}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
