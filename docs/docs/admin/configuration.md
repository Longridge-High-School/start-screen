# Configuration

The Configuration screen displays all the config variables in Start Screen.

## dateFormat

`dateFormat` is used on the start screen to display the current date. You can
use any values from
[the date-fns documentation](https://date-fns.org/v2.30.0/docs/format).

## importKey

The `importKey` is used to secure the data import endpoints and can be anything
you want, as long as you use the same key in the PowerShell scripts to send
data.

## localIp

Set this to the IP address local traffic from the school will be using when it
accesses the start screen. This enabled the shortcut scope of `local` and
`remote`.

## title

This is the start screen title that was originally set in the setup. It can
contain HTML for a bit more customisation.

## tabTitle

This is the title used on the tab/window.

## indexPage

The path to redirect to when accessing `/`. Defaults to `/start`, but can be
anything.

> Ideally when using the Start Screen link directly to `/start` to avoid a
> redirect everytime a user opens a tab.

## unifiHost

The IP/hostname of the server running UniFi Controller.

## unifiUser

The Username to login to UniFi Controller with.

## unifiPassword

The password for the user to login to UniFi Controller.

## unifiPort

The port number to connect to UniFi Controller.

## adDomainController

The hostname of the domain controller to use for password resets.

## adAdminDN

The distinguished name of the admin user, this user should **only** have
password reset delegated to it for the students OU.

## adAdminPassword

The password of the admin user.

## adStudentsOU

The OU to search for students in. The tool will only find users in this OU and
below.

## adAllowedUsers

A comma seperated list of users who can reset password. This is the only list of
users that can reset passwords, being and admin or staff member does not grant
any permissions here.

## guestWiFiSSID

The SSID of your Guest Network

## guestWiFiPSK

The Pre-Shared key for your Guest Network.

## analysticsDomain

Set this to a [plausible analytics](https://plausible.io/) domain to enable
analytics.

## snowScript (deprecated)

Set this to `yes` to enable a snow script on the start page.

## maximumDoodleAge

The maximum age for doodles to be displayed on the doodle page in days.

## streamURL

The URL to the `.mpd` file that will be used on the
[live stream](/features/live) page.
