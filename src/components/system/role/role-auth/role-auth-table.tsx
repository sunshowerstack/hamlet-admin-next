'use client';

import React from 'react';

import {
  Box,
  Card,
  Checkbox,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import dayjs from 'dayjs';

import { UserVO } from '@/api/system/user/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

interface Props {
  total: number;
  rows: UserVO[];
  page: number;
  rowsPerPage: number;
  selectedRows: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete?: (row: UserVO) => void; // 这里的delete实际是：取消授权
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}
// 根据值获取标签
const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return <Chip label={item?.label || value} color="success" size="small" variant="outlined" />;
};

export function RoleAuthTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  selectedRows = [],
  onSelectionChange,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  // 从props中获取字典数据
  const { sys_normal_disable } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => String(row.userId));
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
              <TableCell>用户名称</TableCell>
              <TableCell>用户昵称</TableCell>
              <TableCell>邮箱</TableCell>
              <TableCell>手机</TableCell>
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
              const id = row.userId + '';
              const isItemSelected = isSelected(id);
              return (
                <TableRow hover key={id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={isItemSelected} onChange={() => handleSelectRow(id)} />
                  </TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.nickName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.phonenumber}</TableCell>
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
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => onDelete?.(row)} sx={{}}>
                        <Cancel fontSize="small" />
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
