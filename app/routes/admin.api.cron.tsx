import {json} from '@remix-run/node'
import {subHours} from 'date-fns'

import {createTimings} from '~/utils/timings.server'

import {getPrisma} from '~/lib/prisma'

export const loader = async () => {
  const results: {[task: string]: string} = {}

  const {time, getHeader} = createTimings()
  const prisma = getPrisma()

  await time('clearIncidents', 'Clear Incidents', () =>
    prisma.incident.deleteMany({
      where: {open: false, updatedAt: {lte: subHours(new Date(), 24)}}
    })
  )
  results['Incident Clean Up'] = 'Success'

  return json(
    {results},
    {
      headers: {'Server-Timing': getHeader()}
    }
  )
}
