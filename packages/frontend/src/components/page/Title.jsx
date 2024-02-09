const Title = ({ title, description, count }) => {
  return (
    <div>
      <div className="flex items-center gap-x-3">
        <h2 className="text-lg text-strong">{title}</h2>
        {(count && count > 0) && (
          <span className="px-3 py-1 text-xs text-primary-500 bg-primary-200 font-bold rounded-full">
            {count}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm">{description}</p>
    </div>
  );
};

export default Title;
