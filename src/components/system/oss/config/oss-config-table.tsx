'use client';

import * as React from 'react';
import { DictDataOption } from '@/stores/dict-store';
import { Delete, Edit } from '@mui/icons-material';
import { IconButton, Switch, TableContainer, Chip } from '@mui/material';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { OssConfigVO } from '@/api/system/ossConfig/types';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

interface Props {
  total?: number;
  page?: number;
  rows?: OssConfigVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onEdit?: (row: OssConfigVO) => void;
  onDelete?: (row: OssConfigVO) => void;
  onStatusChange?: (row: OssConfigVO, checked: boolean) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}

// 根据值获取标签
const getChip = (value: string) => {
  let label = '';
  let color = '';
  if (value === '0') {
    label = 'private';
    color = 'warning';
  } else if (value === '1') {
    label = 'public';
    color = 'success';
  } else if (value === '2') {
    label = 'custom';
    color = 'info';
  }

  return <Chip label={label} color={color as any} size="small" variant="outlined" />;
};

// 桶权限类型显示
const getAccessPolicyLabel = (value: string) => {
  const policyMap: Record<string, { label: string; color: 'success' | 'warning' | 'default' }> = {
    public: { label: 'public', color: 'success' },
    private: { label: 'private', color: 'warning' },
    custom: { label: 'custom', color: 'default' },
  };
  return policyMap[value] || { label: value, color: 'default' };
};

export function OssConfigTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onEdit,
  onDelete,
  onStatusChange,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  console.log('[OssConfigTable] start...');
  // 从props中获取字典数据
  const { sys_normal_disable } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.ossConfigId + '');
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
        <Table sx={{ minWidth: '1200px' }} size="small">
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
              <TableCell>主建</TableCell>
              <TableCell>访问站点</TableCell>
              <TableCell>自定义域名</TableCell>
              <TableCell>桶名称</TableCell>
              <TableCell>前缀</TableCell>
              <TableCell>域</TableCell>
              <TableCell>桶权限类型</TableCell>
              <TableCell>是否默认</TableCell>
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
              // const isSelected = selected?.has(row.ossConfigId);
              const isItemSelected = isSelected(row.ossConfigId + '');
              const accessPolicy = getAccessPolicyLabel(row.accessPolicy || '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.ossConfigId}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.ossConfigId + '')}
                    />
                  </TableCell>
                  <TableCell>{row.ossConfigId}</TableCell>
                  <TableCell>{row.endpoint}</TableCell>
                  <TableCell>{row.domain}</TableCell>
                  <TableCell>{row.bucketName}</TableCell>
                  <TableCell>{row.prefix}</TableCell>
                  <TableCell>{row.region}</TableCell>
                  <TableCell>{getChip(row.accessPolicy)}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.status === '0'}
                      onChange={(e) => onStatusChange?.(row, e.target.checked)}
                      size="small"
                      color="primary"
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
