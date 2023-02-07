# Stacc Code Challenge Spring 2023

This is my submission for the [Stacc Code Challenge Spring 2023](https://github.com/stacc/future-of-fintech-V2023).

edit: I won! 🥳

## Technology

This application uses the t3-stack as a template because it reduces the amount
of time I have to spend setting up the project. Also, it has all the
great technologies I love, mainly NextJS, TailwindCSS, tRPC and TypeScript.
The database is hosted on [Planetscale](https://planetscale.com/).

## API

API for energy prices in Norway is provded by [Hva koster strømmen.no](https://www.hvakosterstrommen.no/strompris-api).

## How to run

Just [visit the website!](https://stacc.omfj.no)

But if you want to build the app locally follow these steps:

Prerequisites: `git`, `node` (v16.19.x) and `pnpm` (or `yarn` or `npm`)

Depending on the setup: `docker` and `docker-compose` might also be required.

### Download and install the repo

1. Clone the repository

   ```sh
   git clone https://github.com/omfj/stacc-code-challenge-spring-2023
   ```

2. `cd` into the directory and install dependencies

   ```sh
   cd stacc-code-challenge-spring-2023
   pnpm install
   ```

3. Copy `.env.example` to `.env`

   ```sh
   cp .env.example .env
   ```

### Setting up auth

1. Create a [GitHub OAuth app](https://github.com/settings/developers)
2. Paste the credentials in the `.env` file. `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` respectively.

### Database

#### Locally

1. Run `docker-compose up --build` in the root of this directory. This will create a docker container with a MySQL database locally on your machine.
2. Make sure the `DATABASE_URL` in your `.env` is correct. It should be `mysql://admin:password@localhost:3306/stacc-energy-challenge`

> Remember to run `docker-compose down` when you're done, so it doesn't occupy any ports that you might need later.

#### With Planetscale

1. Create a free [Planetscale database](https://planetscale.com/)
2. Paste the connection URL in the `DATABASE_URL` field.

### Running the application

To run the dev environment, use the command below. If you don't use `pnpm`, replace `pnpm` with whatever package manager.

#### Development mode

```sh
pnpm dev
```

#### Production "mode"

1. Build the application

   ```sh
   pnpm build
   ```

2. Start it

   ```sh
   pnpm start
   ```

## Notes

### Show loading when fetching electricity prices

Fetching the electricity prices _CAN_ be slow if you are trying to fetch a price that has not been fetched by anyone before you. Once they have been fetched one time, it will be fast. This is, because of caching done on the server.

### CMS for providers

Make it easier to add/remove/update providers. Could use an external CMS like Sanity, or make my own local. For now, you just have to use `pnpm prisma studio` and add one manually.

### Different plans for different regions

Now all provider plans are in all regions, but realistically they would only be in some of them. So a plan should probably have an `operatingRegion` field with a `PriceRegion[]`.

### Responsiveness

I have made an effort to make the website responsive, but I still don't think the graph looks that good.

## Screenshots

<table>
   <tr>
      <td align="center">
         <img height="300" src="/assets/stromsta-home.png" />
         <br>
         <sub><b>Home page</b></sub>
      </td>
   </tr>
   <tr>
      <td align="center">
         <img height="300" src="/assets/stromsta-compare.png" />
         <br>
         <sub><b>Compare prices</b></sub>
      </td>
   </tr>
   <tr>
      <td align="center">
         <img height="300" src="/assets/stromsta-profile.png" />
         <br>
         <sub><b>Profile page</b></sub>
      </td>
   </tr>
</table>
