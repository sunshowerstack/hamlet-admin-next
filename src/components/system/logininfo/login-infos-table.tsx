'use client';

import * as React from 'react';
import { TableContainer, Chip } from '@mui/material';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';

import { LoginInfoVO } from '@/api/monitor/loginInfo/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

// 根据值获取标签
const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return item?.label || value;
};

interface Props {
  total?: number;
  page?: number;
  rows?: LoginInfoVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onDelete?: (row: LoginInfoVO) => void;
  onUnlock?: (row: LoginInfoVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_common_status: DictDataOption[];
    sys_device_type: DictDataOption[];
  };
}

export function LoginInfosTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onDelete,
  onUnlock,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  // 从props中获取字典数据
  const { sys_common_status, sys_device_type } = dictData;
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.infoId + '');
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

  // 根据值获取标签
  const getChip = (dictData: DictDataOption[], value: string) => {
    const item = dictData?.find((dict) => dict.value === value);
    const color = item?.value === '0' ? 'success' : 'error';
    return <Chip label={item?.label || value} color={color as any} size="small" variant="outlined" />;
  };

  return (
    <Card>
      <TableContainer>
        <Table sx={{ minWidth: '1000px' }} size="small">
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
              <TableCell>访问编号</TableCell>
              <TableCell>用户名</TableCell>
              <TableCell>客户端</TableCell>
              <TableCell>设备类型</TableCell>
              <TableCell>地址</TableCell>
              <TableCell>登录地点</TableCell>
              <TableCell>操作系统</TableCell>
              <TableCell>浏览器</TableCell>
              <TableCell>登录状态</TableCell>
              <TableCell>描述</TableCell>
              <TableCell>访问时间</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const isItemSelected = isSelected(row.infoId + '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.infoId}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.infoId + '')}
                    />
                  </TableCell>
                  <TableCell>{row.infoId}</TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.clientKey}</TableCell>
                  <TableCell>{getLabel(sys_device_type, row.deviceType)}</TableCell>
                  <TableCell>{row.ipaddr}</TableCell>
                  <TableCell>{row.loginLocation}</TableCell>
                  <TableCell>{row.os}</TableCell>
                  <TableCell>{row.browser}</TableCell>
                  <TableCell>{getChip(sys_common_status, row.status)}</TableCell>
                  <TableCell>{row.msg}</TableCell>
                  <TableCell>{row.loginTime ? dayjs(row.loginTime).format('YYYY-MM-DD HH:mm') : ''}</TableCell>
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
