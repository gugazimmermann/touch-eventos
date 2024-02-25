# Touch Eventos

## SST

Usefull Commands

* npx sst deploy --stage dev
* npx sst remove --stage dev

## AWS CLI - Prod plans and subscriptions
* aws dynamodb batch-write-item --request-items file://./dynamodb-data/prod.json

## Generate Fake Data for Dev - Linux

- need jq installed `sudo apt-get install jq`
- `chmod +x start-dev.sh`
- `./start-dev.sh --USER_POOL_ID us-east-1_XXXXXX`
- now we have plans, subscriptions, cognito user and activity.
- `cd fake-data` and create the desk users `node fake-desk.cjs --activity f3420389-26e8-4025-a00b-5080d2684ef3 --quantity XX`, this will create the file activities-desk.json.
- with the desk itens the registers can be created, `node fake-registers.cjs --type EMAIL|SMS --quantity XX`, the file fake-data/activities-register.json will be created.
- run the migrations in https://old.console.sst.dev/
