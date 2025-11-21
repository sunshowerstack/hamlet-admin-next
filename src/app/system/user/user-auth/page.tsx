'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';

import { useSearchParams } from 'next/navigation';

import { getAuthRole, updateAuthRole } from '@/api/system/user';
import { UserAuthTable } from '@/components/system/user/user-auth/user-auth-table';
import { RoleVO } from '@/api/system/role/types';
import { Button, Paper, TextField, Typography } from '@mui/material';
import { Box, Grid } from '@mui/system';
import { UserVO } from '@/api/system/user/types';
import { useTabsStore } from '@/stores/tabs-store';
import { showToast } from '@/utils/toast';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

export default function Page(): React.JSX.Element {
  // 使用选择器只获取 closeTab 函数，避免订阅整个 store 的变化
  // 这样当 activeKey 变化时，UsersTable 不会重新渲染
  const closeTab = useTabsStore((state) => state.closeTab);

  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表数据
  const [rows, setRows] = useState<RoleVO[]>([]);
  const [user, setUser] = useState<UserVO>();
  const [total, setTotal] = useState(0);

  // 选中、多选
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 当前路由参数,直接获取，不从zustand，useTabsStore()里获取
  const pathParams = useSearchParams();
  // 可能pathParams.get('xxx')可能产生null,用" || '' "规避
  const userId = pathParams.get('userId') || '';
  console.log('[user-auth] userId:', userId);

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    userId: userId,
  });

  const getPageList = useCallback(async () => {
    // 不要直接用pathParams里的值，tab切换到其他路由，userId变null，导致getPageList执行后渲染报错。不是激活的tab
    const res = await getAuthRole(searchParams.userId);
    console.log('[user-auth] res====', res);
    // TODO: 这个data
    // 角色列表字段
    const rows = res.data?.roles;
    setRows(rows);
    setTotal(res.data?.roles?.length);

    // 用户信息字段
    setUser(res.data?.user);
  }, [searchParams]); // 后端bug：实际接口不支持分页，页面是设计的可以分页

  useEffect(() => {
    getPageList();
  }, [getPageList]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 页号切换，已选项清除
    setSelectedRows([]);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  /** 关闭按钮 */
  const close = () => {
    closeTab('/system/user/user-auth');
  };

  /** 提交按钮 */
  const submitForm = async () => {
    const userId = user?.userId + '';
    const rIds = selectedRows.join(',');
    await updateAuthRole({ userId: userId, roleIds: rIds });
    showToast('授权成功', ToastLevelEnum.SUCCESS);
    close();
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ borderBottom: '1px solid #e5e7ed', paddingBottom: 1, mb: 2 }}>
          基本信息
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user?.nickName}>
            <TextField fullWidth size="small" label="用户昵称" value={user?.nickName} disabled />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={user?.userName}>
            <TextField fullWidth size="small" label="登录账号" value={user?.userName} disabled />
          </Grid>
        </Grid>
      </Paper>

      {/* 表格 */}
      <UserAuthTable
        rows={rows}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="outlined" onClick={close}>
            取消
          </Button>
          <Button variant="contained" onClick={submitForm}>
            确定
          </Button>
        </Box>
      </Paper>
    </Stack>
  );
}
