'use server';
/**
 * @fileOverview A simple chat bot flow.
 *
 * - chat - A function that handles the chat interaction.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const getCurrentTime = ai.defineTool(
  {
    name: 'getCurrentTime',
    description: 'Get the current time for a given timezone. If no timezone is specified, it will use UTC.',
    inputSchema: z.object({
      timeZone: z.string().optional().describe('The timezone to get the current time for, e.g., "America/New_York", "Asia/Kolkata", or "UTC".'),
    }),
    outputSchema: z.string(),
  },
  async ({timeZone = 'UTC'}) => {
    try {
      return new Date().toLocaleTimeString('en-US', { timeZone: timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      // Fallback for invalid timezone
      return new Date().toLocaleTimeString('en-US', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
  }
);


const getCurrentDate = ai.defineTool(
  {
    name: 'getCurrentDate',
    description: 'Get the current date.',
    outputSchema: z.string(),
  },
  async () => new Date().toLocaleDateString()
);

const chatFlow = ai.defineFlow(
    {
        name: 'chatFlow',
        inputSchema: z.string(),
        outputSchema: z.string(),
    },
    async (prompt) => {
        const response = await ai.generate({
          prompt: prompt,
          history: [],
          tools: [getCurrentTime, getCurrentDate],
          system: 'You are a friendly and helpful AI assistant. Answer the user\'s question. Use the available tools if necessary. When asked for the time, provide it for the user\'s requested timezone if they specify one.',
        });
        
        return response.text;
    }
);

export async function chat(prompt: string): Promise<string> {
    return chatFlow(prompt);
}
