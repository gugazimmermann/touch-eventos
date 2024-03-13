import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../../../constants/routes";
import { AdminTopNav } from "../../../components/layout";
import qrCodeImg from "../../../images/activity_qrcode.svg";
import freeTicketImg from "../../../images/activit_free_ticket.svg";

const ActivityType = ({ image, title, description }) => {
  const navigate = useNavigate();

  return (
    <button
    className="p-4 w-full max-w-xs text-center shadow-md rounded-md transform transition duration-150 hover:scale-105 hover:shadow-xl"
    onClick={() => navigate(`/${ROUTES.ADMIN.NEWOPENACTIVITY}`)}
    >
      <img
        className="w-full h-48 mx-auto rounded-lg"
        src={image}
        alt="QR Code"
      />
      <div className="mt-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <span className="mt-1">{description}</span>
      </div>
    </button>
  );
};

const ChooseType = () => {
  const { t } = useTranslation("new_activity");

  return (
    <section className="w-full mb-8">
      <AdminTopNav title={t("Escolha o Tipo de Atividade")} />
      <div className="flex flex-col justify-center mx-auto bg-white p-4 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-evenly items-center p-4">
          <ActivityType
            image={qrCodeImg}
            title={t("Atividade Aberta")}
            description={t("Cadastro feito por QRCode na atividade, opção de brinde para os visitantes.")}
          />
          <ActivityType
            image={freeTicketImg}
            title={t("Ingresso Gratuito")}
            description={t("Cadastro prévio obrigatório, aplicativo para conferencia dos ingressos.")}
          />
        </div>
      </div>
    </section>
  );
};

export default ChooseType;
