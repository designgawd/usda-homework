'use client';

import * as React from 'react';
import Image from 'next/image';
import { Agency, Order, SortableAgencyKeys } from '@/app/types/Agencies';
import { getComparator, stableSort } from '@/app/utils/sort';

interface AgencyTableProps {
  agencies: Agency[];
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
      <h1 className="text-3xl font-semibold mb-4 text-teal-600 flex items-center">
        <Image src="/legal-aid-agency-svgrepo-com.svg" className='mr-4' alt="alt" width={50} height={50} />
        Agencies
      </h1>
      <input
        type="text"
        placeholder="Type agency name, acronym, or title number to filter agency list"
        className="w-full p-2 px-8 border border-gray-300 rounded-full mb-4"
        onChange={handleSearchChange}
      />
      <div className="overflow-x-auto rounded-2xl">
        <table className="min-w-full bg-white">
          <thead className="bg-blue-600 text-white hidden md:block">
            <tr className='grid grid-cols-1 md:grid-cols-12 text-sm items-end'>
              <th className="py-3 px-6 text-left col-span-1 md:col-span-4">
                <button onClick={(event) => handleRequestSort(event, 'name')} className="flex items-center">
                  Name
                  <span>{orderBy === 'name' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
              <th className="py-3 px-6 text-left md:col-span-2">
                <button onClick={(event) => handleRequestSort(event, 'cfr_references')} className="flex items-center">
                  CFR References Links
                  <span>{orderBy === 'cfr_references' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
              <th className="py-3 px-6 text-left md:col-span-2 font-normal">
                  Reading Time
              </th>
              <th className="py-3 px-6 text-center md:col-span-1 font-normal">
                  Sub Agencies
              </th>
              <th className="py-3 px-6 text-left md:col-span-1">
                <button onClick={(event) => handleRequestSort(event, 'correctionCount')} className="flex items-center">
                  ECFR Corrections
                  <span>{orderBy === 'correctionCount' ? (order === 'asc' ? ' ↑' : ' ↓') : ''}</span>
                </button>
              </th>
              <td className="py-3 px-6 text-left md:col-span-2 text-xs">
                    0
                  </td>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {sortedAgencies
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((agency, index) => (
                <tr key={agency.id} className={`${index % 2 === 0 ? 'bg-gray-100' : ''} grid grid-cols-1 md:grid-cols-12 items-start`}>
                  <td className="py-3 px-6 text-left md:col-span-4 text-sm">{agency.name} ({agency.short_name})</td>
                  <td className="py-3 px-6 text-left md:col-span-2">
                    {agency.cfr_references
                      .map((ref, key) => (
                          <p key={key} className='text-sm'>Title {ref.title}, Chapter {ref.chapter}</p>
                      ))}
                  </td>
                  <td className="py-3 px-6 text-left md:col-span-2 text-xs">
                    <p>Reading Time:</p>
                    <p>Document Count:</p>
                  </td>
                  <td className="py-3 px-6 text-center md:col-span-1 text-xs">
                    {agency.children.length}
                  </td>
                  <td className="py-3 px-6 text-center md:col-span-1 text-xs">
                    {agency.correctionCount}
                  </td>
                  <td className="py-3 px-6 text-left md:col-span-2 text-xs">
                    0
                  </td>
                  <td className="py-3 px-6 text-left md:col-span-12 text-xs bg-white">
                    GRAPHJ AREA
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center mt-4 bg-yellow-100 rounded-2xl p-2">
        <div>
          <select
            value={rowsPerPage}
            onChange={handleChangeRowsPerPage}
            className="p-2 border border-gray-300 rounded text-sm bg-white"
          >
            {[10, 25, 50].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span className="ml-2 text-sm">Rows per page</span>
        </div>
        <div className='text-sm'>
          <button
            onClick={(e) => handleChangePage(e, page - 1)}
            disabled={page === 0}
            className="p-2 border border-gray-300 rounded disabled:opacity-50 bg-white hover:bg-blue-400"
          >
            Previous
          </button>
          <span className="mx-2">
            Page {page + 1} of {Math.ceil(sortedAgencies.length / rowsPerPage)}
          </span>
          <button
            onClick={(e) => handleChangePage(e, page + 1)}
            disabled={page >= Math.ceil(sortedAgencies.length / rowsPerPage) - 1}
            className="p-2 border border-gray-300 rounded disabled:opacity-50 bg-white hover:bg-blue-400"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
