# Calculator

A small calculator web app built with React 19, TypeScript and Vite. The
arithmetic lives in a pure module (`src/calculator.ts`) so it can be tested
without a browser; `App.tsx` only wires up buttons, the display and the
keyboard.

## Features

- Four operations (`+`, `−`, `×`, `÷`) with left-to-right evaluation of the
  pending operation, like a phone calculator
- Decimal input, sign flip (`±`), percent, backspace (`⌫`) and clear (`AC`)
- Division by zero shows `Error` and the next keypress starts a fresh entry
- Keyboard support: digits, `.`, `+ - * /`, `Enter`/`=`, `Backspace`, `Esc`
- Display capped at 12 significant digits, with exponential notation for
  extremes
- Responsive, dark, accessible (labelled buttons, live region for the result)

## Getting started

```bash
cd calculator
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command         | What it does                          |
| --------------- | ------------------------------------- |
| `npm run dev`   | Start the Vite dev server with HMR    |
| `npm run build` | Type-check and build to `dist/`       |
| `npm run preview` | Serve the production build          |
| `npm test`      | Run the unit tests once (Vitest)      |
| `npm run lint`  | Lint with Oxlint                      |

## Layout

```
src/calculator.ts       pure state machine + arithmetic helpers
src/calculator.test.ts  unit tests for the state machine
src/App.tsx             UI: buttons, display, keyboard handling
src/index.css           all styling
```

## Tests

`src/calculator.test.ts` drives the state machine through keystroke sequences,
covering digit entry, decimals, operator chaining, division by zero, sign flip,
percent and backspace.
