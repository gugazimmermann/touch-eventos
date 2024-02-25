#!/bin/bash

USER_POOL_ID=""
DYNAMO_DATA_PATH="dynamodb-data/initial_data.json"

usage() {
    echo "Usage: $0 --USER_POOL_ID <UserPoolId>"
    exit 1
}

POSITIONAL=()
while [[ $# -gt 0 ]]; do
    case $1 in
        --USER_POOL_ID)
            USER_POOL_ID="$2"
            shift
            shift
            ;;
        -h|--help)
            usage
            exit
            ;;
        *)
            POSITIONAL+=("$1")
            shift
            ;;
    esac
done
set -- "${POSITIONAL[@]}"

if [ -z "$USER_POOL_ID" ]; then
    echo "O USER_POOL_ID é obrigatório."
    usage
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "jq não intalado."
    exit 1
fi

if [ ! -f "$DYNAMO_DATA_PATH" ]; then
    echo "Arquivo não encontrado: $DYNAMO_DATA_PATH"
    exit 1
fi

DATE_NOW=$(date +%s%3N)

CREATE_USER_OUTPUT=$(aws cognito-idp admin-create-user \
    --user-pool-id "$USER_POOL_ID" \
    --username "gugazimmermann@gmail.com" \
    --user-attributes Name=email,Value="gugazimmermann@gmail.com" Name=email_verified,Value=true \
    --message-action SUPPRESS \
    --query "User.Username" \
    --output text)

if [ $? -ne 0 ]; then
    echo "Erro ao criar o usuário ou ao obter o ID do usuário."
    exit 1
fi

aws cognito-idp admin-set-user-password \
    --user-pool-id "$USER_POOL_ID" \
    --username "gugazimmermann@gmail.com" \
    --password "123456" \
    --permanent

aws dynamodb put-item \
    --table-name "dev-touch-eventos-Users" \
    --item "{
        \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},
        \"email\": {\"S\": \"gugazimmermann@gmail.com\"},
        \"createdAt\": {\"S\": \"$DATE_NOW\"},
        \"active\": {\"N\": \"1\"},
        \"addressCity\": {\"S\": \"Itajaí\"},
        \"addressComplement\": {\"S\": \"apt 705\"},
        \"addressLatitude\": {\"S\": \"-26.9046134\"},
        \"addressLongitude\": {\"S\": \"-48.6715288\"},
        \"addressNeighborhood\": {\"S\": \"São João\"},
        \"addressNumber\": {\"S\": \"410\"},
        \"addressState\": {\"S\": \"SC\"},
        \"addressStreet\": {\"S\": \"Rua Benjamin Franklin Pereira\"},
        \"addressTimezone\": {\"S\": \"America/Sao_Paulo\"},
        \"addressZipCode\": {\"S\": \"88304070\"},
        \"document\": {\"S\": \"006.749.029-80\"},
        \"documentType\": {\"S\": \"CPF\"},
        \"name\": {\"S\": \"Guga Zimmermann\"},
        \"phone\": {\"S\": \"(48) 9887-04247\"},
        \"phoneCode\": {\"S\": \"+55\"},
        \"stripeCustomerId\": {\"S\": \"cus_Pd53rppMGC3N5d\"}
    }"

aws dynamodb batch-write-item --request-items file://"$DYNAMO_DATA_PATH"

aws dynamodb put-item \
    --table-name "dev-touch-eventos-Activities" \
    --item "{
          \"activityId\": {\"S\": \"f3420389-26e8-4025-a00b-5080d2684ef3\"},
          \"active\": {\"N\": \"1\"},
          \"addressCity\": {\"S\": \"Itajaí\"},
          \"addressComplement\": {\"S\": \"\"},
          \"addressCountry\": {\"S\": \"BR\"},
          \"addressLatitude\": {\"S\": \"-26.9081927\"},
          \"addressLongitude\": {\"S\": \"-48.6665103\"},
          \"addressNeighborhood\": {\"S\": \"Centro\"},
          \"addressNumber\": {\"S\": \"459\"},
          \"addressState\": {\"S\": \"SC\"},
          \"addressStreet\": {\"S\": \"Rua Almirante Barroso\"},
          \"addressZipCode\": {\"S\": \"88303040\"},
          \"city\": {\"S\": \"Itajaí\"},
          \"createdAt\": {\"S\": \"1708896295020\"},
          \"dates\": {\"S\": \"[\\\"29/06/24\\\",\\\"30/06/24\\\"]\"},
          \"endDate\": {\"S\": \"1719716400000\"},
          \"location\": {\"S\": \"Itajaí+SC\"},
          \"name\": {\"S\": \"Teste de Atividade\"},
          \"notificationOnActivityEnd\": {\"S\": \"YES\"},
          \"notificationOnConfirm\": {\"S\": \"YES\"},
          \"payment\": {
            \"M\": {
              \"date\": {\"S\": \"1708896278\"},
              \"paymentId\": {\"S\": \"696dfbbd-3c8f-4dff-aaa0-6e855f34d7b9\"},
              \"paymentIntentId\": {\"S\": \"pi_3OnpBaAXbGdhNjWK3bpdWF8Q\"},
              \"plan\": {\"S\": \"Atividade Única / 3 dias\"},
              \"status\": {\"S\": \"success\"},
              \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},
              \"value\": {\"S\": \"100\"}
            }
          },
          \"planId\": {\"S\": \"09c796b1-1d18-4763-87c3-bc39a62ef2e0\"},
          \"raffle\": {\"S\": \"YES\"},
          \"raffleTextEN\": {\"S\": \"Fill out the final draw and compete for a beautiful sofa.\"},
          \"raffleTextES\": {\"S\": \"Completa el sorteo final y compite por un hermoso sofá.\"},
          \"raffleTextPTBR\": {\"S\": \"Preencha o sorteio final e concorra a um lindo sofá.\"},
          \"raffleType\": {\"S\": \"SURVEY\"},
          \"slug\": {\"S\": \"teste-de-atividade\"},
          \"startDate\": {\"S\": \"1719630000000\"},
          \"state\": {\"S\": \"SC\"},
          \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},
          \"verificationId\": {\"S\": \"681365db-f935-4b83-bf3a-ced700a6ffc5\"},
          \"visitorGift\": {\"S\": \"YES\"},
          \"visitorGiftTextEN\": {\"S\": \"Earn an ecobag when you sign up!\"},
          \"visitorGiftTextES\": {\"S\": \"Gana una ecobag al registrarte!\"},
          \"visitorGiftTextPTBR\": {\"S\": \"Ganhe uma ecobag ao se cadastrar!\"}
    }"

aws dynamodb put-item \
    --table-name "dev-touch-eventos-Payments" \
    --item "{
          \"paymentId\": {\"S\": \"696dfbbd-3c8f-4dff-aaa0-6e855f34d7b9\"},
          \"date\": {\"S\": \"1708896278\"},
          \"paymentIntentId\": {\"S\": \"pi_3OnpBaAXbGdhNjWK3bpdWF8Q\"},
          \"plan\": {\"S\": \"Atividade Única / 3 dias\"},
          \"status\": {\"S\": \"success\"},
          \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},
          \"value\": {\"S\": \"100\"}
    }"


echo "Usuário gugazimmermann@gmail.com criado e dados carregados com sucesso."
