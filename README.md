# Touch Eventos

## SST

Usefull Commands

- npx sst deploy --stage dev
- npx sst remove --stage dev

## AWS CLI - Prod plans and subscriptions

- aws dynamodb batch-write-item --request-items file://./dynamodb-data/prod.json

## Generate Fake Data for Dev - Linux

- need jq installed `sudo apt-get install jq`
- `chmod +x start-dev.sh`
- `./start-dev.sh --USER_POOL_ID us-east-1_XXXXXX`
- now we have plans, subscriptions, cognito user and activity.
- `cd fake-data` and create the desk users `node fake-desk.cjs --activity f3420389-26e8-4025-a00b-5080d2684ef3 --quantity XX`, this will create the file activities-desk.json.
- with the desk itens the registers can be created, `node fake-registers.cjs --type EMAIL|SMS --quantity XX`, the file fake-data/activities-register.json will be created.
- run the migrations in https://old.console.sst.dev/

## Modelo dados do QRCode no ticket

https://zpao.github.io/qrcode.react/

{
"iss": "Festival de Música",
"iat": 1710187086,
"exp": 1741723086,
"aud": "festival-de-musica",
"sub": "1",
"activityId": "f3420389-26e8-4025-a00b-5080d2684ef3",
"name": "José Augusto Zimmermann de Negreiros",
"document": "006.749.029-80",
"ticketTypeId": "1",
"validAt": "2024-03-10 23:59:59",
"active": "1"
}

JWT com activityId secret.
sub = ticketId

eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpc3MiOiJGZXN0aXZhbCBkZSBNw7pzaWNhIiwiaWF0IjoxNzEwMTg3MDg2LCJleHAiOjE3NDE3MjMwODYsImF1ZCI6ImZlc3RpdmFsLWRlLW11c2ljYSIsInN1YiI6IjEiLCJhY3Rpdml0eUlkIjoiZjM0MjAzODktMjZlOC00MDI1LWEwMGItNTA4MGQyNjg0ZWYzIiwibmFtZSI6Ikpvc8OpIEF1Z3VzdG8gWmltbWVybWFubiBkZSBOZWdyZWlyb3MiLCJkb2N1bWVudCI6IjAwNi43NDkuMDI5LTgwIiwidGlja2V0VHlwZUlkIjoiMSIsInZhbGlkQXQiOiIyMDI0LTAzLTEwIDIzOjU5OjU5IiwiYWN0aXZlIjoiMSJ9.B2o07nh96jmKqkA5T_671FLmQt9nrFzgDqi3VvCE_hgF1fdhN1Mrc5nuppNv-xwhZL6er5r_qUoWnE2dP8-UIg