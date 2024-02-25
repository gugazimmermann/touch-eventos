# Touch Eventos

## SST

Usefull Commands

* npx sst deploy --stage dev
* npx sst remove --stage dev

## AWS CLI

Usefull Commands

* set AWS_CLI_FILE_ENCODING=UTF-8

* aws dynamodb batch-write-item --request-items file://./dynamodb-data/dev.json
* aws dynamodb list-tables --output table
* aws dynamodb delete-table --table-name TABLE_NAME
* aws cognito-idp list-user-pools --max-results 60
* aws cognito-idp delete-user-pool --user-pool-id USER_POOL_ID

## Generate Fake Data for Dev

- run `aws dynamodb batch-write-item --request-items file://./dynamodb-data/dev.json`
- create a activity and get the activityID
- create the desk users `node fake-desk.cjs --activity XX --quantity XX`, this will create the file activities-desk.json.
- with the desk itens the registers can be created, `node fake-registers.cjs --type EMAIL|SMS --quantity XX`.
- run the migrations in https://old.console.sst.dev/
