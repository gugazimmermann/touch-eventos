import TableHeader from './TableHeader';
import TableRow from './TableRow';
import TableFooter from './TableFooter';

const Table = ({ header, items }) => {
  return (
    <div className="flex flex-col mt-4">
      <div className="overflow-x-auto inline-block min-w-full align-middle">
        <div className="overflow-hidden border border-background-200 rounded-lg">
          <table className="min-w-full divide-y divide-background-200">
            <TableHeader items={header} />
            <tbody className="bg-white divide-y divide-background-200">
              <TableRow items={items} />
            </tbody>
          </table>
        </div>
      </div>
      <TableFooter />
    </div>
  );
};

export default Table;
