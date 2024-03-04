#!/bin/bash

USER_POOL_ID=""
DYNAMO_DATA_PATH="dynamodb-data/initial_data-dev.json"

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
        \"stripeCustomerId\": {\"S\": \"cus_PeoQjqRMafRyDI\"}
    }"

aws dynamodb batch-write-item --request-items file://"$DYNAMO_DATA_PATH"

aws dynamodb put-item \
    --table-name "dev-touch-eventos-Activities" \
    --item "{   
        \"activityId\": {\"S\": \"f3420389-26e8-4025-a00b-5080d2684ef3\"},
        \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},                
        \"planId\": {\"S\": \"09c796b1-1d18-4763-87c3-bc39a62ef2e0\"},
        \"name\": {\"S\": \"Casa e Decoração\"},
        \"slug\": {\"S\": \"casa-e-decoracao\"},
        \"dates\": {\"S\": \"[\\\"01/03/24\\\",\\\"02/03/24\\\",\\\"03/03/24\\\"]\"},
        \"startDate\": {\"S\": \"1709262000000\"},
        \"endDate\": {\"S\": \"1709434800000\"},
        \"addressCountry\": {\"S\": \"BR\"},
        \"addressZipCode\": {\"S\": \"88301701\"},
        \"addressState\": {\"S\": \"SC\"},
        \"addressCity\": {\"S\": \"Itajaí\"},
        \"addressStreet\": {\"S\": \"Avenida Ministro Victor Konder\"},
        \"addressNumber\": {\"S\": \"303\"},
        \"addressNeighborhood\": {\"S\": \"Centro\"},
        \"addressComplement\": {\"S\": \"Centreventos\"},
        \"addressLatitude\": {\"S\": \"-26.9153814\"},
        \"addressLongitude\": {\"S\": \"-48.6530516\"},
        \"verificationId\": {\"S\": \"681365db-f935-4b83-bf3a-ced700a6ffc5\"},
        \"visitorGift\": {\"S\": \"YES\"},
        \"raffle\": {\"S\": \"YES\"},
        \"surveyLastDay\": {\"S\": \"1709521200000\"},
        \"raffleDay\": {\"S\": \"1709607600000\"},
        \"raffleType\": {\"S\": \"SURVEY\"},
        \"notificationOnConfirm\": {\"S\": \"YES\"},
        \"notificationOnActivityEnd\": {\"S\": \"YES\"},
        \"notificationOnActivityEnd\": {\"S\": \"YES\"},
        \"raffleAutomatic\": {\"N\": \"1\"},
        \"visitorGiftText\": {\"S\": \"Ganhe uma eco-bag ao se cadastrar!\"},
        \"raffleText\": {\"S\": \"Participe de nossa pesquisa e concorra a um sofá.\"},
        \"surveyText\": {\"S\": \"Participe da Pesquisa, é muito importante para nós!\"},
        \"notificationOnConfirm\": {\"S\": \"YES\"},
        \"notificationOnActivityEnd\": {\"S\": \"YES\"},
        \"confirmationText\": {\"S\": \"Casa e Decoração - Finalize seu cadastro com o código  {######}\"},
        \"notificationOnConfirmText\": {\"S\": \"Casa e Decoração - Olá! Não se não se esqueça de participar da nossa pesquisa e concorrer no sorteio. Acesse: {https://pesquisa.toucheventos.com.br/casa-e-decoracao}\"},
        \"notificationOnEndText\": {\"S\": \"Casa e Decoração - Nossa pequisa encerra dia 04/03/24, participe para concorrer no sorteio! Acesse: {https://pesquisa.toucheventos.com.br/casa-e-decoracao}\"},
        \"raffleAutomaticText\": {\"S\": \"Parabéns {NAME},\n\nVocê foi o vencedor do nosso sorteio! Entre em contato para retirar seu prêmio.\n\nEquipe Casa e Decoração\"},
        \"city\": {\"S\": \"Itajaí\"},
        \"state\": {\"S\": \"SC\"},
        \"location\": {\"S\": \"Itajaí+SC\"},
        \"createdAt\": {\"S\": \"1709265628000\"},
        \"active\": {\"N\": \"1\"},
        \"payment\": {
            \"M\": {
                \"date\": {\"S\": \"1709295768000\"},
                \"paymentId\": {\"S\": \"696dfbbd-3c8f-4dff-aaa0-6e855f34d7b9\"},
                \"paymentIntentId\": {\"S\": \"pi_3OpUtsAXbGdhNjWK2FoloFUX\"},
                \"plan\": {\"S\": \"Atividade Única / 3 dias\"},
                \"status\": {\"S\": \"success\"},
                \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},
                \"value\": {\"S\": \"100\"}
            }
        }
    }"

aws dynamodb put-item \
    --table-name "dev-touch-eventos-Payments" \
    --item "{
          \"paymentId\": {\"S\": \"696dfbbd-3c8f-4dff-aaa0-6e855f34d7b9\"},
          \"date\": {\"S\": \"1709295768000\"},
          \"paymentIntentId\": {\"S\": \"pi_3OpUtsAXbGdhNjWK2FoloFUX\"},
          \"plan\": {\"S\": \"Atividade Única / 3 dias\"},
          \"status\": {\"S\": \"success\"},
          \"userId\": {\"S\": \"$CREATE_USER_OUTPUT\"},
          \"value\": {\"S\": \"100\"}
    }"


echo "Usuário gugazimmermann@gmail.com criado e dados carregados com sucesso."
