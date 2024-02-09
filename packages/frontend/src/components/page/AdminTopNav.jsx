const AdminTopNav = ({ title, children }) => {
  return (
    <div className="flex flow-row justify-between py-2">
      <h2 className="text-lg text-strong">{title}</h2>
      {children}
    </div>
  );
};

export default AdminTopNav;
