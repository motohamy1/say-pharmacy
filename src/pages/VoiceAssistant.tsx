import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";

export default function VoiceAssistant() {
  const {
    isListening,
    isConnecting,
    isSpeaking,
    transcript,
    response,
    startListening,
    stopListening,
    stopSpeaking,
  } = useVoiceAssistant();

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">AI Voice Assistant</h1>
          <p className="text-muted-foreground">
            Meet Amira, your intelligent pharmacy assistant specialized in Egyptian medications
          </p>
        </div>

        <Card className="p-8 text-center space-y-6">
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            {isConnecting ? (
              <div className="animate-pulse">
                <Mic className="w-16 h-16 text-primary" />
              </div>
            ) : isListening ? (
              <div className="animate-pulse">
                <Volume2 className="w-16 h-16 text-primary" />
              </div>
            ) : isSpeaking ? (
              <div className="animate-pulse">
                <Volume2 className="w-16 h-16 text-primary" />
              </div>
            ) : (
              <Mic className="w-16 h-16 text-muted-foreground" />
            )}
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
              {isConnecting ? "Connecting to Amira..." : 
               isListening ? "Amira is listening..." : 
               isSpeaking ? "Amira is speaking..." : "Amira is offline"}
            </h2>
            <p className="text-muted-foreground">
              {isConnecting ? "Please wait while we connect you to your AI assistant" :
               isListening ? "Speak now to ask about medications, dosages, or drug interactions" :
               isSpeaking ? "Amira is responding to your question" :
               "Click the button below to start talking with Amira"}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {!isListening ? (
              <Button 
                onClick={startListening}
                disabled={isConnecting || isSpeaking}
                size="lg"
                className="px-8"
              >
                {isConnecting ? (
                  "Connecting..."
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>
            ) : (
              <Button 
                onClick={stopListening}
                variant="destructive"
                size="lg"
                className="px-8"
              >
                <MicOff className="w-5 h-5 mr-2" />
                End Conversation
              </Button>
            )}
            
            {isSpeaking && (
              <Button 
                onClick={stopSpeaking}
                variant="outline"
                size="lg"
                className="px-8"
              >
                <VolumeX className="w-5 h-5 mr-2" />
                Stop Speaking
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Powered by Gemini AI</p>
            <p>Available in Arabic and English</p>
          </div>
        </Card>

        {/* Live Transcript and Response */}
        {(transcript || response) && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {transcript && (
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-primary">You said:</h3>
                <p className="text-sm text-muted-foreground">{transcript}</p>
              </Card>
            )}
            
            {response && (
              <Card className="p-6">
                <h3 className="font-semibold mb-2 text-primary">Amira responds:</h3>
                <p className="text-sm text-muted-foreground">{response}</p>
              </Card>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">What Amira can help with:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Drug information and interactions</li>
              <li>• Dosage calculations</li>
              <li>• Side effects and precautions</li>
              <li>• Generic alternatives</li>
              <li>• Medication schedules</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-2">Voice Commands:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• "Tell me about paracetamol"</li>
              <li>• "Calculate dose for 5-year-old"</li>
              <li>• "What are the side effects?"</li>
              <li>• "Find generic alternatives"</li>
              <li>• "Check drug interactions"</li>
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
}