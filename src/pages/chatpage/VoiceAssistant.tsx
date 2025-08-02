// src/components/ChatAssistant.tsx
import { Layout } from '@/components/Layout/Layout';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import './ChatAssistant.css'; // Updated CSS import

// Define TypeScript interface for messages
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  isError?: boolean;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // --- Voice State ---
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState(''); // Real-time interim transcript
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Function to scroll the chat history to the bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize Speech Recognition
  useEffect(() => {
    // Use the correct vendor prefix for SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Speech Recognition is not supported in this browser.");
      console.warn("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        console.log("Speech Recognition Started");
        setIsListening(true);
        setVoiceError(null);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
        } else {
            interimTranscript += transcript;
        }
      }

      // Update UI with interim results
      setTranscript(interimTranscript);

      // If we have a final transcript, add it to the input
      if (finalTranscript) {
          const newInputValue = (inputValue + finalTranscript).trim();
          setInputValue(newInputValue);
          setTranscript('');
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech Recognition Error:", event.error);
      setVoiceError(`Speech Recognition Error: ${event.error}`);
      setIsListening(false);
      setTranscript('');
    };

    recognition.onend = () => {
      console.log("Speech Recognition Ended");
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [inputValue]);

  const toggleListening = () => {
    if (isLoading) return;

    if (isListening) {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    } else {
      // Ensure any previous transcript is cleared
      setTranscript('');
      setVoiceError(null);
      try {
          recognitionRef.current.continuous = true;
          recognitionRef.current.start();
          console.log("Requested to start listening...");
      } catch (err) {
          console.error("Error starting speech recognition:", err);
          setVoiceError("Could not start microphone. Please check permissions.");
      }
    }
  };

  const handleSendMessage = async () => {
    const message = (inputValue + transcript).trim();
    if (message === '' || isLoading) return;

    // Stop listening if it's on
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
    }

    // Add user message to state
    const newUserMessage: Message = { id: Date.now(), text: message, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, newUserMessage]);
    setInputValue('');
    setTranscript('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to state
      const newAiMessage: Message = { id: Date.now() + 1, text: data.reply, sender: 'ai' };
      setMessages(prevMessages => [...prevMessages, newAiMessage]);

      // --- Optional: Speak the AI response ---
      if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.reply);
          utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('en'));
          speechSynthesis.speak(utterance);
      }
      // --- End Optional ---

    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage: Message = { id: Date.now(), text: "Sorry, I couldn't process that request. Please try again.", sender: 'ai', isError: true };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Determine the text to display in the input field
  const displayText = inputValue + (transcript ? (inputValue ? ' ' : '') + transcript : '');
  const inputPlaceholder = displayText || "Type or press mic to speak...";

  // Determine the mic button icon
  const MicButtonIcon = isListening ? Square : Mic;

  return (
    <Layout>
      <div className="chat-page-container">
        
        {/* Always show chat history */}
        <div className="chat-history">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender} ${msg.isError ? 'error' : ''}`}>
              <div className="message-text">{msg.text}</div>
            </div>
          ))}
          {(isLoading || isListening) && (
            <div className="message ai">
              <div className="message-text typing-indicator">
                {isListening ? "Listening..." : "Thinking..."}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Always show input area */}
        <div className="chat-input-area">
          <div className="input-wrapper">
            {/* Use a div for display and textarea for input when not listening */}
            {isListening ? (
              <div className="input-display">{inputPlaceholder}</div>
            ) : (
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type or press mic to speak..."
                disabled={isLoading}
                rows={1}
              />
            )}
            
            {/* Mic Button - Always present */}
            <button
              onClick={toggleListening}
              disabled={isLoading}
              className={`mic-button ${isListening ? 'listening' : ''}`}
              aria-label={isListening ? "Stop listening" : "Start voice input"}
            >
              <MicButtonIcon size={20} />
            </button>
            
            {/* Send Button - Appears when there's text and not listening */}
            {displayText.trim() !== '' && !isListening && (
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="send-button"
                aria-label="Send message"
              >
                <Send size={20} />
              </button>
            )}
          </div>
          {voiceError && <p className="voice-error">{voiceError}</p>}
        </div>
      </div>
    </Layout>
  );
};

export default ChatAssistant;