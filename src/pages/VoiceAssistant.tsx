import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX, Send, Bot, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function VoiceAssistant() {
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hello! I\'m Mira, your pharmacy assistant. I can help you find information about medications. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);


  useEffect(() => {
    // Scroll to bottom of chat when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleStartConversation = () => {
    setIsListening(true);
    setChatMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        role: 'assistant',
        content: 'I\'m listening. How can I help you with your medications today?',
        timestamp: new Date()
      }
    ]);
  };

  const handleEndConversation = () => {
    setIsListening(false);
    setIsSpeaking(false);
    setChatMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        role: 'assistant',
        content: 'Conversation ended. Let me know if you need anything else.',
        timestamp: new Date()
      }
    ]);
  };

  const handleStartSpeaking = () => {
    setIsSpeaking(true);
    setChatMessages(prev => [
      ...prev,
      {
        id: prev.length + 1,
        role: 'assistant',
        content: 'I\'m speaking now. Here\'s some information about medications...',
        timestamp: new Date()
      }
    ]);
  };

  const handleStopSpeaking = () => {
    setIsSpeaking(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);


  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Layout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-semibold">Mira - Pharmacy Assistant</h1>
                <p className="text-xs text-muted-foreground">Specialized in Egyptian medications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span>{isListening ? 'Listening' : 'Voice Ready'}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span>{isSpeaking ? 'Speaking' : 'Audio Ready'}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Chat Area - Full Width */}
          <div className="flex-1 flex flex-col">
            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6"
            >
              <div className="max-w-3xl mx-auto space-y-6">
                {chatMessages.map((message) => (
                  <div 
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                        <Bot className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div 
                      className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 ${message.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none ml-auto' 
                        : 'bg-muted rounded-tl-none'}`}
                    >
                      <div className="font-medium text-sm mb-1">
                        {message.role === 'user' ? 'You' : 'Mira'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center ml-3 mt-1">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-1">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <div>Mira is thinking...</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-border bg-background/80 backdrop-blur-sm p-4">
              <div className="max-w-3xl mx-auto">
                <div className="flex flex-col gap-3">
                  {/* Voice Controls */}
                  <div className="flex justify-center gap-2">
                    {!isListening ? (
                      <Button 
                        onClick={handleStartConversation}
                        size="sm"
                        className="px-4 bg-green-500 hover:bg-green-600"
                      >
                        <Mic className="w-4 h-4 mr-2" />
                        Start Listening
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleEndConversation}
                        variant="destructive"
                        size="sm"
                        className="px-4"
                      >
                        <MicOff className="w-4 h-4 mr-2" />
                        Stop Listening
                      </Button>
                    )}
                    
                    {!isSpeaking ? (
                      <Button 
                        onClick={handleStartSpeaking}
                        variant="outline"
                        size="sm"
                        className="px-4"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Speak Response
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleStopSpeaking}
                        variant="outline"
                        size="sm"
                        className="px-4"
                      >
                        <VolumeX className="w-4 h-4 mr-2" />
                        Stop Speaking
                      </Button>
                    )}
                  </div>
                  
                  {/* Text Input */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Message Mira..."
                        className="w-full min-h-[60px] max-h-[120px] rounded-2xl border border-border bg-background px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows={1}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={inputValue.trim() === ''}
                        size="icon"
                        className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-center text-xs text-muted-foreground">
                    <p>Powered by Gemini AI • Available in Arabic and English</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}