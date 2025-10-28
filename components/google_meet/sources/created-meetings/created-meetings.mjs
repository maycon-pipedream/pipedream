export default {
  name: "New Google Meet Meeting Created",
  version: "0.0.2",
  key: "google_meet-new-meeting",
  description: "Emits an event when a new Google Meet meeting is created in your Google Calendar",
  type: "source",
  dedupe: "unique",

  props: {
    google_meet: {
      type: "app",
      app: "google_meet",
    },
    calendarId: {
      type: "string",
      label: "Calendar ID",
      description: "Use `primary` or specify another calendar ID",
      default: "primary",
    },
    db: "$.service.db",
    timer: {
      type: "$.interface.timer",
      label: "Polling interval",
      default: {
        intervalSeconds: 300,
      },
    },
  },

  async run() {
    const now = new Date().toISOString();

    const response = await this.google_meet.requestHandler({
      api: "events",
      method: "list",
      args: {
        calendarId: this.calendarId,
        timeMin: now,
        singleEvents: true,
        orderBy: "startTime",
        maxResults: 20,
      },
    });

    for (const event of response.items) {
      if (!event.hangoutLink) continue;

      const id = event.id;

      if (this.db.get(id)) continue;
      this.db.set(id, true);

      this.$emit(event, {
        id,
        summary: event.summary,
        start: event.start?.dateTime,
        end: event.end?.dateTime,
        meetLink: event.hangoutLink,
        ts: Date.parse(event.created),
      });
    }
  },
};
