# Guest WiFi Vouchers

Start Screen is able to create, issue and audit voucher codes for guest wifi.

> At Longridge High we have a guest network which has a fixed PSK which after
> connection opens a captive portal prompting for a voucher code. These vouchers
> are limited to a set number of days and devices.
>
> This guest wifi system was designed specifically for our use case.

## Creating Vouchers

Before you can create vouchers you need to set the following config values:

- [unifiHost](/admin/configuration#unifihost)
- [unifiUser](/admin/configuration#unifiuser)
- [unifiPassword](/admin/configuration#unifipassword)
- [unifiPort](/admin/configuration#unifiport)
- [guestWiFiSSID](/admin/configuration#guestwifissid)
- [guestWiFiPSK](/admin/configuration#guestwifipsk)

Once set browse to `/wifi/guest`

> There is no hard-coded link. Add a [shortcut](/features/shortcuts) with select
> staff scoped in.

Only _admins_ can create codes which get recorded in the database. A code can be
valid for any number of days and be multi-use.

Once a code is claimed it gets recorded in the claim log with the claim reason.
