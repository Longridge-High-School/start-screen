import {Controller} from 'node-unifi'

import {getConfigValue} from './config.server'

export const getUnifi = async () => {
  const host = await getConfigValue('unifiHost')
  const username = await getConfigValue('unifiUser')
  const password = await getConfigValue('unifiPassword')
  const port = await getConfigValue('unifiPort')

  const unifi = new Controller({
    host,
    username,
    password,
    port: parseInt(port),
    sslverify: false
  })
  await unifi.login()

  return unifi
}
