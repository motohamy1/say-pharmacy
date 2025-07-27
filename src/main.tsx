import { createRoot } from 'react-dom/client'
import { AiAssistantProvider } from '@sista/ai-assistant-react';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(

    <AiAssistantProvider apiKey="pk-sista-0e9afded-a9d9-4687-a7ea-f44dc649951d">
    <App />
  </AiAssistantProvider>,
);
