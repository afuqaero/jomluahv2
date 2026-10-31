import assert from "node:assert/strict";
import test from "node:test";
import { googleCalendarEventUrl } from "../app/counselor/google-calendar.ts";

test("Google Calendar link has accurate UTC times without student information", () => {
  const appointment = {
    starts_at: "2026-10-31T10:00:00+08:00",
    ends_at: "2026-10-31T10:50:00+08:00",
    student_name: "Private Student Name",
  };
  const link = googleCalendarEventUrl(appointment);
  const url = new URL(link);
  assert.equal(url.origin, "https://calendar.google.com");
  assert.equal(url.searchParams.get("dates"), "20261031T020000Z/20261031T025000Z");
  assert.equal(url.searchParams.get("text"), "JomLuah counselor session");
  assert.equal(url.searchParams.has("details"), false);
  assert.equal(url.searchParams.has("add"), false);
  assert.equal(link.includes(appointment.student_name), false);
});
