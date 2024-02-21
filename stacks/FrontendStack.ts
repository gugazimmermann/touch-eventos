import { StaticSite, StackContext, use } from "sst/constructs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";
import { SiteApiStack } from "./SiteApiStack";
import { ApiStack } from "./ApiStack";
import { CognitoStack } from "./CognitoStack";

export function FrontendStack({ stack, app }: StackContext) {
  const { siteApi } = use(SiteApiStack);
  const { api } = use(ApiStack);
  const { cognito } = use(CognitoStack);

  const frontend = new StaticSite(stack, "Frontend", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "eventos.touchsistemas.com.br",
            hostedZone: "touchsistemas.com.br",
            cdk: {
              certificate: Certificate.fromCertificateArn(
                stack,
                "FrontendCertificate",
                String(process.env.DOMAIN_CERT_ARM)
              ),
            },
          }
        : undefined,
    path: "packages/frontend",
    buildCommand: "npm run build",
    buildOutput: "build",
    dev: {
      url: "http://localhost:3000",
    },
    environment: {
      REACT_APP_SITE_TITLE: "Touch Eventos",
      REACT_APP_SITE_REGISTRATION_URL: String(process.env.REGISTRATION_URL),
      REACT_APP_SITE_DESK_URL: String(process.env.DESK_URL),
      REACT_APP_SITE_SURVEY_URL: String(process.env.SURVEY_URL),
      REACT_APP_SITE_API_URL: siteApi.customDomainUrl || siteApi.url,
      REACT_APP_API_URL: api.customDomainUrl || api.url,
      REACT_APP_AWS_REGION: app.region,
      REACT_APP_USER_POOL_ID: cognito.userPoolId,
      REACT_APP_USER_POOL_CLIENT_ID: cognito.userPoolClientId,
      REACT_APP_STRIPE_KEY: String(process.env.STRIKE_KEY),
      REACT_APP_STRIPE_CALLBACK_URL: String(process.env.STRIPE_CALLBACK_URL),
    },
  });

  const registration = new StaticSite(stack, "Registration", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "cadastros.touchsistemas.com.br",
            hostedZone: "touchsistemas.com.br",
            cdk: {
              certificate: Certificate.fromCertificateArn(
                stack,
                "RegistrationCertificate",
                String(process.env.DOMAIN_CERT_ARM)
              ),
            },
          }
        : undefined,
    path: "packages/registration",
    buildCommand: "npm run build",
    buildOutput: "build",
    dev: {
      url: "http://localhost:3003",
    },
    environment: {
      REACT_APP_SITE_TITLE: "Touch Eventos - Cadastro",
      REACT_APP_SITE_URL: String(process.env.SITE_URL),
      REACT_APP_SITE_API_URL: siteApi.customDomainUrl || siteApi.url,
    },
  });

  const desk = new StaticSite(stack, "Desk", {
    customDomain:
      stack.stage === "production"
        ? {
            domainName: "balcao.touchsistemas.com.br",
            hostedZone: "touchsistemas.com.br",
            cdk: {
              certificate: Certificate.fromCertificateArn(
                stack,
                "DeskCertificate",
                String(process.env.DOMAIN_CERT_ARM)
              ),
            },
          }
        : undefined,
    path: "packages/desk",
    dev: {
      url: "http://localhost:3006",
    },
    buildCommand: "npm run build",
    buildOutput: "build",
    environment: {
      REACT_APP_SITE_TITLE: "Touch Eventos - Brindes",
      REACT_APP_SITE_API_URL: siteApi.customDomainUrl || siteApi.url,
    },
  });

  stack.addOutputs({
    FrontendUrl: frontend.customDomainUrl || frontend.url,
    RegistrationUrl: registration.customDomainUrl || registration.url,
    DeskUrl: desk.customDomainUrl || desk.url,
  });
}
