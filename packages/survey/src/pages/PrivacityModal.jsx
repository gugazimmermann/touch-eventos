import Logo from "../components/layout/Logo";

const PrivacityModal = ({ activity, userAcceptPrivacity }) => {
  return (
    <section className="max-w-2xl px-8 py-4 bg-white rounded-lg shadow-md my-8 mx-auto z-40">
      <div className="flex items-center justify-between ">
        <div className="flex flex-col gap-2">
          <span className="text-sm font-light text-gray-600 dark:text-gray-400">
            atualizado em 05 de Março de 2024
          </span>
          <span className="text-xl font-bold">PRIVACIDADE</span>
        </div>
        <span className="inline-flex p-2 text-primary-500 rounded-lg shrink-0 bg-primary-100/80">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path
              fillRule="evenodd"
              d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m-.55 8.502L7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0M8.002 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
            />
          </svg>
        </span>
      </div>
      <div className="mt-4">
        <p className="mt-2 leading-relaxed">
          Ao participar e preencher a presente pesquisa,{" "}
          <strong>você, como usuário, concorda</strong> de forma inequívoca que
          os dados pessoais fornecidos serão coletados, processados e
          armazenados de maneira segura pela <strong>Touch Eventos</strong>.
          Estes dados serão utilizados com o objetivo primário de realizar
          análises estatísticas e avaliações de visitação referentes à Atividade{" "}
          <strong>{activity?.name}</strong>, contribuindo assim para o
          aprimoramento e planejamento estratégico de futuras edições e
          iniciativas.
        </p>
        <p className="mt-2 leading-relaxed">
          Ao prosseguir com o preenchimento da pesquisa, você expressa sua
          autorização para que a organização do Atividade{" "}
          <strong>{activity?.name}</strong> tenha acesso aos dados coletados,
          restritamente para os propósitos de análise e melhorias das atividades
          oferecidas, desenvolvimento de projetos futuros e para a comunicação
          de informações relevantes relacionadas a eventos subsequentes que
          possam ser do seu interesse.
        </p>
        <p className="mt-2 leading-relaxed">
          Reiteramos nosso compromisso com a privacidade e a proteção dos seus
          dados pessoais, agindo sempre em conformidade com a legislação de
          proteção de dados em vigor. As medidas adotadas visam garantir a
          segurança dos seus dados, evitando o acesso, a divulgação ou o uso não
          autorizado dos mesmos. Apenas pessoal autorizado terá acesso às
          informações fornecidas, sob estritas normas de confidencialidade.
        </p>
        <p className="mt-2 leading-relaxed">
          Informamos também que seus direitos enquanto titular dos dados são
          plenamente respeitados, incluindo o direito de acessar, corrigir,
          limitar ou excluir suas informações pessoais de nossos registros a
          qualquer momento. Caso deseje exercer algum desses direitos ou tenha
          qualquer dúvida sobre o tratamento dos seus dados, por favor, entre em
          contato conosco por meio dos canais de atendimento disponibilizados
          pela <strong>Touch Eventos</strong> ou pela organização da Atividade{" "}
          <strong>{activity?.name}</strong>.
        </p>
        <p className="mt-2 leading-6">
          Por fim, ao fornecer seus dados pessoais,{" "}
          <strong>
            você declara estar ciente e concordar com os termos aqui
            apresentados
          </strong>
          , reconhecendo ter sido plenamente informado(a) sobre as finalidades
          da coleta de dados, a forma como serão tratados e os direitos que lhe
          são assegurados pela legislação aplicável à proteção de dados.
          Valorizamos sua participação e confiança, e nos comprometemos a
          trabalhar continuamente para garantir a qualidade e a relevância de
          nossas atividades, respeitando sempre a sua privacidade e segurança
          das informações.
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Logo />
        <button
          className="w-auto font-medium bg-success-600 rounded-lg hover:bg-success-700 text-white px-4 py-2.5 duration-300 transition-colors focus:outline-none"
          onClick={() => userAcceptPrivacity()}
        >
          Aceito Participar
        </button>
      </div>
    </section>
  );
};

export default PrivacityModal;
