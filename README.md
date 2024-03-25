# Cloudant Backup Service

This service is designed to back up one or multiple Cloudant databases to a file and uploaded to a Cloud Object Storage (COS) bucket on IBM Cloud.

## Prerequisites

- [PNPM](https://pnpm.io/installation)
- [Node v18](https://nodejs.org/en/download/)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Configuration

The service is configured using environment variables.

Please refer to the [`.env.example`](.env.example) file for the list of environment variables that need to be set.

## Installing dependencies

To install the dependencies, you can use the following command:

```bash
pnpm install
```

## Running the service

⚠️ Please note that you need to set the required environment variables before running the service.

To run the service, you can use the following command:

```bash
pnpm start
```

## Running the service in development mode

To run the service in development mode, you can use the following command:

```bash
pnpm start:dev
```

## Running the service using Docker

To run the service using Docker, you can use the following command:

```bash
./containerizer dev build && ./containerizer dev up
```

Optionally, you can use the following command to run the service using Docker in production mode:

```bash
./containerizer prod build && ./containerizer prod up
```


