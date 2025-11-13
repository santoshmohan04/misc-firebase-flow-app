
'use server';
/**
 * @fileOverview A set of AI tools for interacting with Google Calendar.
 *
 * - listCalendarEvents - Lists events from the user's primary Google Calendar.
 * - createCalendarEvent - Creates a new event in the user's primary Google Calendar.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { google } from 'googleapis';

// Setup OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Helper to get an authenticated calendar client
async function getCalendarClient(accessToken: string) {
  oAuth2Client.setCredentials({ access_token: accessToken });
  return google.calendar({ version: 'v3', auth: oAuth2Client });
}


// --- Tool Definitions (Internal to this file) ---

const ListEventsInputSchema = z.object({
  accessToken: z.string().describe('The user\'s Google OAuth access token.'),
  maxResults: z.number().optional().default(10).describe('Maximum number of events to return.'),
});

const listEventsTool = ai.defineTool(
  {
    name: 'listEventsTool',
    description: 'List upcoming events from the user\'s primary Google Calendar.',
    inputSchema: ListEventsInputSchema,
    outputSchema: z.any(),
  },
  async ({ accessToken, maxResults }) => {
    try {
      const calendar = await getCalendarClient(accessToken);
      const now = new Date();
      const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: now.toISOString(),
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return res.data.items || [];
    } catch (error: any) {
        console.error('Error listing calendar events:', error.message);
        // Re-throw the error to be caught by the calling function's try-catch block
        throw new Error('Failed to list calendar events. The access token might be invalid or expired.');
    }
  }
);

const CreateEventInputSchema = z.object({
  accessToken: z.string().describe('The user\'s Google OAuth access token.'),
  summary: z.string().describe('The title or summary of the event.'),
  description: z.string().optional().describe('A description of the event.'),
  startTime: z.string().datetime().describe('The start time of the event in ISO 8601 format.'),
  endTime: z.string().datetime().describe('The end time of the event in ISO 8601 format.'),
});

const createEventTool = ai.defineTool(
  {
    name: 'createEventTool',
    description: 'Create a new event on the user\'s primary Google Calendar.',
    inputSchema: CreateEventInputSchema,
    outputSchema: z.any(),
  },
  async ({ accessToken, summary, description, startTime, endTime }) => {
    try {
      const calendar = await getCalendarClient(accessToken);
      const event = {
        summary,
        description,
        start: {
          dateTime: startTime,
          timeZone: 'UTC', // Consider making this dynamic in the future
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC',
        },
      };
      const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });
      return res.data;
    } catch (error: any) {
      console.error('Error creating calendar event:', error.message);
       // Re-throw the error to be caught by the calling function's try-catch block
      throw new Error('Failed to create calendar event. The access token might be invalid or expired.');
    }
  }
);


// --- Exported Server Actions (Safe for 'use server') ---

export type ListEventsInput = z.infer<typeof ListEventsInputSchema>;
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;


export async function listCalendarEvents(input: ListEventsInput) {
  return await listEventsTool(input);
}

export async function createCalendarEvent(input: CreateEventInput) {
  return await createEventTool(input);
}


// This flow is for a conversational agent and is not currently used by the UI directly.
// It remains as an example of how to use tools in a chat-like flow.
const calendarFlow = ai.defineFlow(
    {
        name: 'calendarFlow',
        inputSchema: z.object({ prompt: z.string(), accessToken: z.string() }),
        outputSchema: z.string(),
    },
    async ({ prompt, accessToken }) => {
        const llmResponse = await ai.generate({
            prompt: prompt,
            tools: [listEventsTool, createEventTool],
            system: "You are a helpful assistant with access to the user's Google Calendar. Use the provided tools to list events or create new ones when asked."
        });

        // This is a simplified response. A real implementation would handle tool calls.
        return llmResponse.text;
    }
);

// Wrapper for the conversational flow
export async function calendar(prompt: string, accessToken: string): Promise<string> {
    return calendarFlow({ prompt, accessToken });
}
