# Community Accommodation Services Wiremock

A collection of mocks inside a Docker container intended for use with the
[Community Accommodation API](https://github.com/ministryofjustice/hmpps-approved-premises-api).

This is a simple Docker container which contains a number of mappings for
the following services:

- Alfresco
- OAsys
- Assess Risks and Needs
- Community API (Delius)
- HMPPS Tier
- Offender Case Notes
- Prison API (NOMIS)

This is designed to give Community Accommodation Services a realistic corpus
of data that can be used when running usability testing sessions.

## Prerequisites

- Docker

## Running locally

This repo consists of a Docker container which uses the official [Wiremock Docker image](https://hub.docker.com/r/wiremock/wiremock)
and adds the relevant mappings from the [Mappings Directory](https://github.com/ministryofjustice/hmpps-community-accommodation-wiremock/tree/main/mappings).

To run the mappings locally, run the following command:

```bash
docker run -p 9999:8080 hmpps-community-accommodation-wiremock
```

(Replace `9999` with the port you want Wiremock to be accessible from)

## Utils

As part of our user testing procedure, we want to ensure that the
data we have in the API matches up with the data that we're returning
from Wiremock. To help us with this, we have a list of known offenders
and users in the `data` directory, as well as stub application data.

If, for any reason, any of the underlying data needs to change, we
can run the following command to update the Wiremock mappings:

```bash
script/generate_mappings
```

And this command to update the API migrations:

```bash
script/generate_migrations /path/to/api/directory
```

Where `/path/to/api/directory` is the location of your API repo
directory. You'll then need to push up a branch and open a pull
request to change the migrations.
