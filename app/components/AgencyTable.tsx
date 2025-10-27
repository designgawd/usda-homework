"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  TextField,
  TableSortLabel,
} from "@mui/material";

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

type Order = "asc" | "desc";

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
  if (orderBy === "cfr_references") {
    return order === "desc"
      ? (a, b) => {
          const aRefs = (a[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(", ");
          const bRefs = (b[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(", ");
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
            .join(", ");
          const bRefs = (b[orderBy] as CfrReference[])
            .map((ref) => `${ref.title}-${ref.chapter}`)
            .join(", ");
          if (aRefs < bRefs) {
            return -1;
          }
          if (aRefs > bRefs) {
            return 1;
          }
          return 0;
        };
  }
  return order === "desc"
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
  const [searchTerm, setSearchTerm] = React.useState("");
  const [order, setOrder] = React.useState<Order>("asc");
  const [orderBy, setOrderBy] = React.useState<SortableAgencyKeys>("name");

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: SortableAgencyKeys
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
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
      .join(", ");
    return (
      (agency.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (agency.short_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (cfrReferences?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  const sortedAgencies = stableSort(
    filteredAgencies,
    getComparator(order, orderBy)
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Agencies
      </Typography>
      <TextField
        label="Search"
        variant="outlined"
        fullWidth
        placeholder="Type agency name or acronym to filter agency list"
        margin="normal"
        onChange={handleSearchChange}
      />
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <TableHead>
              <TableRow>
                <TableCell
                  sortDirection={orderBy === "name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "name"}
                    direction={orderBy === "name" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "name")}
                  >
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={orderBy === "short_name" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "short_name"}
                    direction={orderBy === "short_name" ? order : "asc"}
                    onClick={(event) => handleRequestSort(event, "short_name")}
                  >
                    Short Name
                  </TableSortLabel>
                </TableCell>
                <TableCell
                  sortDirection={orderBy === "cfr_references" ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === "cfr_references"}
                    direction={orderBy === "cfr_references" ? order : "asc"}
                    onClick={(event) =>
                      handleRequestSort(event, "cfr_references")
                    }
                  >
                    CFR References
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAgencies
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((agency) => (
                  <TableRow hover key={agency.id}>
                    <TableCell component="th" scope="row">
                      {agency.name}
                    </TableCell>
                    <TableCell>{agency.short_name}</TableCell>
                    <TableCell>
                      {agency.cfr_references
                        .map((ref) => `Title ${ref.title}, Chapter ${ref.chapter}`)
                        .join(", ")}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={sortedAgencies.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}