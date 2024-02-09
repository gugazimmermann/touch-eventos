const AuthCard = ({ title, footer, children }) => {
  return (
    <div className="w-full max-w-md bg-background-50 rounded-lg shadow-md">
      <div className="px-8 py-4">
        <h3
          data-testid="auth-card-title"
          className="mt-3 text-xl text-center text-strong"
        >
          {title}
        </h3>
        {children}
      </div>
      <div className="flex items-center justify-center py-4 text-center bg-primary-500 rounded-b-lg">
        {footer}
      </div>
    </div>
  );
};

export default AuthCard;
