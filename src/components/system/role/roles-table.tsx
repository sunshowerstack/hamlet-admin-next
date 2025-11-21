'use client';

import * as React from 'react';
import { DictDataOption } from '@/stores/dict-store';
import { Delete, Edit, CheckCircleOutline, PersonAdd } from '@mui/icons-material';
import { Chip, IconButton, Link, Switch, TableContainer } from '@mui/material';
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

import { RoleVO } from '@/api/system/role/types';
import { changeRoleStatus } from '@/api/system/role';
import RouterLink from 'next/link';
import { useTabsStore } from '@/stores/tabs-store';
import { showToast } from '@/utils/toast';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

export interface Role {
  roleId: string | number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  createTime: string;
  remark?: string;
}

interface Props {
  total?: number;
  page?: number;
  rows?: RoleVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onEdit?: (row: RoleVO) => void;
  onDelete?: (row: RoleVO) => void;
  onDataScope?: (row: RoleVO) => void; // 分配数据权限
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}

// 根据值获取标签
const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return <Chip label={item?.label || value} color="success" size="small" variant="outlined" />;
};

export function RolesTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onEdit,
  onDelete,
  onDataScope,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  console.log('[RolesTable] start...');
  // const { closeTab } = useTabsStore();
  // 使用选择器只获取 closeTab 函数，避免订阅整个 store 的变化
  // 这样当 activeKey 变化时，UsersTable 不会重新渲染
  const closeTab = useTabsStore((state) => state.closeTab);

  // 从props中获取字典数据
  const { sys_normal_disable } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.roleId + '');
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

  // 处理状态切换
  const handleStatusChange = async (row: RoleVO, checked: boolean) => {
    const newStatus = checked ? '0' : '1'; // 0-正常 1-停用
    try {
      await changeRoleStatus(row.roleId, newStatus);
      // 这里可以触发列表刷新，或者直接更新本地状态
      showToast('状态修改成功', ToastLevelEnum.SUCCESS);
    } catch (error) {
      console.error('状态修改失败:', error);
      showToast('状态修改失败', ToastLevelEnum.ERROR);
    }
  };

  return (
    <Card>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: '800px' }} size="small">
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
              <TableCell>角色名称</TableCell>
              <TableCell>权限字符</TableCell>
              <TableCell>显示顺序</TableCell>
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
              const isItemSelected = isSelected(row.roleId + '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.roleId}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.roleId + '')}
                    />
                  </TableCell>
                  <TableCell>{row.roleName}</TableCell>
                  <TableCell>{row.roleKey}</TableCell>
                  <TableCell>{row.roleSort}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.status === '0'}
                      onChange={(event) => handleStatusChange(row, event.target.checked)}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
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
                    {/* 【超级管理员】角色不允许操作 */}
                    {row.roleId === 1 ? null : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => onEdit?.(row)} sx={{ color: '#1976d2' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDelete?.(row)} sx={{ color: '#1976d2' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDataScope?.(row)} sx={{ color: '#1976d2' }}>
                          <CheckCircleOutline fontSize="small" />
                        </IconButton>
                        <Link
                          component={RouterLink}
                          href={'/system/role/role-auth?roleId=' + row.roleId}
                          variant="subtitle2"
                          underline="none"
                          onClick={(e) => {
                            // 1. 执行跳转前的处理逻辑
                            // 关闭已经打开的tab,避免tab内容为旧的
                            closeTab('/system/role/role-auth');
                          }}
                        >
                          <IconButton size="small" sx={{ color: '#1976d2' }}>
                            <PersonAdd fontSize="small" />
                          </IconButton>
                        </Link>
                      </Box>
                    )}
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
