import { openai } from '@ai-sdk/openai';
import { streamText, embed } from 'ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Get the last message from the user
    const lastUserMessage = messages[messages.length - 1]?.content;

    if (!lastUserMessage) {
      return new Response('Missing last message', { status: 400 });
    }

    // Generate an embedding for the user's message
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: lastUserMessage,
    });

    // Query the database for similar items
    const { data: similarItems, error: matchError } = await supabase.rpc(
      'match_items',
      {
        query_embedding: embedding,
        match_threshold: 0.75,
        match_count: 5,
      }
    );

    if (matchError) {
      console.error('Error matching items:', matchError);
      return new Response('Error matching items', { status: 500 });
    }

    const context = similarItems
      .map((item: any) => `- ${item.content}`)
      .join('\n');

    const systemPrompt = `You are SafeLogistics Copilot, an AI assistant helping logistics coordinators manage trade show safe storage and transport.

You are an expert in this system and have access to real-time data.
When answering, you MUST use the information provided in the "Relevant Context" section.
Do not make up information. If the context does not provide the answer, say "I could not find that information in the database."

Relevant Context:
${context || 'No relevant information found in the database for this query.'}
`;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      temperature: 0.2,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in copilot chat:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
