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
import { JSONClient } from 'google-auth-library/build/src/auth/googleauth';

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


// Schema for listing calendar events
export const ListEventsInputSchema = z.object({
  accessToken: z.string().describe('The user\'s Google OAuth access token.'),
  maxResults: z.number().optional().default(10).describe('Maximum number of events to return.'),
});
export type ListEventsInput = z.infer<typeof ListEventsInputSchema>;

export const listCalendarEvents = ai.defineTool(
  {
    name: 'listCalendarEvents',
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
      return { error: 'Failed to list calendar events. The access token might be invalid or expired.' };
    }
  }
);


// Schema for creating a calendar event
export const CreateEventInputSchema = z.object({
  accessToken: z.string().describe('The user\'s Google OAuth access token.'),
  summary: z.string().describe('The title or summary of the event.'),
  description: z.string().optional().describe('A description of the event.'),
  startTime: z.string().datetime().describe('The start time of the event in ISO 8601 format.'),
  endTime: z.string().datetime().describe('The end time of the event in ISO 8601 format.'),
});
export type CreateEventInput = z.infer<typeof CreateEventInputSchema>;


export const createCalendarEvent = ai.defineTool(
  {
    name: 'createCalendarEvent',
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
          timeZone: 'UTC', // Or detect user's timezone
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
      return { error: 'Failed to create calendar event. The access token might be invalid or expired.' };
    }
  }
);

// A simple flow to demonstrate usage (optional, can be removed)
const calendarFlow = ai.defineFlow(
    {
        name: 'calendarFlow',
        inputSchema: z.object({ prompt: z.string(), accessToken: z.string() }),
        outputSchema: z.string(),
    },
    async ({ prompt, accessToken }) => {
        const llmResponse = await ai.generate({
            prompt: prompt,
            tools: [listCalendarEvents, createCalendarEvent],
            config: {
                // Pass the access token to the tool through custom context
                // This is a conceptual example; direct context passing like this isn't standard.
                // The accessToken will be passed explicitly in the tool input from the client.
            },
            system: "You are a helpful assistant with access to the user's Google Calendar. Use the provided tools to list events or create new ones when asked."
        });

        // If the model wants to call a tool, it will be in the response.
        // For this example, we're just showing the setup and returning the text.
        return llmResponse.text;
    }
);

export async function calendar(prompt: string, accessToken: string): Promise<string> {
    return calendarFlow({ prompt, accessToken });
}
