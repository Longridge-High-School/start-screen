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
