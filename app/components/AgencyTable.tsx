'use client';

import * as React from 'react';

interface CfrReference {
  title: number;
  chapter: string;
}

interface Agency {
  id: string;
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
  cfr_references: CfrReference[];
}

interface AgencyTableProps {
  agencies: Agency[];
}

type Order = 'asc' | 'desc';

type SortableAgencyKeys = keyof Omit<Agency, 'children' | 'slug' | 'display_name' | 'sortable_name' | 'id'>;

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends SortableAgencyKeys>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string | CfrReference[] },
  b: { [key in Key]: number | string | CfrReference[] }
) => number {
  if (orderBy === 'cfr_references') {
    return order === 'desc'
      ? (a, b) => {
          const aRefs = (a[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(', ');
          const bRefs = (b[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(', ');
          if (bRefs < aRefs) {
            return -1;
          }
          if (bRefs > aRefs) {
            return 1;
          }
          return 0;
        }
      : (a, b) => {
          const aRefs = (a[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(', ');
          const bRefs = (b[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(', ');
          if (aRefs < bRefs) {
            return -1;
          }
          if (aRefs > bRefs) {
            return 1;
          }
          return 0;
        };
  }
  return order === 'desc'
    ? (a, b) =>
        descendingComparator(
          a as { [key in Key]: number | string },
          b as { [key in Key]: number | string },
          orderBy
        )
    : (a, b) =>
        -descendingComparator(
          a as { [key in Key]: number | string },
          b as { [key in Key]: number | string },
          orderBy
        );
}

function stableSort<T>(
  array: readonly T[],
  comparator: (a: T, b: T) => number
) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

export default function AgencyTable({ agencies }: AgencyTableProps) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<SortableAgencyKeys>('name');

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: SortableAgencyKeys
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const processedAgencies = agencies.map((agency) => ({
    ...agency,
    id: agency.slug, // Use slug as a unique id
  }));

  const filteredAgencies = processedAgencies.filter((agency) => {
    const cfrReferences = agency.cfr_references
      .map((ref) => `Title ${ref.title}, Chapter ${ref.chapter}`)
      .join(', ');
    return (
      (agency.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (agency.short_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (cfrReferences?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const sortedAgencies = stableSort(
    filteredAgencies,
    getComparator(order, orderBy)
  );

  return (
    <div className="max-w-7xl m-auto">
      <h1 className="text-3xl font-semibold mb-4">Agencies</h1>
      <input
        type="text"
        placeholder="Type agency name or acronym to filter agency list"
        className="w-full p-2 px-8 border border-gray-300 rounded-full mb-4"
        onChange={handleSearchChange}
      />
      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-600 text-white hidden md:block">
            <tr className='grid grid-cols-1 md:grid-cols-12'>
              <th className="py-3 px-6 text-left col-span-1 md:col-span-4">
                <button onClick={(event) => handleRequestSort(event, 'name')} className="flex items-center">
                  Name
                  <span>{orderBy === 'name' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
              <th className="py-3 px-6 text-left md:col-span-2">
                <button onClick={(event) => handleRequestSort(event, 'short_name')} className="flex items-center">
                  Short Name
                  <span>{orderBy === 'short_name' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
              <th className="py-3 px-6 text-left md:col-span-4">
                <button onClick={(event) => handleRequestSort(event, 'cfr_references')} className="flex items-center">
                  CFR References
                  <span>{orderBy === 'cfr_references' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
              <th className="py-3 px-6 text-left md:col-span-2">
                <button onClick={(event) => handleRequestSort(event, 'cfr_references')} className="flex items-center">
                  Reading Time
                  <span>{orderBy === 'cfr_references' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {sortedAgencies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((agency, index) => (
                <tr key={agency.id} className={`${index % 2 === 0 ? 'bg-gray-100' : ''} grid grid-cols-1 md:grid-cols-12 items-center`}>
                  <td className="py-3 px-6 text-left whitespace-nowrap md:col-span-4">{agency.name}</td>
                  <td className="py-3 px-6 text-left md:col-span-2">{agency.short_name}</td>
                  <td className="py-3 px-6 text-left md:col-span-4">
                    {agency.cfr_references
                      .map((ref) => `Title ${ref.title}, Chapter ${ref.chapter}`)
                      .join(', ')}
                  </td>
                  <td className="py-3 px-6 text-left md:col-span-2">
                    <p>Reading Time:</p>
                    <p>Document Count:</p>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            className="p-2 border border-gray-300 rounded"
          >
            {[10, 25, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="ml-2">Rows per page</span>
        </div>
        <div>
          <button
            onClick={(e) => handleChangePage(e, page - 1)}
            disabled={page === 0}
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="mx-2">
            Page {page + 1} of {Math.ceil(sortedAgencies.length / rowsPerPage)}
          </span>
          <button
            onClick={(e) => handleChangePage(e, page + 1)}
            disabled={page >= Math.ceil(sortedAgencies.length / rowsPerPage) - 1}
            className="p-2 border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
