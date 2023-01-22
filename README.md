# Stacc Code Challenge Spring 2023

This is my submission for the Stacc Code Challenge Spring 2023.

## Technology

This application uses the t3-stack as a template because it reduces the amount
of time I have to spend setting up the project. Also, it has all the
great technologies I love, mainly NextJS, TailwindCSS, tRPC and TypeScript.
The database is hosted on [Planetscale](https://planetscale.com/).

## API

API for energy prices in Norway is provded by [Hva koster strømmen.no](https://www.hvakosterstrommen.no/strompris-api).

## How to run

To run the application locally follow these steps, or visit [stacc.omfj.no](https://stacc.omfj.no).

Prerequisites: `git`, `node` (v16.19.x) and `pnpm` (or `yarn` or `npm`)

1. Clone the repository

   ```sh
   git clone git@github.com:omfj/stacc-code-challenge-spring-2023
   ```

2. `cd` into the directory and install dependencies

   ```sh
   cd stacc-code-challenge-spring-2023
   pnpm install
   ```

3. Create a [GitHub OAuth app](https://github.com/settings/developers)
4. Paste the credentials in the `.env` file. `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` respectively.
5. Create a free [Planetscale database](https://planetscale.com/)
6. Paste the connection URL in the `DATABASE_URL` field.

7. Run the dev environment. If you don't use `pnpm`, replace `pnpm` with
   whatever package manager.

   ```sh
   pnpm dev
   ```
