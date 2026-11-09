import { describe, expect, it } from 'vitest'
import {
  backspace,
  chooseOperator,
  clear,
  equals,
  format,
  initialState,
  inputDigit,
  inputDot,
  negate,
  percent,
  type CalcState,
} from './calculator'

/** Feed a sequence of keystrokes: digits as chars, 'D' dot, 'N' negate, 'P' percent, 'B' backspace. */
function press(state: CalcState, sequence: string): CalcState {
  let next = state
  for (const key of sequence) {
    if (/^[0-9]$/.test(key)) next = inputDigit(next, key)
    else if (key === 'D') next = inputDot(next)
    else if (key === 'N') next = negate(next)
    else if (key === 'P') next = percent(next)
    else if (key === 'B') next = backspace(next)
    else if (key === '+' || key === '-' || key === 'x' || key === '/')
      next = chooseOperator(next, key === 'x' ? '×' : key === '/' ? '÷' : key)
    else if (key === '=') next = equals(next)
    else if (key === 'A') next = clear()
    else throw new Error(`unknown key ${key}`)
  }
  return next
}

describe('format', () => {
  it('trims floating point noise', () => {
    expect(format(0.1 + 0.2)).toBe('0.3')
  })

  it('reports non-finite values as an error', () => {
    expect(format(Infinity)).toBe('Error')
    expect(format(Number.NaN)).toBe('Error')
  })

  it('uses exponential notation for very large values', () => {
    expect(format(12345678901234)).toMatch(/e\+/)
  })
})

describe('digit entry', () => {
  it('replaces the leading zero', () => {
    expect(press(initialState, '7').display).toBe('7')
  })

  it('appends digits', () => {
    expect(press(initialState, '123').display).toBe('123')
  })

  it('ignores more than twelve digits', () => {
    expect(press(initialState, '1234567890123456').display).toBe('123456789012')
  })

  it('starts a new number after an operator', () => {
    expect(press(initialState, '5+3').display).toBe('3')
  })

  it('starts a new calculation after equals', () => {
    expect(press(initialState, '5+3=9').display).toBe('9')
  })

  it('resets after an error', () => {
    expect(press(initialState, '5/0=4').display).toBe('4')
  })
})

describe('decimal point', () => {
  it('allows only one dot', () => {
    expect(press(initialState, '1D2D3').display).toBe('1.23')
  })

  it('starts a leading zero dot', () => {
    expect(press(initialState, 'D').display).toBe('0.')
  })

  it('starts a fresh number after an operator', () => {
    expect(press(initialState, '7+D5').display).toBe('0.5')
  })
})

describe('arithmetic', () => {
  it('adds', () => {
    expect(press(initialState, '2+3=').display).toBe('5')
  })

  it('subtracts', () => {
    expect(press(initialState, '9-4=').display).toBe('5')
  })

  it('multiplies', () => {
    expect(press(initialState, '6x7=').display).toBe('42')
  })

  it('divides', () => {
    expect(press(initialState, '8/2=').display).toBe('4')
  })

  it('chains left to right, evaluating the pending operation', () => {
    expect(press(initialState, '2+3+4=').display).toBe('9')
  })

  it('evaluates the pending operation when an operator follows', () => {
    const state = press(initialState, '2+3x')
    expect(state.display).toBe('5')
    expect(state.accumulator).toBe(5)
  })

      it('stays on the result when equals is pressed again', () => {
        const once = press(initialState, '2+3=')
        expect(once.display).toBe('5')
        expect(equals(once).display).toBe('5')
      })

  it('flags division by zero', () => {
    const state = press(initialState, '5/0=')
    expect(state.display).toBe('Error')
    expect(state.error).toBe('Cannot divide by zero')
  })

  it('recovers from an error with AC', () => {
    expect(press(press(initialState, '5/0='), 'A').display).toBe('0')
  })
})

describe('unary operations', () => {
  it('negates the display', () => {
    expect(press(initialState, '42N').display).toBe('-42')
  })

  it('negates back to positive', () => {
    expect(press(initialState, '42NN').display).toBe('42')
  })

  it('leaves zero alone', () => {
    expect(press(initialState, 'N').display).toBe('0')
  })

  it('converts to percent', () => {
    expect(press(initialState, '50P').display).toBe('0.5')
  })
})

describe('backspace', () => {
  it('removes the last digit', () => {
    expect(press(initialState, '123B').display).toBe('12')
  })

  it('falls back to zero when the last digit goes', () => {
    expect(press(initialState, '7B').display).toBe('0')
  })

    it('leaves the display alone right after an operator', () => {
      expect(press(initialState, '5+B').display).toBe('5')
    })
})
