'use client';

import * as React from 'react';
import { IconButton, TableContainer, Tooltip } from '@mui/material';
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
import { Delete, Download } from '@mui/icons-material';

import { OssVO } from '@/api/system/oss/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';
import Image from 'next/image';

interface Props {
  total?: number;
  page?: number;
  rows?: OssVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: Array<string>) => void;
  selectedRows: Array<string>;
  onPreview?: (row: OssVO) => void;
  onDownload?: (row: OssVO) => void;
  onDelete?: (row: OssVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}
function checkFileSuffix(fileSuffix: string | string[]) {
  const arr = new Set(['.png', '.jpg', '.jpeg']);
  const suffixArray = Array.isArray(fileSuffix) ? fileSuffix : [fileSuffix];
  return suffixArray.some((suffix) => arr.has(suffix.toLowerCase()));
}

export function OssTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onPreview,
  onDownload,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: Props): React.JSX.Element {
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.ossId + '');
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
        <Table sx={{ minWidth: '800px', tableLayout: 'fixed' }} size="small">
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
              <TableCell sx={{ width: 160 }}>文件名</TableCell>
              <TableCell sx={{ width: 160 }}>原名</TableCell>
              <TableCell>后缀</TableCell>
              <TableCell sx={{ maxWidth: 120 }}>文件展示</TableCell>
              <TableCell sx={{ width: 180 }}>创建时间</TableCell>
              <TableCell>上传人</TableCell>
              <TableCell>服务商</TableCell>
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
              const isItemSelected = isSelected(row.ossId + '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={String(row.ossId)}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.ossId + '')}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      // width: 160,
                      // overflowWrap: 'breakWord', // 注意:v值错误，非驼峰
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {row.fileName}
                  </TableCell>
                  <TableCell
                    sx={{
                      // width: 140,
                      overflowWrap: 'break-word',
                      whiteSpace: 'normal',
                    }}
                  >
                    {row.originalName}
                  </TableCell>
                  <TableCell>{row.fileSuffix}</TableCell>
                  {checkFileSuffix(row.fileSuffix) ? (
                    // 图片缩略图
                    <TableCell>
                      <Image
                        src={row.url}
                        alt={row.originalName}
                        width={100}
                        height={100}
                        style={{ objectFit: 'cover', borderRadius: 4 }}
                        unoptimized // 关键：禁用优化，直接加载原始图片
                      />
                    </TableCell>
                  ) : (
                    <TableCell>
                      <Tooltip title={row.url}>
                        <Box
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.url}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  )}
                  <TableCell>{row.createTime ? dayjs(row.createTime).format('YYYY-MM-DD HH:mm') : '-'}</TableCell>
                  <TableCell>{row.createByName}</TableCell>
                  <TableCell>{row.service}</TableCell>
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
                      <IconButton size="small" onClick={() => onDownload?.(row)} sx={{ color: '#1976d2' }} title="下载">
                        <Download fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete?.(row)} sx={{ color: '#1976d2' }} title="删除">
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
