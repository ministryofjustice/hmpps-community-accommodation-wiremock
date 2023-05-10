ARG uid=2000

FROM wiremock/wiremock:2.35.0 as base

USER 2000

ADD mappings /home/wiremock/mappings
