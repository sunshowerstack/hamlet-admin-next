'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { Close } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';

import { authUserSelectAll, unallocatedUserList } from '@/api/system/role';

import { UserVO } from '@/api/system/user/types';
import { UnselectedUserTable } from './unselected-user-table';
import SearchForm from '@/components/common/search-form';
import { showToast } from '@/utils/toast';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

interface Props {
  selectedRole: string;
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  title: string;
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}

export default function RoleAuthModal({ selectedRole, open, onClose, refreshList, title, dictData }: Props) {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表数据
  const [rows, setRows] = useState<UserVO[]>([]);
  const [total, setTotal] = useState(0);

  // 选中、多选
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    roleId: selectedRole,
    userName: '',
    phonenumber: '',
  });

  const searchFields = [
    { type: 'text' as const, name: 'userName', label: '用户名称', placeholder: '请输入' },
    { type: 'text' as const, name: 'phonenumber', label: '手机号码', placeholder: '请输入' },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 页号切换，已选项清除
    setSelectedRows([]);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(Number.parseInt(event.target.value, 10));
    setPage(0);
  };

  const getPageList = useCallback(async () => {
    console.log('searchParams:', searchParams);
    const res = await unallocatedUserList({
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

  useEffect(() => {
    getPageList();
  }, [getPageList]);

  /**选择授权用户操作 */
  const handleSelectUser = async () => {
    const roleId = searchParams.roleId;
    const ids = selectedRows.join(',');
    if (ids == '') {
      showToast('请选择要分配的用户', ToastLevelEnum.ERROR);
      return;
    }
    await authUserSelectAll({ roleId, userIds: ids });
    showToast('分配成功', ToastLevelEnum.SUCCESS);
    refreshList();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>{title}</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* 查询 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <DialogContent dividers>
        {/* 待选择的用户列表 */}
        <UnselectedUserTable
          rows={rows}
          total={total}
          page={page}
          rowsPerPage={rowsPerPage}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          dictData={dictData}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button size="small" onClick={onClose} variant="outlined">
          取消
        </Button>
        <Button size="small" variant="contained" onClick={handleSelectUser}>
          确定
        </Button>
      </DialogActions>
    </Dialog>
  );
}
