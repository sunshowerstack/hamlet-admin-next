'use client';

import * as React from 'react';
import { DictDataOption } from '@/stores/dict-store';
import { Delete, Edit } from '@mui/icons-material';
import { IconButton, TableContainer } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import dayjs from 'dayjs';

import { NoticeVO } from '@/api/system/notice/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

export interface Notice {
  noticeId: string; // TODO:
  // 公告标题
  noticeTitle: string;
  // 公告内容
  noticeContent: string;
  // 公告类型
  noticeType: string;
  // 状态
  status: string;
  // 创建者
  createBy: number;
  // 创建者名称
  createByName: string;
  createTime: string;
}

interface Props {
  total?: number;
  page?: number;
  rows?: NoticeVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onEdit?: (row: NoticeVO) => void;
  onDelete?: (row: NoticeVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_notice_status: DictDataOption[];
    sys_notice_type: DictDataOption[];
  };
}

// 根据值获取标签
const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return item?.label || value;
};

export function NoticesTable({
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
  console.log('[NoticesTable] start...');
  // 从props中获取字典数据
  const { sys_notice_status, sys_notice_type } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.noticeId + '');
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
        <Table sx={{ minWidth: '800px' }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              {/* indeterminate ： 控制复选框是否显示为 "不确定"状态。这是一个视觉上独特的状态，既不是勾选也不是未勾选，通常显示为一条短横线 - */}
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                  checked={rows.length > 0 && selectedRows.length === rows.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>公告标题</TableCell>
              <TableCell>公告类型</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>创建者</TableCell>
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
              // const isSelected = selected?.has(row.noticeId);
              const isItemSelected = isSelected(row.noticeId + '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.noticeId}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.noticeId + '')}
                    />
                  </TableCell>
                  <TableCell>{row.noticeTitle}</TableCell>
                  <TableCell>
                    {getLabel(sys_notice_type, row.noticeType)}
                    {/* <DictTag options={sys_notice_type} value={row.noticeType} /> */}
                  </TableCell>
                  <TableCell>{getLabel(sys_notice_status, row.status)}</TableCell>
                  <TableCell>{row.createByName}</TableCell>
                  <TableCell>{dayjs(row.createTime).format('YYYY-MM-DD HH:mm')}</TableCell>
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
