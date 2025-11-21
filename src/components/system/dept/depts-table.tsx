'use client';

import * as React from 'react';
import { IconButton, TableContainer } from '@mui/material';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Delete, Edit } from '@mui/icons-material';
import dayjs from 'dayjs';

import { DeptVO } from '@/api/system/dept/types';
import { DictDataOption } from '@/stores/dict-store';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

interface Props {
  total?: number;
  page?: number;
  rows?: DeptVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onEdit?: (row: DeptVO) => void;
  onDelete?: (row: DeptVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}

const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return item?.label || value;
};

export function DeptsTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  const { sys_normal_disable } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.deptId + '');
      onSelectionChange(newSelected);
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectRow = (id: string) => {
    // 追加选中的数据的id
    const newSelected = fillArray(selectedRows, id);
    onSelectionChange(newSelected);
  };

  const isSelected = (id: string) => selectedRows.includes(id);

  return (
    <Card>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '900px' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                  checked={rows.length > 0 && selectedRows.length === rows.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>部门名称</TableCell>
              <TableCell>类别编码</TableCell>
              <TableCell>排序</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建时间</TableCell>
              <TableCell
                sx={{
                  width: 120,
                  position: 'sticky',
                  right: 0,
                  backgroundColor: '#fafafa',
                  zIndex: 3,
                  boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                }}
              >
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const id = row.deptId + '';
              const isItemSelected = isSelected(id);
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={id}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={isItemSelected} onChange={() => handleSelectRow(id)} />
                  </TableCell>
                  <TableCell>{row.deptName}</TableCell>
                  <TableCell>{row.deptCategory}</TableCell>
                  <TableCell>{row.orderNum}</TableCell>
                  <TableCell>{getLabel(sys_normal_disable, row.status)}</TableCell>
                  <TableCell>{row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm') : ''}</TableCell>
                  <TableCell
                    sx={(theme) => ({
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 2,
                      boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                    })}
                  >
                    <IconButton size="small" onClick={() => onEdit?.(row)} sx={{ color: '#1976d2' }}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDelete?.(row)} sx={{ color: '#1976d2' }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={DEFAULT_ROWS_PER_PAGE_OPTIONS}
        component="div"
        count={total}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(event) => onRowsPerPageChange(Number.parseInt(event.target.value, 10))}
        labelRowsPerPage=""
        labelDisplayedRows={({ count }) => `共${count}条`}
      />
    </Card>
  );
}
