/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/node/globals" />

declare module 'node-unifi' {
  class Controller {
    constructor(
      options: Partial<{
        /** The Hostname/IP of your UniFi Controller */
        host: string
        /** The port number of the  */
        port: number
        /** The username to login with (defualt: admin) */
        username: string
        /** The password to login with (default: ubnt) */
        password: string
        /** Site name (default: default) */
        site: string
        /** Verify the SSL Certificate (default: true) */
        sslverify: boolean
      }>
    )

    /**
     * Login to the UniFi Controller
     *
     * @param username
     * @param password
     */
    login(username?: string, password?: string): Promise<boolean>

    logout(): Promise<boolean>

    getVouchers(create_time?: number): Promise<
      {
        _id: string
        site_id: string
        create_time: number
        code: string
        for_hotspot: boolean
        admin_name: string
        quota: number
        duration: number
        used: number
        qos_overwrite: boolean
        note: string | null
        status: string
        status_expires: number
      }[]
    >

    createVouchers(
      minutes: number,
      count?: number,
      quota?: number,
      note?: string,
      up?: number,
      down?: number,
      megabytes?: number
    ): Promise<[{create_time: number}]>
  }
}

declare module 'net-snmp' {
  type Session = {
    get(oids: string[], cb: (error?: Error, varbinds?: any) => void): void
  }

  export function createSession(ip: string, community: string): Session
}
