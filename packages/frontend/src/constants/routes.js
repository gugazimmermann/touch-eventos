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
    ACCOUNT: "conta",
    ACCOUNTPROFILE: "conta/cadastro",
    ACCOUNTPASSWORD: "conta/senha",
    ACCOUNTPAYMENT: "conta/pagamentos",
    NEWACTIVITY: "atividade/nova",
    ACTIVITY: "atividade",
    REGISTERS: "cadastros",
    DEFAULT_SURVEYS: "pesquisa-padrao",
    SURVEYS: "pesquisas",
    ANSWERS: "respostas",
    DESK: "balcao",
  },
  ACTIVITIES: {
    REGISTER: "cadastro",
    CONFIRM: "confirmacao",
  }
});

export default ROUTES;
