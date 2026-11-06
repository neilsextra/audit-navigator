FROM registry-gitlab.csda.gov.au/ict-infra/docker/openshift/ubi9/python-314:1-1779943392

COPY src/ src/

COPY pylib/ pylib/
COPY pylib/flask/ pylib/flask/

EXPOSE 8080

ENTRYPOINT ["python3", "-X", "pylib", "src/monitor", "pylib", "8080"]
