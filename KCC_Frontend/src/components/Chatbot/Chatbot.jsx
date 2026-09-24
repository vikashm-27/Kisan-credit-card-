import React, { useState, useRef, useEffect } from 'react';
import { X, Send, RotateCcw, Bot } from 'lucide-react';
import axios from 'axios';
import './Chatbot.css';

// SVG for a Farmer standing with crop
const FarmerIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
    <path d="M7 21v-8a5 5 0 0 1 10 0v8" />
    <path d="M3 21h18" />
    <path d="M5 14s2-2 3 0" />
    <path d="M19 14s-2-2-3 0" />
    <path d="M8 21v-4" />
    <path d="M16 21v-4" />
    <path d="M10 21v-2" />
    <path d="M14 21v-2" />
  </svg>
);

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const initialGreeting = {
    role: 'bot',
    text: "Hello! I am your AI KCC Guide. I can help you with Kisan Credit Card applications, KYC, and loan eligibility. How can I assist you today?",
    time: new Date()
  };

  const suggestions = [
    "What are the KCC benefits?",
    "Documents needed for KYC?",
    "Am I eligible for a loan?",
    "How to process land verification?"
  ];

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([initialGreeting]);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    if (!textToSend.trim()) return;

    const newUserMsg = { role: 'user', text: textToSend, time: new Date() };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:4005/api/chat', {
        messages: updatedMessages.map(m => ({ role: m.role, text: m.text }))
      });

      if (response.data.success) {
        setMessages(prev => [...prev, {
          role: 'bot',
          text: response.data.text,
          time: new Date()
        }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'bot',
        text: "I'm sorry, I'm having trouble connecting to the server right now. Please try again later.",
        time: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const handleRestart = () => {
    setMessages([initialGreeting]);
    setInput('');
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Bot size={20} />
              </div>
              <div className="chatbot-title">
                <h3>KCC AI Guide</h3>
                <span>Online</span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button className="chatbot-action-btn" onClick={handleRestart} title="Restart Chat">
                <RotateCcw size={16} />
              </button>
              <button className="chatbot-action-btn" onClick={() => setIsOpen(false)} title="Close Chat">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message-wrapper ${msg.role}`}>
                <div className="message-bubble">{msg.text}</div>
                <span className="message-time">
                  {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            {isTyping && (
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="chatbot-suggestions">
              {suggestions.map((sug, idx) => (
                <div key={idx} className="suggestion-chip" onClick={() => handleSend(sug)}>
                  {sug}
                </div>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chatbot-input-area">
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <button 
              className="chatbot-send-btn" 
              onClick={() => handleSend(input)}
              disabled={!input.trim() || isTyping}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Launcher */}
      {!isOpen && (
        <div className="chatbot-launcher" onClick={() => setIsOpen(true)}>
          <FarmerIcon />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
