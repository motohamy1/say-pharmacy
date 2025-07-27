import { Layout } from "@/components/Layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";

export default function VoiceAssistant() {


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
          <div className="w-32 h-32 mx-auto bg-primary/10 rounded-full 
                          flex items-center justify-center">

              <div className="animate-pulse">
                <Mic className="w-16 h-16 text-primary" />
              </div>
            
              <div className="animate-pulse">
                <Volume2 className="w-16 h-16 text-primary" />
              </div>
              <div className="animate-pulse">
                <Volume2 className="w-16 h-16 text-primary" />
              </div>
            : 
              <Mic className="w-16 h-16 text-muted-foreground" />
            
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-semibold">
            </h2>
            <p className="text-muted-foreground">
            </p>
          </div>

          <div className="flex justify-center gap-4">
  
              <Button 
                size="lg"
                className="px-8"
              >
                
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Conversation
                  </>
                
              </Button>
            
              <Button 
                variant="destructive"
                size="lg"
                className="px-8"
              >
                <MicOff className="w-5 h-5 mr-2" />
                End Conversation
              </Button>
            
            
              <Button 
                variant="outline"
                size="lg"
                className="px-8"
              >
                <VolumeX className="w-5 h-5 mr-2" />
                Stop Speaking
              </Button>
    
          </div>

          <div className="text-sm text-muted-foreground">
            <p>Powered by Gemini AI</p>
            <p>Available in Arabic and English</p>
          </div>
        </Card>
      </div>
    </Layout>
  )};