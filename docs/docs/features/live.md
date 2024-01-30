# Live Streams

The Live Stream system is designed to be used with
[this nginx rtmp server](https://github.com/Longridge-High-School/nginx-rtmp-ssl)
with the flowing configuration:

```yaml
rtmp:
  image: longridgehighschool/nginx-rtmp-ssl:latest
  restart: always
  environment:
    SERVER_NAME: rtmp.yourdomain.com
    RTMP_PUBLISH_URLS: http://host.docker.internal:3000/live/api/play
    RTMP_DONE_URLS: http://host.docker.internal:3000/live/api/done
  volumes:
    - /path/to/ssl:/var/ssl
  ports:
    - '1935:1935'
    - '8090:443'
```

Where `rtmp.yourdomain.com` is the address the certificates cover.
`RTMP_PUBLISH_URLS` and `RTMP_DONE_URLS` can be left as they are if the rtmp
container and the start screen container are on the same host. Otherwise they
need to be set to the `/live/api` urls for your container.

> Be aware that /live/api... needs to be accessed using the url internal to the
> network, not the one running through Azure Application Proxy.

## Creating a Live Stream

Through the Admin Interface go to Live Streams and create a live stream. The
title and key can be anything you want. The `key` will be used in OBS to
authenticate the stream. The `RTMP_PUBLISH_URLS` callback will reject any
streams that don't have a valid stream key.

Once created it can be updated with a description to provide users some context.

## Starting the Stream

Configure OBS with a custom streaming destination of
`rtmp://your.rtmp.domain/live` and the stream key you set earlier.

When you start streaming start screen will update the live stream to say that it
is live.

## Linking users to the streams

Every stream gets a live scope that allows you to only show the
[shortcut](/features/shortcuts) to the live stream if it is running.

You can link to `/live` for a list of all currently running streams, or
`/live/{id}` for the specific stream.

Live streams scopes and access to live streams only works for staff.

## Live Stream page

Users are greeted with a page containing the streams description and a link to
start the stream.

Once the stream is started there will be a large video unit showing the stream
and a list of [stream reactions](/admin/configuration#streamreactions) for users
to send to the stream dashboard.

## Dashboard

The dashboard is available at `/live/{id}/dashboard` and shows the current state
of the stream, how many viewers and a list of viewers.

When a user clicks an emoji on the stream screen it flashes up next to their
name on the dashboard for 10 seconds.
