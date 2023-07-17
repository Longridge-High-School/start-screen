import {omit, indexedBy} from '@arcath/utils'

import {getPrisma} from './prisma'

export const ConfigDefaults = {
  dateFormat: {
    value: 'do MMMM yyyy',
    description: 'The date-fns date format to use.'
  },
  importKey: {
    value: 'CHANGE-ME-NOW',
    description: 'The password used to validate the import script.'
  },
  localIp: {
    value: '127.0.0.1',
    description:
      'The IP that "on-prem" devices will appear from. (AAP means all traffic comes in from outside).'
  },
  logo: {
    value: '/img/logo.png',
    description: 'The logo used on the start page and tab title.',
    type: 'image'
  },
  background: {
    value: '/img/bg.jpg',
    description: 'The site background image',
    type: 'image'
  },
  brandDark: {
    value: '#2c3e50',
    description: 'The dark brand colour to use.',
    type: 'color'
  },
  brandLight: {
    value: '#34495e',
    description: 'The light brand colour to use.',
    type: 'color'
  },
  title: {
    value: 'Start Page',
    description: 'The title used on the Start Page. Can contain HTML'
  },
  tabTitle: {
    value: 'Get Started',
    description: 'The title used on the tab'
  },
  indexPage: {
    value: '/start',
    description: 'The relative path to redirect to from the start page.'
  },
  unifiHost: {
    value: '127.0.0.1',
    description: 'The IP/Hostname of UniFi controller.'
  },
  unifiUser: {
    value: 'admin',
    description: 'The username for UniFi controller.'
  },
  unifiPassword: {
    value: 'password',
    description: 'The password for UniFi controller.'
  },
  unifiPort: {
    value: '8443',
    description: 'The port for UniFi controller.'
  },
  adDomainController: {
    value: 'dc.domain.local',
    description: 'The hostname of a domain controller.'
  },
  adAdminDN: {
    value: 'CN=Password Restter,DC=domain,DC=local',
    description: 'The DN of the password reset user.'
  },
  adAdminPassword: {
    value: 'P@$$w0rd',
    description: 'The Password of the password reset user.'
  },
  adStudentsOU: {
    value: 'OU=Students,DC=domain,DC=local',
    description: 'The OU for students (can only reset passwords below this OU).'
  },
  adAllowedUsers: {
    value: 'user1, user2, user3',
    description:
      "Comma seperated list of users who can reset passwords. (Must be in this list, admin/staff doesn't count.)"
  },
  headerStrip: {
    value: '',
    description: 'Content to display on the Header Strip'
  },
  headerStripCache: {
    value: '',
    description: 'DO NOT CHANGE, used to cache the compiled MDX'
  },
  guestWiFiSSID: {
    value: '',
    description: 'The guest WiFi SSID'
  },
  guestWiFiPSK: {
    value: '',
    description: 'The Pre-Shared Key for the guest WiFi'
  },
  analyticsDomain: {
    value: '',
    description: 'Hostname of a Plausible Analytics server.'
  },
  snowScript: {
    value: 'no',
    description: 'yes/no enable snow on the start page.'
  },
  aup: {
    value: '',
    description: 'The Acceptable use Policy'
  },
  aupCache: {
    value: '',
    description: 'The MDX cache of the acceptable use policy.'
  }
} as const

export const ConfigurableValues = omit(ConfigDefaults, [
  'logo',
  'background',
  'brandDark',
  'brandLight',
  'headerStrip',
  'headerStripCache',
  'aup',
  'aupCache'
])

export type PrinterConfig = {
  name: string
  black: string
  cyan: string
  magenta: string
  yellow: string
  ip: string
  snmpCommunity: string
  staffOnly: boolean
}

export const getConfigValue = async (key: keyof typeof ConfigDefaults) => {
  const prisma = getPrisma()

  const dbr = await prisma.config.findFirst({
    select: {value: true},
    where: {key}
  })

  if (dbr) {
    return dbr.value
  }

  return ConfigDefaults[key].value
}

export const getConfigValues = async (
  keys: (keyof typeof ConfigDefaults)[]
) => {
  const prisma = getPrisma()

  const dbr = await prisma.config.findMany({
    select: {key: true, value: true},
    where: {key: {in: keys}}
  })

  const keyIndex = indexedBy('key', dbr)

  return keys.map(key => {
    if (keyIndex[key]) {
      return keyIndex[key].value
    }

    return ConfigDefaults[key].value
  })
}

export const setConfigValue = async (
  key: keyof typeof ConfigDefaults,
  value: string
) => {
  const prisma = getPrisma()

  await prisma.config.upsert({
    where: {key: key},
    create: {key, value},
    update: {value}
  })
}
