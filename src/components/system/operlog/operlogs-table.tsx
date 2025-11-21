'use client';

import * as React from 'react';
import { IconButton, TableContainer, Chip, Tooltip } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';

import { OperLogVO } from '@/api/monitor/operlog/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

const getLabel = (dictData: DictDataOption[], value: string | number) => {
  const item = dictData?.find((dict) => dict.value + '' === value + '');
  return item?.label || value;
};

interface Props {
  total?: number;
  page?: number;
  rows?: OperLogVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onView?: (row: OperLogVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_common_status: DictDataOption[];
    sys_oper_type: DictDataOption[];
  };
}

export function OperlogsTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onView,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  const { sys_common_status, sys_oper_type } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.operId + '');
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

  const getStatusChip = (value: string | number) => {
    const item = sys_common_status?.find((dict) => dict.value + '' === value + '');
    const color = item?.value === '0' ? 'success' : 'error';
    return <Chip label={item?.label || value} color={color as any} size="small" variant="outlined" />;
  };

  return (
    <Card>
      <TableContainer sx={{ overflowX: 'auto' }}>
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
              <TableCell>日志编号</TableCell>
              <TableCell>系统模块</TableCell>
              <TableCell>操作类型</TableCell>
              <TableCell>操作人员</TableCell>
              <TableCell>部门</TableCell>
              <TableCell>操作地址</TableCell>
              <TableCell>操作状态</TableCell>
              <TableCell>操作日期</TableCell>
              <TableCell>消耗时间</TableCell>
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
              const isItemSelected = isSelected(row.operId + '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.operId}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.operId + '')}
                    />
                  </TableCell>
                  <TableCell>{row.operId}</TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{getLabel(sys_oper_type, row.businessType)}</TableCell>
                  <TableCell>{row.operName}</TableCell>
                  <TableCell>{row.deptName}</TableCell>
                  <TableCell>{row.operIp}</TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell>{row.operTime ? dayjs(row.operTime).format('YYYY-MM-DD HH:mm') : ''}</TableCell>
                  <TableCell>{row.costTime}毫秒</TableCell>
                  <TableCell
                    sx={(theme) => ({
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 2,
                      boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                    })}
                  >
                    <Tooltip title="详情">
                      <IconButton size="small" onClick={() => onView?.(row)} sx={{ color: '#1976d2' }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
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
