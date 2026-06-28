# BookNow 30-Minute Slot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "30 Minutes" duration option to the BookNow form with duration-aware time slot conflict detection.

**Architecture:** All changes are confined to `frontend/src/pages/BookNow.jsx`. A `slotDurationMinutes` helper maps the selected time slot label to minutes. `fetchBookedTimesForDate` is updated to accept a duration parameter and uses it in the overlap check. The function is re-triggered whenever either the date or time slot changes.

**Tech Stack:** React (useState, useEffect), plain fetch API, no new dependencies.

---

## Files

- Modify: `frontend/src/pages/BookNow.jsx`

---

### Task 1: Add "30 Minutes" to TIME_SLOTS

**Files:**
- Modify: `frontend/src/pages/BookNow.jsx:7-11`

- [ ] **Step 1: Update TIME_SLOTS constant**

Replace:
```js
const TIME_SLOTS = [
  "1 Hour (Quick)",
  "1.5 Hours (Classic)",
  "Other",
];
```
With:
```js
const TIME_SLOTS = [
  "30 Minutes",
  "1 Hour (Quick)",
  "1.5 Hours (Classic)",
  "Other",
];
```

- [ ] **Step 2: Verify in browser**

Start the dev server (`npm run dev` in `frontend/`) and open BookNow. Confirm "30 Minutes" appears as the first radio option under "CHOOSE YOUR TIME SLOT".

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BookNow.jsx
git commit -m "feat: add 30 Minutes option to BookNow time slots"
```

---

### Task 2: Add slotDurationMinutes helper

**Files:**
- Modify: `frontend/src/pages/BookNow.jsx` (add after TIME_SLOTS constant)

- [ ] **Step 1: Add helper after TIME_SLOTS**

Insert this function directly after the `TIME_SLOTS` array (around line 12):
```js
const slotDurationMinutes = (timeSlot) => {
  if (timeSlot === "30 Minutes") return 30;
  if (timeSlot === "1 Hour (Quick)") return 60;
  if (timeSlot === "1.5 Hours (Classic)") return 90;
  return 60;
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/BookNow.jsx
git commit -m "feat: add slotDurationMinutes helper for conflict detection"
```

---

### Task 3: Fix existing booking duration parsing for 30 Minutes

**Files:**
- Modify: `frontend/src/pages/BookNow.jsx` — `getDuration` function inside `fetchBookedTimesForDate` (~line 169)

- [ ] **Step 1: Update getDuration to handle 30-minute bookings**

Find this block inside `fetchBookedTimesForDate`:
```js
const getDuration = (note) => {
  if (!note) return 1;
  if (note.includes("1.5 Hours")) return 1.5;
  if (note.includes("1 Hour")) return 1;
  return 1;
};
```

Replace with:
```js
const getDuration = (note) => {
  if (!note) return 1;
  if (note.includes("30 Minutes")) return 0.5;
  if (note.includes("1.5 Hours")) return 1.5;
  if (note.includes("1 Hour")) return 1;
  return 1;
};
```

Note: "30 Minutes" must be checked before "1 Hour" to avoid false matches.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/BookNow.jsx
git commit -m "fix: parse 30-minute booking duration from addons_note"
```

---

### Task 4: Make fetchBookedTimesForDate duration-aware

**Files:**
- Modify: `frontend/src/pages/BookNow.jsx` — `fetchBookedTimesForDate` function (~line 147)

- [ ] **Step 1: Update function signature to accept timeSlot**

Change the function signature from:
```js
const fetchBookedTimesForDate = (date) => {
```
To:
```js
const fetchBookedTimesForDate = (date, timeSlot) => {
```

- [ ] **Step 2: Use userDurationMin in overlap check**

Find this block near the end of the function (~line 208):
```js
const blocked = TIME_OPTIONS.filter((t) => {
  const slotMin = toMinutes(t);
  if (slotMin == null) return false;
  return blockedRanges.some(
    (r) => slotMin < r.end && slotMin + 60 > r.start
  );
});
```

Replace with:
```js
const userDurationMin = slotDurationMinutes(timeSlot);
const blocked = TIME_OPTIONS.filter((t) => {
  const slotMin = toMinutes(t);
  if (slotMin == null) return false;
  return blockedRanges.some(
    (r) => slotMin < r.end && slotMin + userDurationMin > r.start
  );
});
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BookNow.jsx
git commit -m "feat: use selected duration in time slot conflict detection"
```

---

### Task 5: Re-trigger availability check when timeSlot changes

**Files:**
- Modify: `frontend/src/pages/BookNow.jsx` — time slot radio onChange (~line 487) and preferredDate onChange (~line 529)

- [ ] **Step 1: Update preferredDate onChange to pass timeSlot**

Find:
```js
onChange={(e) => {
  set("preferredDate", e.target.value);
  set("preferredTime", "");
  fetchBookedTimesForDate(e.target.value);
}}
```
Replace with:
```js
onChange={(e) => {
  set("preferredDate", e.target.value);
  set("preferredTime", "");
  fetchBookedTimesForDate(e.target.value, form.timeSlot);
}}
```

- [ ] **Step 2: Update timeSlot radio onChange to re-fetch availability**

Find:
```js
onChange={() => {
  set("timeSlot", slot);
  setForm((prev) => ({ ...prev, packages1hr: [], packages1hr30: [] }));
}}
```
Replace with:
```js
onChange={() => {
  set("timeSlot", slot);
  setForm((prev) => ({ ...prev, packages1hr: [], packages1hr30: [] }));
  if (form.preferredDate) fetchBookedTimesForDate(form.preferredDate, slot);
}}
```

- [ ] **Step 3: Verify in browser**

1. Pick a date that has an existing 1-hour booking at e.g. 3:00 PM.
2. Select "30 Minutes" — confirm 3:00 PM is still blocked (a 30-min booking at 3pm would conflict).
3. Select "1 Hour (Quick)" — confirm 2:00 PM is also blocked (1hr from 2pm would overlap a 3pm booking).
4. Select "1.5 Hours (Classic)" — confirm 2:00 PM and 1:30 PM equivalent slots are blocked.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/BookNow.jsx
git commit -m "feat: re-check availability when duration selection changes"
```

---

### Task 6: Show PACKAGES_1HR for 30 Minutes selection

**Files:**
- Modify: `frontend/src/pages/BookNow.jsx` — packages 1hr conditional (~line 574)

- [ ] **Step 1: Update the packages display condition**

Find:
```jsx
{form.timeSlot === "1 Hour (Quick)" && (
  <div className="bn-field">
    <label className="bn-label">PACKAGES (1 HR)</label>
```
Replace with:
```jsx
{(form.timeSlot === "30 Minutes" || form.timeSlot === "1 Hour (Quick)") && (
  <div className="bn-field">
    <label className="bn-label">PACKAGES (1 HR)</label>
```

- [ ] **Step 2: Verify in browser**

Select "30 Minutes" — confirm the 1HR package list appears. Select "1.5 Hours (Classic)" — confirm the 1HR30 package list appears instead. Select "Other" — confirm no packages are shown.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/BookNow.jsx
git commit -m "feat: show 1HR packages for 30-minute slot selection"
```
