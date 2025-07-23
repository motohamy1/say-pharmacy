import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Search for relevant drug information if query contains drug names
    let drugContext = '';
    if (message.toLowerCase().includes('drug') || message.toLowerCase().includes('medicine') || message.toLowerCase().includes('dosage')) {
      // Extract potential drug names from the message
      const words = message.toLowerCase().split(' ');
      const potentialDrugs = words.filter(word => word.length > 3);
      
      if (potentialDrugs.length > 0) {
        const { data: drugs } = await supabase
          .from('drugs')
          .select('*')
          .or(potentialDrugs.map(drug => `name.ilike.%${drug}%`).join(','))
          .limit(3);
        
        if (drugs && drugs.length > 0) {
          drugContext = `\n\nRelevant drug information:\n${drugs.map(drug => 
            `- ${drug.name}: ${drug.description}, Dosage: ${drug.dosage_info}`
          ).join('\n')}`;
        }
      }
    }

    const systemPrompt = `You are Amira, an AI pharmacy assistant specialized in Egyptian medications. You help users with:
    - Drug information and interactions
    - Dosage calculations
    - Side effects and precautions  
    - Generic alternatives
    - Medication schedules
    
    Always be helpful, accurate, and remind users to consult healthcare professionals for serious medical decisions.
    Keep responses concise and practical.${drugContext}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});