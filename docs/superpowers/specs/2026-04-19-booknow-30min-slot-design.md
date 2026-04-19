# BookNow: 30-Minute Slot Support

## Summary

Add a "30 Minutes" duration option to the BookNow booking form, with duration-aware conflict detection so available time slots are computed correctly for each duration.

## Changes

### TIME_SLOTS

Add "30 Minutes" as the first option:

```js
const TIME_SLOTS = [
  "30 Minutes",
  "1 Hour (Quick)",
  "1.5 Hours (Classic)",
  "Other",
];
```

### Duration Helper

Add a helper that maps a selected slot label to minutes:

```js
const slotDurationMinutes = (timeSlot) => {
  if (timeSlot === "30 Minutes") return 30;
  if (timeSlot === "1 Hour (Quick)") return 60;
  if (timeSlot === "1.5 Hours (Classic)") return 90;
  return 60; // safe default for "Other"
};
```

### Existing Booking Duration Parsing

In `getDuration`, add the 30-minute case:

```js
const getDuration = (note) => {
  if (!note) return 1;
  if (note.includes("30 Minutes")) return 0.5;
  if (note.includes("1.5 Hours")) return 1.5;
  if (note.includes("1 Hour")) return 1;
  return 1;
};
```

### Conflict Detection

`fetchBookedTimesForDate` must accept the user's selected duration and use it in the overlap check:

```js
const fetchBookedTimesForDate = (date, timeSlot) => {
  // ...existing fetch logic...
  const userDurationMin = slotDurationMinutes(timeSlot);
  const blocked = TIME_OPTIONS.filter((t) => {
    const slotMin = toMinutes(t);
    if (slotMin == null) return false;
    return blockedRanges.some(
      (r) => slotMin < r.end && slotMin + userDurationMin > r.start
    );
  });
  setBookedTimes(blocked);
};
```

### Re-trigger on Duration Change

When the user changes `timeSlot`, re-run the availability check if a date is already selected:

```js
onChange={() => {
  set("timeSlot", slot);
  setForm((prev) => ({ ...prev, packages1hr: [], packages1hr30: [] }));
  if (form.preferredDate) fetchBookedTimesForDate(form.preferredDate, slot);
}}
```

The existing `onChange` for `preferredDate` must also pass `form.timeSlot`:

```js
onChange={(e) => {
  set("preferredDate", e.target.value);
  set("preferredTime", "");
  fetchBookedTimesForDate(e.target.value, form.timeSlot);
}}
```

### Package Display

"30 Minutes" shows `PACKAGES_1HR` (same packages, same prices as 1 Hour):

```jsx
{(form.timeSlot === "30 Minutes" || form.timeSlot === "1 Hour (Quick)") && (
  <div className="bn-field">
    <label className="bn-label">PACKAGES (1 HR)</label>
    ...PACKAGES_1HR...
  </div>
)}
```

## What Does Not Change

- Package lists and prices
- Add-ons
- Validation logic
- Submission payload (time slot label is stored in `addons_note` as before)
- All other form fields
