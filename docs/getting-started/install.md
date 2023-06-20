# Install

## Docker

Start Screen is distributed as a docker container and is best launched from the
supplied `docker-compose.yml`.

Create an empty folder for your install and create 3 folders, `icons`, `adverts`
and `assets`.

Create a `docker-compose.yml` that contains:

```yml
version: '3.9'
services:
  db:
    image: postgres:14
    restart: always
    environment:
      POSTGRES_PASSWORD: YOUR_PASSWORD
    volumes:
      - /path/to/db:/var/lib/postgresql/data
    ports:
      - '5432:5432'
  remix:
    image: ghcr.io/longridge-high-school/connect.lhs.lancs.sch.uk:main
    restart: always
    ports:
      - '3000:3000'
    environment:
      - DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db:5432/connect?connection_limit=30&pool_timeout=0
    volumes:
      - /path/to/icons:/app/public/icons
      - /path/to/adverts:/app/public/adverts
      - /path/to/assets:/app/public/assets
    depends_on:
      - db
```

Replace `POSTGRES_PASSWORD` with your chosen password, and update `DATABASE_URL`
to match.

Replace the `/path/to` in the directory paths with the path to your folder.

Launch the app with `docker-compose up -d`.

Start Screen will now be running on port `3000`.

## Authentication

Start Screen was originally designed to be used behind _Azure Application Proxy_
with _header based authentication_ putting the current users email address in
the `azure-upn` header.

Without the header Start Screen will throw an error.

Any solution that places the users email into the `azure-upn` header will work.
[Follow this guide](/guides/configuring-app) to setup Azure Application Proxy
with the required header.

## Next Steps

- [Run initial setup](/getting-started/setup)
