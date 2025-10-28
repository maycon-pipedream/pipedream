import { axios } from "@pipedream/platform";

export default {
  name: "List Google Meet Meetings",
  version: "0.0.1",
  key: "google-meet-list-meetings",
  description: "Retrieve all upcoming Google Meet meetings from your Google Calendar",
  type: "action",
  props: {
    google_calendar: {
      type: "app",
      app: "google_calendar",
    },
    calendarId: {
      type: "string",
      label: "Calendar ID",
      description: "Usually your email address, or use `primary` for your main calendar",
      default: "primary",
      optional: true,
    },
    maxResults: {
      type: "integer",
      label: "Max Results",
      description: "Maximum number of meetings to retrieve",
      default: 10,
      optional: true,
    },
  },

  async run({ $ }) {
    const now = new Date().toISOString();

    const response = await axios($, {
      url: `https://www.googleapis.com/calendar/v3/calendars/${this.calendarId}/events`,
      headers: {
        Authorization: `Bearer ${this.google_calendar.$auth.oauth_access_token}`,
      },
      params: {
        timeMin: now,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: this.maxResults,
      },
    });
    
    const meetings = response.items
      .filter(event => event.hangoutLink)
      .map(event => ({
        title: event.summary,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
        meetLink: event.hangoutLink,
      }));

    $.export("$summary", `Found ${meetings.length} upcoming Google Meet meetings`);
    return meetings;
  },
};
