const ROUTES = Object.freeze({
  WEBSITE: {
    COMPANY: "empresa",
    WORK_WITH_US: "trabalhe-conosco",
    FAQ: "perguntas_frequentes",
    CONTACT: "contato",
    USAGE_TERMS: "termos-de-uso",
    PRIVACITY_TERMS: "privacidade",
  },
  AUTH: {
    SIGNIN: "entrar",
    SIGNUP: "cadastrar",
    CONFIRMEMAIL: "confirmar-email",
    FORGOTPASSWORD: "esqueceu-senha",
    NEWPASSWORD: "nova-senha",
  },
  ADMIN: {
    DASHBOARD: "dashboard",
    ACCOUNT: "minha-conta",
    NEWEVENT: "novo-evento",
    EVENT: "evento",
    REGISTERS: "cadastros",
    SURVEYS: "pesquisas",
    DESK: "balcao",
  },
  EVENTS: {
    REGISTER: "cadastro",
    CONFIRM: "confirmacao",
  }
});

export default ROUTES;
