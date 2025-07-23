import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UseVoiceAssistantReturn {
  isListening: boolean;
  isConnecting: boolean;
  isSpeaking: boolean;
  transcript: string;
  response: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
}

export const useVoiceAssistant = (): UseVoiceAssistantReturn => {
  const [isListening, setIsListening] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
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

  const sendToAI = useCallback(async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-pharmacy-assistant', {
        body: { message, context: 'voice_interaction' }
      });

      if (error) throw error;
      
      setResponse(data.response);
      speak(data.response);
      
    } catch (error) {
      console.error('AI Assistant Error:', error);
      toast({
        title: "AI Error",
        description: "Failed to get response from Amira. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

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
        }
        
        toast({
          title: "Speech Recognition Error",
          description: errorMessage,
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
      toast({
        title: "Microphone Error",
        description: "Failed to access microphone. Please check permissions.",
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
    response,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};