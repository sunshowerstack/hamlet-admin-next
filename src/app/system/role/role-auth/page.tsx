'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';

import { showToast } from '@/utils/toast';

import { useSearchParams } from 'next/navigation';
import { allocatedUserList, authUserCancel } from '@/api/system/role';
import { UserVO } from '@/api/system/user/types';
import { RoleAuthTable } from '@/components/system/role/role-auth/role-auth-table';
import RoleAuthModal from '@/components/system/role/role-auth/role-auth-modal';
import { useDict } from '@/hooks/use-dict';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表数据
  const [rows, setRows] = useState<UserVO[]>([]);
  const [total, setTotal] = useState(0);

  // 选中、多选
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 弹窗
  const [modalOpen, setModalOpen] = useState(false);

  // 当前路由参数,直接获取，不从zustand，useTabsStore()里获取
  const pathParams = useSearchParams();
  // 可能pathParams.get('xxx')可能产生null,用" || '' "规避
  const roleId = pathParams.get('roleId') || '';
  console.log('roleId:', roleId);

  // 搜索条件里的下拉框内容
  const { sys_normal_disable } = useDict('sys_normal_disable');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_normal_disable,
  };

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    roleId: roleId,
    userName: '',
    phonenumber: '',
  });

  const searchFields = [
    { type: 'text' as const, name: 'userName', label: '用户名称', placeholder: '请输入' },
    { type: 'text' as const, name: 'phonenumber', label: '手机号码', placeholder: '请输入' },
  ];

  const confirm = useConfirm();

  const getPageList = useCallback(async () => {
    console.log('searchParams:', searchParams);
    const res = await allocatedUserList({
      roleId: searchParams.roleId,
      userName: searchParams.userName,
      phonenumber: searchParams.phonenumber,
      pageNum: page + 1,
      pageSize: rowsPerPage,
    } as any);
    console.log('res====', res);
    const rows = res.rows;
    setRows(rows);
    setTotal(res.total);
  }, [page, rowsPerPage, searchParams]);

  useEffect(() => {
    getPageList();
  }, [getPageList]);

  const handleSearch = (form: Record<string, string>) => {
    setSearchParams({
      ...searchParams,
      userName: form.userName || '',
      phonenumber: form.phonenumber || '',
    });
    setPage(0);
  };

  const handleReset = (form: Record<string, string>) => {
    console.log('[handleReset] form:', form);
    setSearchParams({
      ...searchParams,
      userName: form.userName || '',
      phonenumber: '',
    });
    setPage(0);
  };

  const handleAdd = () => {
    setModalOpen(true);
  };

  // 取消用户授权
  const handleCancel = async (row: UserVO) => {
    const { confirmed, reason } = await confirm({
      title: '取消授权',
      description: `确定要取消该用户"${row.userName}"角色吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[role-auth] handleCancel cancelled', reason);
      return;
    }

    await authUserCancel({ userId: row.userId, roleId: roleId });
    await getPageList();
    showToast('取消授权成功', ToastLevelEnum.SUCCESS);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 页号切换，已选项清除
    setSelectedRows([]);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Stack spacing={3}>
      {/* 查询 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      {/* 操作区 */}
      <ActionButtons onAdd={handleAdd} selectedCount={selectedRows.length} />

      {/* 表格 */}
      <RoleAuthTable
        rows={rows}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onPageChange={handlePageChange}
        onDelete={handleCancel}
        onRowsPerPageChange={handleRowsPerPageChange}
        dictData={dictData}
      />

      {/* 弹窗 - 分配用户 */}
      <RoleAuthModal
        selectedRole={roleId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        title={'选择用户'}
        dictData={dictData}
      />

      {/* 弹窗 - 分配数据权限*/}
      <RoleAuthModal
        selectedRole={roleId}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        title={'选择用户'}
        dictData={dictData}
      />
    </Stack>
  );
}
