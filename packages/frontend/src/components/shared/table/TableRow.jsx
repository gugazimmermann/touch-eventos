const TableRow = ({ items }) => {
  return items.map((item, i) => (
    <tr key={i}>
      {Object.entries(item).map(([key, value]) => (
        <td key={key} className="px-4 py-4 text-sm whitespace-nowrap">
          {value}
        </td>
      ))}
    </tr>
  ));
};

export default TableRow;
