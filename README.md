# audit-navigator


## To Build

`poetry install --compile`

`python3 -m pip install --trusted-host ${NEXUS_HOST} --index-url "${URL}" --upgrade pip build`

or

`python3 -m pip install --trusted-host ${NEXUS_HOST} --index-url "${URL}" -r requirements.txt --target "./pylib"`
 

## To RUN

`poetry run python src/navigator pylib 8080`

 or

`python src/navigator pylib 8080`
