'use client';

import * as React from 'react';
import { DictDataOption } from '@/stores/dict-store';
import { IconButton, Switch, TableContainer } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { Delete, Edit } from '@mui/icons-material';

import type { ClientVO } from '@/api/system/client/types';
import { changeStatus } from '@/api/system/client';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

const handleStatusChange = async (row: ClientVO, checked: boolean) => {
  const newStatus = checked ? '0' : '1';
  await changeStatus(String(row.clientId), newStatus);
};

const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((d) => d.value === value);
  return item?.label || value;
};
interface Props {
  total?: number;
  page?: number;
  rows?: ClientVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onEdit?: (row: ClientVO) => void;
  onDelete?: (row: ClientVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
    sys_device_type: DictDataOption[];
  };
}

export function ClientsTable({
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
  const { sys_normal_disable, sys_device_type } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.id + '');
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
        <Table sx={{ minWidth: '1000px' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  // 半选状态
                  indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                  checked={rows.length > 0 && selectedRows.length === rows.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>id</TableCell>
              <TableCell>客户端id</TableCell>
              <TableCell>客户端key</TableCell>
              <TableCell>客户端秘钥</TableCell>
              <TableCell>授权类型</TableCell>
              <TableCell>设备类型</TableCell>
              <TableCell>Token活跃超时时间</TableCell>
              <TableCell>Token固定超时时间</TableCell>
              <TableCell>状态</TableCell>
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
              const selected = isSelected(row.id + '');
              return (
                <TableRow key={String(row.id)} hover role="checkbox" selected={selected}>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={selected} onChange={() => handleSelectRow(row.id + '')} />
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.clientId}</TableCell>
                  <TableCell>{row.clientKey}</TableCell>
                  <TableCell>{row.clientSecret}</TableCell>
                  <TableCell>{(row.grantTypeList || []).join('、')}</TableCell>
                  <TableCell>{getLabel(sys_device_type, row.deviceType)}</TableCell>
                  <TableCell>{row.activeTimeout}</TableCell>
                  <TableCell>{row.timeout}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.status === '0'}
                      onChange={(e) => handleStatusChange(row, e.target.checked)}
                      size="small"
                    />
                  </TableCell>
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
