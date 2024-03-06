import { Alert, Loading } from "../components";
import { Header, FooterSmall } from "../components/layout";
import Banners from "./Banners";

const LoadingShadow = () => {
  return (
    <section className="flex flex-col flex-grow w-full">
      <div className="w-full flex-grow p-4 max-w-sm mx-auto overflow-hidden bg-white animate-pulse">
        <div className="w-full h-72 bg-gray-300 rounded-t-lg" />
        <p className="w-72 h-8 mx-auto mt-4 bg-gray-200 rounded-lg" />
        <p className="w-72 h-12 mx-auto mt-4 bg-gray-200 rounded-lg" />
        <p className="w-72 h-12 mx-auto mt-4 bg-gray-200 rounded-lg" />
      </div>
    </section>
  );
};

const Layout = ({
  loadingPage,
  loading,
  error,
  info,
  warning,
  activity,
  final,
  children,
}) => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header nav={false} lang={true} />
      <main className="flex flex-grow flex-col items-center justify-start m-auto w-full mt-10">
        {loadingPage ? (
          <LoadingShadow />
        ) : (
          <section className="flex flex-col flex-grow w-full">
            {loading ? (
              <div className="flex flex-grow justify-center items-center">
                <Loading size="w-20 w-20" />
              </div>
            ) : (
              <div className="container mx-auto flex-grow bg-background-50 p-4 mb-8">
                {activity && (
                  <div className="w-full max-w-sm  mx-auto overflow-hidden bg-white rounded-lg shadow-lg pb-8">
                    {activity.logo && (
                      <img
                        className="object-cover object-center w-full h-64"
                        src={activity.logo}
                        alt="logo"
                      />
                    )}
                    <div className="flex items-center justify-center px-8 py-4 mb-4 bg-success-500">
                      <h1 className="text-xl font-bold text-white">
                        {activity.name}
                      </h1>
                    </div>

                    {(error || info || warning) && (
                      <div className="p-2 -mb-2 -mt-4">
                        {error && (
                          <Alert message={error} type="danger" center={true} />
                        )}
                        {info && (
                          <Alert message={info} type="info" center={true} />
                        )}
                        {warning && (
                          <Alert
                            message={warning}
                            type="warning"
                            center={true}
                          />
                        )}
                      </div>
                    )}

                    {children}

                    <div className="mt-4 w-full text-center">
                      <Banners activity={activity} final={final} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}
      </main>
      <FooterSmall green={true} />
    </div>
  );
};

export default Layout;
