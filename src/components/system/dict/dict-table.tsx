'use client';

import React from 'react';
import RouterLink from 'next/link';

import {
  Box,
  Card,
  Checkbox,
  IconButton,
  Link,
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

import { DictTypeVO } from '@/api/system/dict/type/types';
import { useTabsStore } from '@/stores/tabs-store';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

interface Props {
  total: number;
  rows: DictTypeVO[];
  page: number;
  rowsPerPage: number;
  selectedRows: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit?: (row: DictTypeVO) => void;
  onDelete?: (row: DictTypeVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DictTable({
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
      const newSelected = rows.map((row) => String(row.dictId));
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

  // 使用选择器只获取 closeTab 函数，避免订阅整个 store 的变化
  // 这样当 activeKey 变化时，UsersTable 不会重新渲染
  const closeTab = useTabsStore((state) => state.closeTab);

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
              <TableCell>字典名称</TableCell>
              <TableCell>字典类型</TableCell>
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
              const id = row.dictId + '';
              const isItemSelected = isSelected(id);
              return (
                <TableRow hover key={id} selected={isItemSelected}>
                  <TableCell padding="checkbox">
                    <Checkbox color="primary" checked={isItemSelected} onChange={() => handleSelectRow(id)} />
                  </TableCell>
                  <TableCell>{row.dictName}</TableCell>
                  <TableCell>
                    <Link
                      component={RouterLink}
                      href={'/system/dict/dict-data?dictType=' + row.dictType}
                      variant="subtitle2"
                      underline="none"
                      onClick={(e) => {
                        // 1. 执行跳转前的处理逻辑
                        console.log('准备跳转到:', row.dictType);
                        // 关闭已经打开的tab,避免tab内容为旧的
                        closeTab('/system/dict/dict-data');
                      }}
                    >
                      {row.dictType}
                    </Link>
                  </TableCell>
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
