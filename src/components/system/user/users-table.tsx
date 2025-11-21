'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { DictDataOption } from '@/stores/dict-store';
import { Delete, Edit, Key, TaskAlt } from '@mui/icons-material';
import { IconButton, TableContainer, Link } from '@mui/material';
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

import { UserVO } from '@/api/system/user/types';

import { useTabsStore } from '@/stores/tabs-store';
import { fillArray } from '@/utils/common';
import { DEFAULT_ROWS_PER_PAGE_OPTIONS } from '@/constants/pagination';

export interface User {
  userId: string;
  deptId: string;
  // 用户名称
  userName: string;
  // 用户昵称
  nickName: string;
  // 密码
  password: string;
  // 部门名称
  deptName: string;
  // 手机号码
  phonenumber: string;
  // 邮箱
  email: string;
  // 性别
  sex: string;
  // 岗位ID
  postIds: string;
  // 角色ID
  roleIds: number;
  // 状态
  status: string;
  // 创建时间
  createTime: string;
  // 备注
  remark: string;
}

interface Props {
  total?: number;
  page?: number;
  rows?: UserVO[];
  rowsPerPage?: number;
  onSelectionChange: (selectedIds: string[]) => void;
  selectedRows: string[];
  onEdit?: (row: UserVO) => void;
  onDelete?: (row: UserVO) => void;
  onResetPassword?: (row: UserVO) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  dictData: {
    sys_normal_disable: DictDataOption[];
    sys_user_sex: DictDataOption[];
  };
}

// 根据值获取标签
const getLabel = (dictData: DictDataOption[], value: string) => {
  const item = dictData?.find((dict) => dict.value === value);
  return item?.label || value;
};

export function UsersTable({
  total = 0,
  rows = [],
  page = 0,
  rowsPerPage = 0,
  onSelectionChange,
  selectedRows = [],
  onEdit,
  onDelete,
  onResetPassword,
  onPageChange,
  onRowsPerPageChange,
  dictData,
}: Props): React.JSX.Element {
  console.log('[UsersTable] start...');
  // 使用选择器只获取 closeTab 函数，避免订阅整个 store 的变化
  // 这样当 activeKey 变化时，UsersTable 不会重新渲染
  const closeTab = useTabsStore((state) => state.closeTab);

  // 从props中获取字典数据
  const { sys_normal_disable } = dictData;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((row) => row.userId + '');
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
        <Table sx={{ minWidth: 920 }} size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#fafafa' }}>
              {/* indeterminate ： 控制复选框是否显示为 “不确定”状态。这是一个视觉上独特的状态，既不是勾选也不是未勾选，通常显示为一条短横线 - */}
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
              <TableCell>部门</TableCell>
              <TableCell>手机号码</TableCell>
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
              const isItemSelected = isSelected(row.userId + '');
              return (
                <TableRow
                  hover
                  role="checkbox"
                  aria-checked={isItemSelected}
                  tabIndex={-1}
                  key={row.userId}
                  selected={isItemSelected}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                      onChange={() => handleSelectRow(row.userId + '')}
                    />
                  </TableCell>
                  <TableCell>{row.userName}</TableCell>
                  <TableCell>{row.nickName}</TableCell>
                  <TableCell>{row.deptName}</TableCell>
                  <TableCell>{row.phonenumber}</TableCell>
                  <TableCell>{getLabel(sys_normal_disable, row.status)}</TableCell>
                  <TableCell>{dayjs(row.createTime).format('YYYY-MM-DD')}</TableCell>
                  <TableCell
                    sx={(theme) => ({
                      position: 'sticky',
                      right: 0,
                      backgroundColor: theme.palette.background.paper,
                      zIndex: 2,
                      boxShadow: '-2px 0 4px rgba(0,0,0,0.1)',
                      // 固定列保持白色背景，hover 时使用浅灰色
                      // '&:hover': {
                      //   backgroundColor: theme.palette.action.hover,
                      // },
                    })}
                  >
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" onClick={() => onEdit?.(row)} sx={{ color: '#1976d2' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onDelete?.(row)} sx={{ color: '#1976d2' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => onResetPassword?.(row)} sx={{ color: '#1976d2' }}>
                        <Key fontSize="small" />
                      </IconButton>
                      <Link
                        component={RouterLink}
                        href={'/system/user/user-auth?userId=' + row.userId}
                        variant="subtitle2"
                        underline="none"
                        onClick={(e) => {
                          // 1. 执行跳转前的处理逻辑
                          // 关闭已经打开的tab,避免tab内容为旧的
                          closeTab('/system/user/user-auth');
                        }}
                      >
                        <IconButton size="small" sx={{ color: '#1976d2' }}>
                          <TaskAlt fontSize="small" />
                        </IconButton>
                      </Link>
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
        labelRowsPerPage="" // 属性不能删掉，否则出现默认的文案：'Rows per page:'
        labelDisplayedRows={({ count }) => `共${count}条`}
      />
    </Card>
  );
}
