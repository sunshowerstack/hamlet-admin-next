'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';
import { SearchFormData } from '@/types/common';
import { LoginInfoQuery, LoginInfoVO } from '@/api/monitor/loginInfo/types';
import { list, delLoginInfo, cleanLoginInfo, unlockLoginInfo } from '@/api/monitor/loginInfo';
import { LoginInfosTable } from '@/components/system/logininfo/login-infos-table';
import dayjs from 'dayjs';
import { showToast } from '@/utils/toast';
import { useDict } from '@/hooks/use-dict';
import { Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Delete, Download } from '@mui/icons-material';
import { download } from '@/utils/request';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageList, setPageList] = useState<LoginInfoVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useState<Partial<LoginInfoQuery>>({
    ipaddr: '',
    userName: '',
    status: '',
    beginTime: '',
    endTime: '',
  });

  const confirm = useConfirm();

  const getPageList = useCallback(async () => {
    const res = await list({
      ipaddr: searchParams.ipaddr || '',
      userName: searchParams.userName || '',
      status: searchParams.status || '',
      pageNum: page + 1,
      pageSize: rowsPerPage,
      'params[beginTime]': searchParams.beginTime ?? '00:00:00',
      'params[endTime]': searchParams.endTime ?? '23:59:59',
      orderByColumn: 'loginTime',
      isAsc: 'desc',
    } as LoginInfoQuery);

    const rows = res.rows ?? [];
    setPageList(rows);
    setTotal(res.total ?? rows.length);
  }, [page, rowsPerPage, searchParams]);

  useEffect(() => {
    getPageList();
  }, [getPageList]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedRows([]);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  // 字典数据 - 在父组件统一获取
  const { sys_common_status, sys_device_type } = useDict('sys_common_status', 'sys_device_type');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_common_status,
    sys_device_type,
  };

  const searchFields = [
    { name: 'ipaddr', label: '登录地址', type: 'text' as const, placeholder: '请输入登录地址' },
    { name: 'userName', label: '用户名', type: 'text' as const, placeholder: '请输入用户名' },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: sys_common_status?.map((item) => ({
        value: item.value,
        label: item.label,
      })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
    { name: 'loginTime', label: '登录时间', type: 'dateRange' as const },
  ];

  const handleSearch = (searchData: SearchFormData) => {
    let beginTime: string | undefined;
    let endTime: string | undefined;
    const range = searchData['loginTime'] as any;
    if (Array.isArray(range) && range[0] && range[1]) {
      beginTime = dayjs(range[0]).format('YYYY-MM-DD 00:00:00');
      endTime = dayjs(range[1]).format('YYYY-MM-DD 23:59:59');
    }
    setSearchParams({
      ipaddr: (searchData.ipaddr as string) || '',
      userName: (searchData.userName as string) || '',
      status: (searchData.status as string) || '',
      beginTime,
      endTime,
    });
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ ipaddr: '', userName: '', status: '', beginTime: '', endTime: '' });
    setPage(0);
  };

  const handleDelete = async (row: LoginInfoVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除该记录 ${row.infoId} 吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[logininfo] handleDelete cancelled', reason);
      return;
    }

    await delLoginInfo(row.infoId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条记录吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[logininfo] handleBulkDelete cancelled', reason);
      return;
    }

    await delLoginInfo(selectedRows as any);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  /** 解锁按钮操作 */
  const handleUnlock = async () => {
    if (selectedRows.length === 0) return;
    // const username = selectName.value;
    // TODO: 要拿到用户名作为参数
    const { confirmed, reason } = await confirm({
      title: '确认解锁',
      description: `是否确认解锁用户“${selectedRows.join(', ')}”的数据项？`,
      cancellationText: '取消',
      confirmationText: '解锁',
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[logininfo] handleUnlock cancelled', reason);
      return;
    }

    await unlockLoginInfo(selectedRows as any);
    showToast('解锁成功', ToastLevelEnum.SUCCESS);
  };

  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'monitor/logininfor/export',
      {
        ...searchParams,
      },
      `logininfo_${Date.now()}.xlsx`
    );
  };

  /** 清空按钮操作 */
  const handleClean = async () => {
    const { confirmed, reason } = await confirm({
      title: '清空日志',
      description: '确定要清空所有登录日志吗？',
      cancellationText: '取消',
      confirmationText: '清空',
      confirmationButtonProps: { color: 'error', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[logininfo] handleClean cancelled', reason);
      return;
    }

    await cleanLoginInfo();
    await getPageList();
    showToast('已清空', ToastLevelEnum.SUCCESS);
  };

  return (
    <Stack spacing={3}>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      {/* 操作区 */}
      <ActionButtons onDelete={handleBulkDelete} selectedCount={selectedRows.length}>
        <Button size="small" startIcon={<Delete fontSize="small" />} variant="outlined" onClick={handleClean}>
          清空
        </Button>
        <Button size="small" startIcon={<RefreshIcon fontSize="small" />} variant="outlined" onClick={handleUnlock}>
          解锁
        </Button>
        <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
          导出
        </Button>
      </ActionButtons>
      <LoginInfosTable
        total={total}
        page={page}
        rows={pageList}
        rowsPerPage={rowsPerPage}
        onSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        onDelete={handleDelete}
        onUnlock={handleUnlock}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        dictData={dictData}
      />
    </Stack>
  );
}
