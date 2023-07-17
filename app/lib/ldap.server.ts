import * as ldap from 'ldapjs'

export const createClient = (
  dc: string,
  adminDN: string,
  adminPassword: string
): Promise<
  {error: string; client: undefined} | {client: ldap.Client; error: undefined}
> => {
  return new Promise((resolve, reject) => {
    const client = ldap.createClient({
      url: `ldaps://${dc}`,
      tlsOptions: {rejectUnauthorized: false}
    })
    client.bind(adminDN, adminPassword, err => {
      if (err) {
        resolve({error: 'Unable to connect to the domain', client: undefined})
        return
      }

      resolve({client, error: undefined})
    })
  })
}

export const findUserDN = async (
  client: ldap.Client,
  username: string,
  ou: string
): Promise<{error: string; dn: undefined} | {error: undefined; dn: string}> => {
  return new Promise((resolve, reject) => {
    client.search(
      ou,
      {
        filter: `(sAMAccountName=${username})`,
        scope: 'sub'
      },
      (err, res) => {
        if (err) {
          resolve({error: `Unable to find user ${username}`, dn: undefined})
          return
        }
        let entries = 0

        res.on('searchEntry', entry => {
          entries += 1
          resolve({dn: entry.dn.toString(), error: undefined})
        })

        res.on('end', result => {
          if (entries === 0) {
            resolve({error: `Unable to find user ${username}`, dn: undefined})
            client.unbind()
          }
        })
      }
    )
  })
}

export const createChange = (change: ldap.Change) => {
  return new ldap.Change(change)
}

export const createAttribute = (type: string, values: any) => {
  return new ldap.Attribute({
    type,
    // @types/ldapjs expects `vals` vs the new correct property of `values`
    // @ts-expect-error
    values
  })
}
