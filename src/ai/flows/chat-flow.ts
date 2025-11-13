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
    description: 'Get the current time.',
    outputSchema: z.string(),
  },
  async () => new Date().toLocaleTimeString()
);

const getCurrentDate = ai.defineTool(
  {
    name: 'getCurrentDate',
    description: 'Get the current date.',
    outputSchema: z.string(),
  },
  async () => new Date().toLocaleDateString()
);

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    system: 'You are a friendly and helpful AI assistant. Answer the user\'s question. Use the available tools if necessary.',
    tools: [getCurrentTime, getCurrentDate],
});


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
          promptConfig: chatPrompt.config,
        });
        
        return response.text;
    }
);

export async function chat(prompt: string): Promise<string> {
    return chatFlow(prompt);
}
