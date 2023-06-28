# Install

## Docker

Start Screen is distributed as a docker container and is best launched from the
supplied `docker-compose.yml`.

Create an empty folder for your install and create 4 folders, `db`, `icons`,
`adverts` and `assets`.

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
    image: longridgehighschool/start-screen:latest
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

> The docker tag `latest` will always be the latest
> [release](https://github.com/Longridge-High-School/start-screen/releases). You
> can pick a version using `{MAJOR}` to stay within the same major version e.g.
> `2`, `{MAJOR}.{MINOR}` will stay within the same minor version e.g. `2.2` and
> `{MAJOR}.{MINOR}.{PATCH}` will stay a specific version e.g. `2.2.0`.
>
> `main` will always be the current state of the `main` branch.

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
[Follow this guide](/guides/configuring-aap) to setup Azure Application Proxy
with the required header.

## Next Steps

- [Run initial setup](/getting-started/setup)
