type CalendarTime = { starts_at: string; ends_at: string };

function googleDate(isoTime: string) {
  return new Date(isoTime).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function googleCalendarEventUrl(appointment: CalendarTime) {
  const url = new URL("https://calendar.google.com/calendar/r/eventedit");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("dates", `${googleDate(appointment.starts_at)}/${googleDate(appointment.ends_at)}`);
  url.searchParams.set("text", "JomLuah counselor session");
  return url.toString();
}
