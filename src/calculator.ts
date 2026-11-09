export type Operator = '+' | '-' | '×' | '÷'

export interface CalcState {
  /** The value currently shown, as a string so we keep user formatting. */
  display: string
  /** Left-hand operand of a pending operation, if any. */
  accumulator: number | null
  /** Pending operator, if any. */
  operator: Operator | null
  /** True when the next digit starts a new number instead of appending. */
  startFresh: boolean
  /** True when the last action was '=', so a new digit begins a calculation. */
  resolved: boolean
  error: string | null
}

export const initialState: CalcState = {
  display: '0',
  accumulator: null,
  operator: null,
  startFresh: true,
  resolved: false,
  error: null,
}

const MAX_DIGITS = 12

function apply(a: number, b: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return a + b
    case '-':
      return a - b
    case '×':
      return a * b
    case '÷':
      return a / b
  }
}

/** Format a number for the display, falling back to exponential for extremes. */
export function format(value: number): string {
  if (!Number.isFinite(value)) return 'Error'
  const rounded = Number.parseFloat(value.toPrecision(MAX_DIGITS))
  const text = String(rounded)
  return text.length > MAX_DIGITS ? value.toExponential(6) : text
}

function withError(message: string): CalcState {
  return { ...initialState, display: 'Error', error: message }
}

function compute(state: CalcState): number | string {
  const current = Number.parseFloat(state.display)
  const result = apply(state.accumulator ?? 0, current, state.operator as Operator)
  if (!Number.isFinite(result)) return 'Cannot divide by zero'
  return result
}

export function inputDigit(state: CalcState, digit: string): CalcState {
  if (state.error || state.resolved) {
    return { ...initialState, display: digit, startFresh: false }
  }
  if (state.startFresh) {
    return { ...state, display: digit, startFresh: false }
  }
  if (state.display.replace(/[-.]/g, '').length >= MAX_DIGITS) return state
  const display = state.display === '0' ? digit : state.display + digit
  return { ...state, display }
}

export function inputDot(state: CalcState): CalcState {
  if (state.error || state.resolved) {
    return { ...initialState, display: '0.', startFresh: false }
  }
  if (state.startFresh) {
    return { ...state, display: '0.', startFresh: false }
  }
  if (state.display.includes('.')) return state
  return { ...state, display: state.display + '.' }
}

export function chooseOperator(state: CalcState, operator: Operator): CalcState {
  if (state.error) return state
  // Nothing entered yet after '=': continue from the displayed result.
  const base = state.resolved ? { ...state, resolved: false } : state

  if (base.operator !== null && base.accumulator !== null && !base.startFresh) {
        const result = compute(base)
    if (typeof result === 'string') return withError(result)
    return {
      ...base,
      display: format(result),
      accumulator: result,
      operator,
      startFresh: true,
    }
  }

  return {
    ...base,
    accumulator: Number.parseFloat(base.display),
    operator,
    startFresh: true,
  }
}

export function equals(state: CalcState): CalcState {
  if (state.error) return state
  if (state.operator === null || state.accumulator === null) {
    return { ...state, resolved: true }
  }
    const result = compute(state)
    if (typeof result === 'string') return withError(result)
    return {
      ...state,
      display: format(result),
      accumulator: null,
    operator: null,
    startFresh: true,
    resolved: true,
  }
}

export function negate(state: CalcState): CalcState {
  if (state.error) return state
  if (state.display === '0') return state
  const flipped = state.display.startsWith('-')
    ? state.display.slice(1)
    : '-' + state.display
  return { ...state, display: flipped }
}

export function percent(state: CalcState): CalcState {
  if (state.error) return state
  const value = Number.parseFloat(state.display) / 100
  return { ...state, display: format(value), startFresh: true }
}

export function backspace(state: CalcState): CalcState {
  if (state.error) return initialState
  if (state.startFresh || state.resolved) return state
  const next = state.display.slice(0, -1)
  if (next === '' || next === '-') return { ...state, display: '0', startFresh: true }
  return { ...state, display: next }
}

export function clear(): CalcState {
  return initialState
}
