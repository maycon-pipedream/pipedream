export default {
  name: "List Google Meet Meetings",
  version: "0.0.2",
  key: "google_meet-list-meetings",
  description: "Retrieve all upcoming Google Meet meetings from your Google Calendar",
  type: "action",
  props: {
    google_meet: {
      type: "app",
      app: "google_meet",
    },
    calendarId: {
      type: "string",
      label: "Calendar ID",
      description: "The calendar to fetch meetings from",
      default: "primary",
      optional: true,
    },
    maxResults: {
      type: "integer",
      label: "Max Results",
      default: 10,
      optional: true,
    },
  },

  async run({ $ }) {
    const now = new Date().toISOString();

    const response = await this.google_meet.requestHandler({
      api: "events",
      method: "list",
      args: {
        calendarId: this.calendarId,
        timeMin: now,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: this.maxResults,
      },
    });

    const meetings = response.items
      .filter(event => event.hangoutLink)
      .map(event => ({
        id: event.id,
        title: event.summary,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
        meetLink: event.hangoutLink,
      }));

    $.export("$summary", `Found ${meetings.length} meetings`);
    return meetings;
  },
};
