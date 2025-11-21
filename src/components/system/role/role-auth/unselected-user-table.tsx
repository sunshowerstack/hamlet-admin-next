'use client';

import React from 'react';

import {
  Card,
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import dayjs from 'dayjs';

import { UserVO } from '@/api/system/user/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

interface props {
  total: number;
  rows: UserVO[];
  page: number;
  rowsPerPage: number;
  selectedRows: string[];
  onSelectionChange: (ids: string[]) => void;
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
export function UnselectedUserTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  selectedRows = [],
  onSelectionChange,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: props): React.JSX.Element {
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
      <TableContainer>
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
