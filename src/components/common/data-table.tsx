'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  Paper,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
// import { TableData } from '@/types';

// interface Column {
//   id: string;
//   label: string;
//   width?: number;
//   render?: (value: any, row: TableData) => React.ReactNode;
// }

// interface DataTableProps {
//   columns: Column[];
//   data: TableData[];
//   selectedRows: string[];
//   onSelectionChange: (selectedIds: string[]) => void;
//   onEdit?: (row: TableData) => void;
//   onDelete?: (row: TableData) => void;
//   page: number;
//   rowsPerPage: number;
//   totalCount: number;
//   onPageChange: (page: number) => void;
//   onRowsPerPageChange: (rowsPerPage: number) => void;
// }

// export default function DataTable({
//   columns,
//   data,
//   selectedRows,
//   onSelectionChange,
//   onEdit,
//   onDelete,
//   page,
//   rowsPerPage,
//   totalCount,
//   onPageChange,
//   onRowsPerPageChange,
// }: DataTableProps) {
//   const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
//     if (event.target.checked) {
//       const newSelected = data.map((row) => row.id);
//       onSelectionChange(newSelected);
//     } else {
//       onSelectionChange([]);
//     }
//   };

//   const handleSelectRow = (id: string) => {
//     const selectedIndex = selectedRows.indexOf(id);
//     let newSelected: string[] = [];

//     if (selectedIndex === -1) {
//       newSelected = newSelected.concat(selectedRows, id);
//     } else if (selectedIndex === 0) {
//       newSelected = newSelected.concat(selectedRows.slice(1));
//     } else if (selectedIndex === selectedRows.length - 1) {
//       newSelected = newSelected.concat(selectedRows.slice(0, -1));
//     } else if (selectedIndex > 0) {
//       newSelected = newSelected.concat(
//         selectedRows.slice(0, selectedIndex),
//         selectedRows.slice(selectedIndex + 1),
//       );
//     }

//     onSelectionChange(newSelected);
//   };

//   const isSelected = (id: string) => selectedRows.indexOf(id) !== -1;

//   const renderCell = (column: Column, row: TableData) => {
//     const value = row[column.id];

//     if (column.render) {
//       return column.render(value, row);
//     }

//     // 默认渲染
//     if (column.id === 'status') {
//       return (
//         <Chip
//           label={value}
//           size="small"
//           color={value === '正常' ? 'primary' : 'default'}
//           sx={{ backgroundColor: value === '正常' ? '#e3f2fd' : '#f5f5f5' }}
//         />
//       );
//     }

//     if (column.id === 'type') {
//       return (
//         <Chip
//           label={value}
//           size="small"
//           color={value === '公告' ? 'success' : 'warning'}
//           sx={{
//             backgroundColor: value === '公告' ? '#e8f5e8' : '#fff3e0',
//             color: value === '公告' ? '#2e7d32' : '#f57c00',
//           }}
//         />
//       );
//     }

//     return value;
//   };

//   return (
//     <Paper sx={{ width: '100%', overflow: 'hidden' }}>
//       <TableContainer>
//         <Table stickyHeader>
//           <TableHead>
//             <TableRow>
//               <TableCell padding="checkbox">
//                 <Checkbox
//                   color="primary"
//                   indeterminate={selectedRows.length > 0 && selectedRows.length < data.length}
//                   checked={data.length > 0 && selectedRows.length === data.length}
//                   onChange={handleSelectAll}
//                 />
//               </TableCell>
//               {columns.map((column) => (
//                 <TableCell
//                   key={column.id}
//                   style={{ width: column.width }}
//                   sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
//                 >
//                   {column.label}
//                 </TableCell>
//               ))}
//               {(onEdit || onDelete) && (
//                 <TableCell sx={{ width: 120, backgroundColor: '#fafafa' }}>
//                   操作
//                 </TableCell>
//               )}
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {data.map((row) => {
//               const isItemSelected = isSelected(row.id);

//               return (
//                 <TableRow
//                   hover
//                   role="checkbox"
//                   aria-checked={isItemSelected}
//                   tabIndex={-1}
//                   key={row.id}
//                   selected={isItemSelected}
//                 >
//                   <TableCell padding="checkbox">
//                     <Checkbox
//                       color="primary"
//                       checked={isItemSelected}
//                       onChange={() => handleSelectRow(row.id)}
//                     />
//                   </TableCell>
//                   {columns.map((column) => (
//                     <TableCell key={column.id}>
//                       {renderCell(column, row)}
//                     </TableCell>
//                   ))}
//                   {(onEdit || onDelete) && (
//                     <TableCell>
//                       <Box sx={{ display: 'flex', gap: 1 }}>
//                         {onEdit && (
//                           <IconButton
//                             size="small"
//                             onClick={() => onEdit(row)}
//                             sx={{ color: '#2e7d32' }}
//                           >
//                             <Edit fontSize="small" />
//                           </IconButton>
//                         )}
//                         {onDelete && (
//                           <IconButton
//                             size="small"
//                             onClick={() => onDelete(row)}
//                             sx={{ color: '#d32f2f' }}
//                           >
//                             <Delete fontSize="small" />
//                           </IconButton>
//                         )}
//                       </Box>
//                     </TableCell>
//                   )}
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//       </TableContainer>
//       <TablePagination
//         rowsPerPageOptions={[10, 25, 50]}
//         component="div"
//         count={totalCount}
//         rowsPerPage={rowsPerPage}
//         page={page}
//         onPageChange={(_, newPage) => onPageChange(newPage)}
//         onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
//         labelRowsPerPage="条/页"
//         labelDisplayedRows={({ from, to, count }) => `共${count}条`}
//       />
//     </Paper>
//   );
// }
