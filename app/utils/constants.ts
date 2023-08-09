import {keys} from '@arcath/utils'

export const COMPONENT_STATUS = {
  Unkown: {icon: '❔', status: 'Unkown', number: 0},
  Operational: {icon: '✅', status: 'Operational', number: 4},
  PerformanceIssues: {icon: '☑', status: 'Performance Issues', number: 3},
  PartialOutage: {icon: '💔', status: 'Partial Outage', number: 2},
  MajorOutage: {icon: '🔥', status: 'Major Outage', number: 1}
}

export const COMPONENT_STATUSES = keys(COMPONENT_STATUS)
