# Touch Eventos

## SST

Usefull Commands

* npx sst deploy --stage dev
* npx sst remove --stage dev

## AWS CLI

Usefull Commands

* set AWS_CLI_FILE_ENCODING=UTF-8

* aws dynamodb batch-write-item --request-items file://./mocks/plans.json
* aws dynamodb list-tables --output table
* aws dynamodb delete-table --table-name TABLE_NAME
* aws cognito-idp list-user-pools --max-results 60
* aws cognito-idp delete-user-pool --user-pool-id USER_POOL_ID
