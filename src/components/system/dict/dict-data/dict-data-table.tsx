'use client';

import React from 'react';

import {
  Box,
  Card,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import dayjs from 'dayjs';

import { DictDataVO } from '@/api/system/dict/data/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

interface Props {
  total: number;
  rows: DictDataVO[];
  page: number;
  rowsPerPage: number;
  selectedRows: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (row: DictDataVO) => void;
  onDelete?: (row: DictDataVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DictDataTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  selectedRows = [],
  onSelectionChange,
  onEdit,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: Props): React.JSX.Element {
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => String(row.dictCode));
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
        <Table size="small">
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
              <TableCell>字典标签</TableCell>
              <TableCell>字典键值</TableCell>
              <TableCell>字典排序</TableCell>
              <TableCell>备注</TableCell>
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
              const id = row.dictCode + '';
              const isItemSelected = isSelected(id);
              return (
                <TableRow hover key={id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={isItemSelected} onChange={() => handleSelectRow(id)} />
                  </TableCell>
                  <TableCell>{row.dictLabel}</TableCell>
                  <TableCell>{row.dictValue}</TableCell>
                  <TableCell>{row.dictSort}</TableCell>
                  <TableCell>{row.remark}</TableCell>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => onEdit?.(row)} sx={{ color: '#1976d2' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete?.(row)} sx={{ color: '#1976d2' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        labelDisplayedRows={({ count }) => `共${count}条`}
        labelRowsPerPage=""
        rowsPerPageOptions={DEFAULT_ROWS_PER_PAGE_OPTIONS}
      />
    </Card>
  );
}
