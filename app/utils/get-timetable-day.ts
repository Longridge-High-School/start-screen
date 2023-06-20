import type {Session, Class} from '@prisma/client'

import {isAfter, isBefore, differenceInCalendarWeeks, format} from 'date-fns'

/**
 * Object of known dates. Must contain atleast one valid date
 *
 * DD-MM-YYYY: W
 *
 * Where `W` is a week number.
 *
 * Ideally set this after each half term. Make sure they are in date order.
 */
const KNOWN_DATES: {[date: string]: number} = {
  '07-03-2022': 2,
  '14-03-2022': 1,
  '19-09-2022': 1,
  '07-11-2022': 1,
  '13-03-2023': 2
}

export const getTimetableWeek = (testDate: Date = new Date()) => {
  const knownDates = Object.keys(KNOWN_DATES).map(str => {
    const [day, month, year] = str.split('-').map(s => parseInt(s))
    const date = new Date(year, month - 1, day)

    return date
  })

  const calculationDate = knownDates.reduce((calc, date) => {
    if (isAfter(date, calc) && isBefore(calc, testDate)) {
      return date
    }

    return calc
  }, new Date(0))

  const diff = differenceInCalendarWeeks(calculationDate, testDate, {
    weekStartsOn: 1
  })

  const key = format(calculationDate, 'dd-MM-yyyy')

  const week = 2 - ((diff + KNOWN_DATES[key]) % 2)

  return week
}

export const getTimetableDay = (week: number, date = new Date()) =>
  `${format(date, 'E')}${week}`

export const getSession = (
  name: string,
  sessions: Array<Session & {class: Class}>
): (Session & {class: Class}) | undefined => {
  return sessions.reduce((found, session) => {
    if (found !== undefined) {
      return found
    }

    if (session.name === name) {
      return session
    }

    return undefined
  }, undefined as (Session & {class: Class}) | undefined)
}

export const getSessionPeriods = (
  timetableDay: string,
  sessions: Array<Session & {class: Class}>
) => {
  const p1 = getSession(`${timetableDay}:1`, sessions)
  const p2 = getSession(`${timetableDay}:2`, sessions)
  const p3 = getSession(`${timetableDay}:3`, sessions)
  const p4 = getSession(`${timetableDay}:4`, sessions)
  const p5 = getSession(`${timetableDay}:5`, sessions)

  const am = getSession(`${timetableDay}:am`, sessions)
  const pm = getSession(`${timetableDay}:pm`, sessions)

  return {p1, p2, p3, p4, p5, am, pm}
}
