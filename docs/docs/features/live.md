# Live Streams

The `/live` page uses the config value `streamUrl` to display a dash live stream
to users.

The users are presented with a Join Stream! button that once pressed starts the
stream immediately.

Designed to be used with
[this nginx rtmp server](https://github.com/Longridge-High-School/nginx-rtmp-ssl)
so that the dash files can be served over HTTPS.

Make sure that your stream has been running for 30 seconds before anyone joins,
ideally with a placeholder card before it starts.
