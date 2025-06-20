"use client";

import { useState, useEffect, useRef } from "react";
import { useAgent } from "./hooks/useAgent";
import ReactMarkdown from "react-markdown";

/**
 * Home page for AiPI
 *
 * @returns {React.ReactNode} The home page
 */
export default function Home() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, isThinking } = useAgent();

  // Ref for the messages container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Auto-scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const onSendMessage = async () => {
    if (!input.trim() || isThinking) return;
    const message = input;
    setInput("");
    await sendMessage(message);
  };

  return (
    <div className="brutalist-container" style={{ 
      width: '100%', 
      maxWidth: '900px', 
      height: '70vh',
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Chat Messages */}
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="welcome-card">
            <h3>WELCOME TO AiPI</h3>
            <p>START A CONVERSATION WITH THE AI</p>
            <div style={{ 
              marginTop: '24px',
              border: '3px solid #000000',
              padding: '16px',
              backgroundColor: '#ffffff',
              boxShadow: '4px 4px 0px #000000'
            }}>
              <p style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px' }}>
                TYPE YOUR MESSAGE BELOW TO BEGIN
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={msg.sender === "user" ? "message-user" : "message-ai"}
            >
              <ReactMarkdown
                components={{
                  a: props => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        borderBottom: '2px solid #000000',
                        padding: '2px 4px',
                        fontWeight: '700'
                      }}
                    />
                  ),
                  p: props => <p style={{ margin: '0', lineHeight: '1.6', fontSize: '14px' }} {...props} />,
                  code: props => (
                    <code style={{ 
                      backgroundColor: '#f0f0f0', 
                      padding: '4px 8px', 
                      fontFamily: 'Courier New, monospace',
                      border: '2px solid #000000',
                      fontSize: '12px',
                      fontWeight: '700'
                    }} {...props} />
                  ),
                  pre: props => (
                    <pre style={{ 
                      backgroundColor: '#f0f0f0', 
                      padding: '16px', 
                      overflow: 'auto', 
                      margin: '16px 0',
                      border: '3px solid #000000',
                      boxShadow: '4px 4px 0px #000000',
                      fontSize: '12px',
                      fontWeight: '700'
                    }} {...props} />
                  ),
                  h1: props => <h1 style={{ fontSize: '20px', margin: '16px 0 8px 0', fontWeight: '900' }} {...props} />,
                  h2: props => <h2 style={{ fontSize: '18px', margin: '12px 0 6px 0', fontWeight: '900' }} {...props} />,
                  h3: props => <h3 style={{ fontSize: '16px', margin: '10px 0 5px 0', fontWeight: '900' }} {...props} />,
                  ul: props => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                  ol: props => <ol style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                  li: props => <li style={{ margin: '4px 0', lineHeight: '1.4' }} {...props} />,
                  blockquote: props => (
                    <blockquote style={{ 
                      borderLeft: '4px solid #000000',
                      paddingLeft: '16px',
                      margin: '16px 0',
                      fontStyle: 'italic',
                      backgroundColor: '#f8f8f8',
                      padding: '12px 16px',
                      border: '2px solid #000000'
                    }} {...props} />
                  )
                }}
              >
                {msg.text}
              </ReactMarkdown>
            </div>
          ))
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="thinking-indicator">
            THINKING...
          </div>
        )}

        {/* Invisible div to track the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="input-area">
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
          <input
            type="text"
            style={{ flex: '1' }}
            placeholder="TYPE YOUR MESSAGE HERE..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSendMessage()}
            disabled={isThinking}
          />
          <button
            onClick={onSendMessage}
            disabled={isThinking}
            style={{ height: '60px' }}
          >
            SEND
          </button>
        </div>
        <div style={{ 
          marginTop: '12px',
          fontSize: '10px',
          fontWeight: '700',
          letterSpacing: '1px',
          textAlign: 'center',
          color: '#666666'
        }}>
          PRESS ENTER OR CLICK SEND
        </div>
      </div>
    </div>
  );
}
