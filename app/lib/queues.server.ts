import {Queue} from 'bullmq'

import {getRedis} from './redis.server.mjs'

const jobsQueue = new Queue('main', {connection: getRedis()})

export type Jobs = {
  clearIncidents: {}
  updatePrintLevels: {
    printer: number
    consumable: 'black' | 'magenta' | 'cyan' | 'yellow'
    oid: string
  }
  createBackup: {}
  restoreBackup: {filePath: string}
}

export type JobName = keyof Jobs

export const addJob = <JobName extends keyof Jobs>(
  jobName: JobName,
  jobDetails: Jobs[JobName]
) => {
  return jobsQueue.add(jobName, jobDetails, {removeOnComplete: 20})
}
