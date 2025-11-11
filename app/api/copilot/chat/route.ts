import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { getShows, getVendors, getSafes, getAssignments } from '@/lib/supabase/queries';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // Fetch current data for context
    const [shows, vendors, safes, assignments] = await Promise.all([
      getShows(),
      getVendors(),
      getSafes(),
      getAssignments(),
    ]);

    // Build context string
    const context = `
Current SafeLogistics Data:
- Shows: ${shows.length} total shows
- Vendors: ${vendors.length} total vendors
- Safes: ${safes.length} total safes
- Assignments: ${assignments.length} active assignments

Recent shows: ${shows.slice(0, 5).map((s) => `${s.show_name} (${s.start_date})`).join(', ')}

Available vendors: ${vendors.slice(0, 5).map((v) => v.name).join(', ')}
`;

    const systemPrompt = `You are SafeLogistics Copilot, an AI assistant helping logistics coordinators manage trade show safe storage and transport.

Your capabilities:
- Answer questions about shows, vendors, safes, and assignments
- Suggest route optimizations
- Help assign vendors to shows based on distance and capacity
- Track safe locations and movements
- Provide insights about scheduling and logistics

Important rules:
- Only use data provided in the context - never hallucinate vendor names, show names, or distances
- If you don't have information, say so clearly
- Be concise and actionable
- For route optimization suggestions, explain the reasoning

Current context:
${context}

When users ask about specific shows, vendors, or safes, use the provided context. If the information isn't in the context, tell them you need to check the database.`;

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: messages.map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      temperature: 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Error in copilot chat:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
