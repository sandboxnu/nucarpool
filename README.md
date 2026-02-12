# NU Carpool

##

This is a web app for Northeastern University's students to assists them in finding groups for carpooling while on co-op.

## Get Started

- Clone the project, add environment variables (listed below) in `.env`.

```env
# Prisma


# DATABASE_URL =

# Next Auth

NEXTAUTH_SECRET=
NEXTAUTH_URL=

#MixPanel (use any value for local development)
NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN=
# Mapbox

NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# AWS
ACCESS_KEY_ID_AWS=
SECRET_ACCESS_KEY_AWS=
REGION_AWS=

#Azure Provider (Can be switched out for other Auth Providers)
AZURE_CLIENT_ID=
AZURE_CLIENT_SECRET=
AZURE_TENANT_ID=

# Google Auth Provider (used in the non-prod environment)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Environment Configuration
BUILD_ENV=
NEXT_PUBLIC_ENV=
```

Then do `yarn` and `yarn dev` to get the project running.

## Tech Stack

- Framework: NextJS + Typescript
- Component Library: TailwindCSS + Headless UI
- Authentication: NextAuth
- Map API: Mapbox
- Backend: Serverless with trpc + Prisma + mysql (hosted on PlanetScale)

This is also known as the T3 Stack. More details can be found [here](https://init.tips).
