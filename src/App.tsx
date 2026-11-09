import { useEffect, useReducer } from 'react'
import './App.css'
import {
  backspace,
  chooseOperator,
  clear,
  equals,
  initialState,
  inputDigit,
  inputDot,
  negate,
  percent,
  type CalcState,
  type Operator,
} from './calculator'

type Action =
  | { kind: 'digit'; value: string }
  | { kind: 'dot' }
  | { kind: 'operator'; value: Operator }
  | { kind: 'equals' }
  | { kind: 'negate' }
  | { kind: 'percent' }
  | { kind: 'backspace' }
  | { kind: 'clear' }

function reducer(state: CalcState, action: Action): CalcState {
  switch (action.kind) {
    case 'digit':
      return inputDigit(state, action.value)
    case 'dot':
      return inputDot(state)
    case 'operator':
      return chooseOperator(state, action.value)
    case 'equals':
      return equals(state)
    case 'negate':
      return negate(state)
    case 'percent':
      return percent(state)
    case 'backspace':
      return backspace(state)
    case 'clear':
      return clear()
  }
}

interface Key {
  label: string
  action: Action
  className?: string
  ariaLabel?: string
}

const keys: Key[] = [
  { label: 'AC', action: { kind: 'clear' }, className: 'fn' },
  { label: '±', action: { kind: 'negate' }, className: 'fn', ariaLabel: 'Negate' },
  { label: '%', action: { kind: 'percent' }, className: 'fn', ariaLabel: 'Percent' },
  { label: '÷', action: { kind: 'operator', value: '÷' }, className: 'op', ariaLabel: 'Divide' },
  { label: '7', action: { kind: 'digit', value: '7' } },
  { label: '8', action: { kind: 'digit', value: '8' } },
  { label: '9', action: { kind: 'digit', value: '9' } },
  { label: '×', action: { kind: 'operator', value: '×' }, className: 'op', ariaLabel: 'Multiply' },
  { label: '4', action: { kind: 'digit', value: '4' } },
  { label: '5', action: { kind: 'digit', value: '5' } },
  { label: '6', action: { kind: 'digit', value: '6' } },
  { label: '−', action: { kind: 'operator', value: '-' }, className: 'op', ariaLabel: 'Subtract' },
  { label: '1', action: { kind: 'digit', value: '1' } },
  { label: '2', action: { kind: 'digit', value: '2' } },
  { label: '3', action: { kind: 'digit', value: '3' } },
  { label: '+', action: { kind: 'operator', value: '+' }, className: 'op', ariaLabel: 'Add' },
  { label: '⌫', action: { kind: 'backspace' }, className: 'fn', ariaLabel: 'Backspace' },
  { label: '0', action: { kind: 'digit', value: '0' }, className: 'zero' },
  { label: '.', action: { kind: 'dot' }, ariaLabel: 'Decimal point' },
  { label: '=', action: { kind: 'equals' }, className: 'eq', ariaLabel: 'Equals' },
]

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const { key } = event
      if (/^[0-9]$/.test(key)) {
        dispatch({ kind: 'digit', value: key })
      } else if (key === '.' || key === ',') {
        dispatch({ kind: 'dot' })
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        const map: Record<string, Operator> = {
          '+': '+',
          '-': '-',
          '*': '×',
          '/': '÷',
        }
        dispatch({ kind: 'operator', value: map[key] })
      } else if (key === 'Enter' || key === '=') {
        dispatch({ kind: 'equals' })
      } else if (key === 'Backspace') {
        dispatch({ kind: 'backspace' })
      } else if (key === 'Escape') {
        dispatch({ kind: 'clear' })
      } else {
        return
      }
      event.preventDefault()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const expression =
    state.operator && state.accumulator !== null
      ? `${state.accumulator} ${state.operator}`
      : '\u00a0'

  return (
    <main className="calculator" aria-label="Calculator">
      <div className="screen">
        <div className="expression" aria-hidden="true">
          {expression}
        </div>
        <output className="display" role="status" aria-live="polite">
          {state.display}
        </output>
      </div>
      <div className="keypad">
        {keys.map((key) => (
          <button
            key={key.label}
            type="button"
            className={key.className}
            aria-label={key.ariaLabel}
            onClick={() => dispatch(key.action)}
          >
            {key.label}
          </button>
        ))}
      </div>
    </main>
  )
}

export default App
