const PrivacityBanner = ({
  activity,
  openPrivacityModal,
  userAcceptPrivacity,
}) => {
  return (
    <div className="fixed inset-0 z-30 bg-gray-500 bg-opacity-75 flex justify-center items-center">
      <div className="max-w-2xl p-4 bg-white border border-gray-200 gap-x-4 flex items-center rounded-2xl shadow-lg">
        <div className="flex items-center gap-x-4">
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
          <p className="text-sm">
            Seus dados estão seguros conosco! Ao participar desta pesquisa, você
            concorda que a <span className="italic font-semibold">Touch Eventos</span> e a
            organização da atividade{" "}
            <span className="italic font-semibold">{activity?.name}</span> terão acesso aos
            seus dados para análise estatística e melhorias futuras. Privacidade
            garantida.{" "}
            <button
              className="text-secondary-500 hover:underline mt-2"
              onClick={() => openPrivacityModal(true)}
            >
              Clique em aqui para mais detalhes.
            </button>
          </p>
        </div>

        <div className="flex items-center gap-x-4 shrink-0">
          <button
            className="text-xs w-auto font-medium bg-success-600 rounded-lg hover:bg-success-700 text-white px-4 py-2.5 duration-300 transition-colors focus:outline-none"
            onClick={() => userAcceptPrivacity()}
          >
            Aceito Participar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacityBanner;
