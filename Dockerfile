FROM wiremock/wiremock:2.32.0 as base

ADD mappings /home/wiremock/mappings
