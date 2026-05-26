# Fiber Owl Forest Theme Patch

This ZIP adds:
- time-based forest theme: morning / afternoon / evening / night
- subtle leaves and branch decorations
- night fireflies
- sleeping owl on a branch at night
- improved owl delivery flow: owl flies in -> drops letter -> owl flies away -> letter opens
- mascot callout component for Profile / Ideas / empty states
- `window.fiberOwl?.deliver("test")` manual trigger

## 1. Copy files

Copy the included `src/` folder into your project.

## 2. Import CSS

In `src/main.tsx`, add after your normal CSS import:

```tsx
import "./styles/forestTheme.css";
```

## 3. Add ForestAmbient

In your main layout/Home wrapper:

```tsx
import { ForestAmbient } from "./ForestAmbient";
```

Use it inside your main app wrapper:

```tsx
<div className="app-soft-bg forest-screen relative flex h-full flex-col overflow-hidden">
  <ForestAmbient />

  <main className="relative z-10 min-h-0 flex-1">
    {/* existing content */}
  </main>
</div>
```

If your wrapper already has `app-soft-bg`, just add `forest-screen relative overflow-hidden`.

## 4. Use the new owl

In `Diary.tsx`, remove old `OwlMessenger`.

Add:

```tsx
import { useEffect, useRef } from "react";
import { OwlDelivery, type OwlDeliveryHandle } from "./OwlDelivery";
```

Inside `Diary`:

```tsx
const owlRef = useRef<OwlDeliveryHandle>(null);
```

Add manual console trigger:

```tsx
useEffect(() => {
  window.fiberOwl = {
    deliver: (kind?: "test" | "streak" | "missed" | "goal") => {
      owlRef.current?.deliver(kind ?? "test");
    },
  };

  return () => {
    delete window.fiberOwl;
  };
}, []);
```

Add auto trigger:

```tsx
useEffect(() => {
  const todayKey = new Date().toISOString().slice(0, 10);
  const seenKey = `fiber-owl-seen-${todayKey}`;

  if (localStorage.getItem(seenKey)) return;

  const random = Math.random();

  if (streak > 0) {
    if (streak % 7 === 0) {
      localStorage.setItem(seenKey, "1");
      owlRef.current?.deliver("streak");
      return;
    }

    if (totalFiber >= goal && goal > 0) {
      localStorage.setItem(seenKey, "1");
      owlRef.current?.deliver("goal");
      return;
    }

    if (random < 0.18) {
      localStorage.setItem(seenKey, "1");
      owlRef.current?.deliver("streak");
      return;
    }
  } else {
    if (todayEntries.length === 0 && random < 0.12) {
      localStorage.setItem(seenKey, "1");
      owlRef.current?.deliver("missed");
    }
  }
}, [streak, totalFiber, goal, todayEntries.length]);
```

At the start of `Diary` return:

```tsx
<OwlDelivery
  ref={owlRef}
  streak={streak}
  totalFiber={totalFiber}
  goal={goal}
/>
```

## 5. Manual test

Browser console:

```js
window.fiberOwl?.deliver("test")
window.fiberOwl?.deliver("streak")
window.fiberOwl?.deliver("goal")
window.fiberOwl?.deliver("missed")
```

## 6. Mascot in more places

In `Profile.tsx` or `Ideas.tsx`:

```tsx
import { MascotCallout } from "./MascotCallout";
```

Then:

```tsx
<MascotCallout
  title="Test owl delivery"
  body="Tap here to call the owl and preview the mascot animation."
  kind="test"
/>
```

## 7. Cleanup old owl CSS

If you still have old owl CSS in `index.css`, remove blocks containing:

```txt
.owl-body
.owl-wing
.owl-message-card
.cute-owl
.owl-letter
.letter-envelope
```

This patch uses `owl-v2-*` class names to avoid most conflicts.
