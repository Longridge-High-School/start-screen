# Contributing

Thanks for your willingness to contribute!

## Project Setup

To run Start Screen locally you need to setup a couple of things.

### System Requirements

- Node.js >= 18.0.0
- NPM >= 8.15.0
- A Git Client
- Postges Server

### Setup Steps

1.  Fork and clone the repo
1.  Run `npm install` to install all the dependencies.
1.  Create a `.env` file with the following contents:

```
DATABASE_URL=postgresql://<PGUESER>:<PGPASSWORD>@localhost:5432/connect
```

1.  Run `npx prisma migrate dev` to migrate your database.

## Developing

`npm run dev` will run the app in dev mode with features like live reloads
etc... The app will be available at `http://localhost:3000`.

> On localhost you wont be going through AAP so will need to set the `azure-upn`
> header. This can be done with a
> [browser extension](https://microsoftedge.microsoft.com/addons/detail/modify-header-value-http/khookejbpglhmckogkfmbhdiholmdigi)
