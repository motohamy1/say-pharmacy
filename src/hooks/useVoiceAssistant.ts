import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UseVoiceAssistantReturn {
  isListening: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  transcript: string;
  messages: Message[];
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  sendMessage: (message: string) => Promise<void>;
}

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { toast } = useToast();

  const checkSpeechSupport = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome or Edge.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [toast]);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Speech Synthesis Not Supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({
        title: "Speech Error",
        description: "Failed to speak the response.",
        variant: "destructive",
      });
    };

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [toast]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);



  const processDrugQuery = useCallback(async (message: string): Promise<any[] | null> => {
    const drugKeywords = ['drug', 'medication', 'pill', 'medicine', 'drugname'];
    const messageLower = message.toLowerCase();

  //   for (const keyword of drugKeywords) {
  //     if (messageLower.includes(keyword)) {
  //       const keywordIndex = messageLower.indexOf(keyword);
  //       // Try to extract a potential drug name after the keyword
  //       const potentialDrugName = message.substring(keywordIndex + keyword.length).trim();
  //       if (potentialDrugName) {
  //         // Basic cleaning: remove punctuation that might be attached
  //         const cleanedDrugName = potentialDrugName.replace(/[.,!?;:]$/, '').trim();
  //         if (cleanedDrugName) {
  //           const data = await fetchDrugData(cleanedDrugName);
  //           if (data && data.length > 0) {
  //             return data; // Return the first found drug data
  //           }
  //         }
  //       }
  //     }
  //   }
  //   return null; 
  // }, [fetchDrugData]); 

  // const sendToAI = useCallback(async (message: string) => {
  //   setMessages((prev) => [...prev, { role: 'user', content: message }]);
    
  //   const drugData = await processDrugQuery(message); 

  //   try {
  //     const { data, error } = await supabase.functions.invoke('ai-pharmacy-assistant', {
  //       body: { message, context: 'voice_interaction', drugData } // Pass drugData here
  //     });

  //     if (error) throw error;
  //     console.log("AI Response Data:", data);
  //     setMessages((prev) => [...prev, { role: 'assistant', content: data.response }]);
  //     speak(data.response);
      
  //   } catch (error) {
  //     console.error('AI Assistant Error:', error);
  //     toast({
  //       title: "AI Error",
  //       description: "Failed to get response from Amira. Please try again.",
  //       variant: "destructive",
  //     });
  //   }
  // }, [processDrugQuery, speak, toast]); 

  const sendMessage = async (message: string) => {
    if (!message.trim()) return;
    await sendToAI(message);
  };

  const startListening = useCallback(async () => {
    if (!checkSpeechSupport()) return;

    setIsConnecting(true);
    
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsConnecting(false);
        setIsListening(true);
        setTranscript('');
        toast({
          title: "Amira is listening",
          description: "Your AI pharmacy assistant is ready to help",
        });
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);

        // Process final transcript
        if (finalTranscript.trim()) {
          sendToAI(finalTranscript.trim());
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsConnecting(false);
        
        let errorMessage = "Speech recognition failed. Please try again.";
        if (event.error === 'no-speech') {
          errorMessage = "No speech detected. Please speak clearly.";
        } else if (event.error === 'not-allowed') {
          errorMessage = "Microphone access denied. Please allow microphone access.";
        } else if (event.error === 'network') {
          errorMessage = "Network error: Speech recognition service is unavailable. Please check your internet connection.";
        }
        
        toast({
          title: "Speech Recognition Error",
          description: event.error === 'network'
            ? "Network error: Speech recognition service is unavailable. Please check your internet connection."
            : errorMessage,
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
        setIsConnecting(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      
    } catch (error) {
      setIsConnecting(false);
      let errorMessage = "Failed to access microphone. Please check permissions.";
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
            break;
          case 'NotFoundError':
            errorMessage = "No microphone found. Please ensure a microphone is connected.";
            break;
          case 'NotReadableError':
            errorMessage = "Microphone is not readable. It might be in use by another application.";
            break;
          default:
            errorMessage = `Microphone error: ${error.name}. Please check permissions.`;
        }
      }
      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [checkSpeechSupport, sendToAI, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setIsConnecting(false);
    toast({
      title: "Conversation ended",
      description: "Amira is now offline",
    });
  }, [toast]);

  return {
    isListening,
    isConnecting,
    isSpeaking,
    transcript,
    messages,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    sendMessage,
  };
},)}; 