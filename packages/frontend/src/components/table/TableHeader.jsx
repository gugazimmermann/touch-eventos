import TableHeaderButton from './TableHeaderButton';

const TableHeader = ({ items }) => {
  return (
    <thead className="bg-background-50">
      <tr>
        {items.map((item, i) => (
          <th key={i} scope="col" className="py-3.5 px-4 text-sm text-left">
            {item?.type === "order" ? (
              <TableHeaderButton title={item.title} />
            ) : (
              item.title
            )}
          </th>
        ))}
      </tr>
    </thead>
  );
};

export default TableHeader;
