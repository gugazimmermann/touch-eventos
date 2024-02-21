import { useState } from "react";
import { useTranslation } from "react-i18next";
import contactUsImg from "./images/contact-us.png";
import { validateEmail, validateName } from "../../../helpers/validate";
import { EmailFilled, PhoneFilled } from "../../../icons";
import { FormButton, InputField, TextField } from "../../../components/form";
import { Alert, Loading, Title } from "../../../components";

const ContactUs = () => {
  const { t } = useTranslation("contactus");
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!validateName(values.name)) {
      setError(t("name_invalid"));
      setLoading(false);
      return;
    }
    if (!validateEmail(values.email)) {
      setError(t("email_invalid"));
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SITE_API_URL}/contact`,
        {
          method: "POST",
          body: JSON.stringify(values),
        }
      );
      await response.json();
      setLoading(false);
      setSuccess(t("success"));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section
      className="flex flex-grow w-full bg-cover bg-fixed bg-bottom bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url(${contactUsImg})`,
      }}
    >
      <div className="container mx-auto bg-background-50/90 p-4">
        <div className="w-full flex flex-col sm:flex-row">
          <div className="sm:w-1/2 flex flex-col items-center justify-center">
            <img
              className="w-64 h-64 sm:w-96 sm:h-96 object-cover mx-auto rounded-3xl shadow-lg block mb-8"
              src={contactUsImg}
              alt="graph"
            />
            <p className="flex justify-center items-center font-bold text-primary-500 mb-4 text-xl">
              <PhoneFilled className="h-7 w-7 sm:h-5 sm:w-5" />
              <span className="mx-2 text-text-700">(47) 99701-4984</span>
            </p>
            <p className="flex justify-center items-center font-bold text-primary-500 mb-4 text-xl">
              <EmailFilled className="h-7 w-7 sm:h-5 sm:w-5" />
              <span className="mx-2 text-text-700">
                <a href="mailto:contato@touchsistemas.com.br">
                  contato@touchsistemas.com.br
                </a>
              </span>
            </p>
          </div>
          <div className="sm:w-1/2 px-4">
            <div className="text-center">
              <Title title={t("title")} />
            </div>
            <form className="mt-4" onSubmit={handleSubmit}>
              {loading && <Loading />}
              {error && <Alert message={error} type="danger" />}
              {success && <Alert message={success} type="success" />}
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-full">
                  <InputField
                    disabled={loading}
                    // required={true}
                    autocomplete="name"
                    type="text"
                    placeholder={t("name")}
                    value="name"
                    values={values}
                    setValues={setValues}
                  />
                </div>
                <div className="w-full">
                  <InputField
                    disabled={loading}
                    // required={true}
                    autocomplete="email"
                    type="email"
                    placeholder={t("email")}
                    value="email"
                    values={values}
                    setValues={setValues}
                  />
                </div>
              </div>
              <div className="mt-4">
                <TextField
                  disabled={loading}
                  placeholder={t("message")}
                  value="message"
                  values={values}
                  setValues={setValues}
                />
              </div>
              <div className="w-full text-center mt-4">
                <FormButton
                  testid="contact-send-button"
                  text={t("send")}
                  disabled={loading}
                  type="submit"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
