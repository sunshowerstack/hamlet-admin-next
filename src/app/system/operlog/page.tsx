'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Button } from '@mui/material';
import { Delete, Download } from '@mui/icons-material';
import dayjs from 'dayjs';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';
import { SearchFormData } from '@/types/common';
import { OperLogQuery, OperLogVO } from '@/api/monitor/operlog/types';
import { list, delOperlog, cleanOperlog } from '@/api/monitor/operlog';
import { useDict } from '@/hooks/use-dict';
import { showToast } from '@/utils/toast';
import { OperlogsTable } from '@/components/system/operlog/operlogs-table';
import OperlogDetailDialog from '@/components/system/operlog/operlog-detail-dialog';
import { download } from '@/utils/request';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pageList, setPageList] = useState<OperLogVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<OperLogVO | null>(null);

  const [searchParams, setSearchParams] = useState<Partial<OperLogQuery>>({
    operIp: '',
    title: '',
    operName: '',
    businessType: '',
    status: '',
    beginTime: '',
    endTime: '',
  });

  const getPageList = useCallback(async () => {
    const res = await list({
      operIp: searchParams.operIp,
      title: searchParams.title,
      operName: searchParams.operName,
      businessType: searchParams.businessType,
      status: searchParams.status,
      pageNum: page + 1,
      pageSize: rowsPerPage,
      'params[beginTime]': searchParams.beginTime ?? '00:00:00',
      'params[endTime]': searchParams.endTime ?? '23:59:59',
      orderByColumn: 'operTime',
      isAsc: 'desc',
    } as OperLogQuery);

    const rows = res.rows;
    setPageList(rows);
    setTotal(res.total);
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

  // 字典
  const { sys_common_status, sys_oper_type } = useDict('sys_common_status', 'sys_oper_type');
  const dictData = { sys_common_status, sys_oper_type };

  const searchFields = [
    { name: 'operIp', label: '操作地址', type: 'text' as const, placeholder: '请输入操作地址' },
    { name: 'title', label: '系统模块', type: 'text' as const, placeholder: '请输入系统模块' },
    { name: 'operName', label: '操作人员', type: 'text' as const, placeholder: '请输入操作人员' },
    {
      name: 'businessType',
      label: '类型',
      type: 'select' as const,
      options: sys_oper_type?.map((item) => ({ value: item.value, label: item.label })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: sys_common_status?.map((item) => ({ value: item.value, label: item.label })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
    { name: 'operTime', label: '操作时间', type: 'dateRange' as const },
  ];

  const handleSearch = (searchData: SearchFormData) => {
    let beginTime: string | undefined;
    let endTime: string | undefined;
    const range = searchData['operTime'] as any;
    if (Array.isArray(range) && range[0] && range[1]) {
      beginTime = dayjs(range[0]).format('YYYY-MM-DD 00:00:00');
      endTime = dayjs(range[1]).format('YYYY-MM-DD 23:59:59');
    }
    setSearchParams({
      operIp: (searchData.operIp as string) || '',
      title: (searchData.title as string) || '',
      operName: (searchData.operName as string) || '',
      businessType: (searchData.businessType as string) || '',
      status: (searchData.status as string) || '',
      beginTime,
      endTime,
    });
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ operIp: '', title: '', operName: '', businessType: '', status: '', beginTime: '', endTime: '' });
    setPage(0);
  };

  const confirm = useConfirm();

  const handleDelete = async (row: OperLogVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除该记录 ${row.operId} 吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[operlog] handleDelete cancelled', reason);
      return;
    }

    await delOperlog(row.operId);
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
      console.info('[operlog] handleBulkDelete cancelled', reason);
      return;
    }

    await delOperlog(selectedRows as any);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  /** 清空按钮操作 */
  const handleClean = async () => {
    const { confirmed, reason } = await confirm({
      title: '清空日志',
      description: '确定要清空操作日志吗？',
      cancellationText: '取消',
      confirmationText: '清空',
      confirmationButtonProps: { color: 'error', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[operlog] handleClean cancelled', reason);
      return;
    }

    await cleanOperlog();
    await getPageList();
    showToast('已清空', ToastLevelEnum.SUCCESS);
  };

  const handleView = (row: OperLogVO) => {
    setDetailData(row);
    setDetailOpen(true);
  };

  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'monitor/operlog/export',
      {
        ...searchParams,
      },
      `operlog_${Date.now()}.xlsx`
    );
  };

  return (
    <Stack spacing={3}>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <ActionButtons onDelete={handleBulkDelete} selectedCount={selectedRows.length}>
        <Button size="small" startIcon={<Delete fontSize="small" />} variant="outlined" onClick={handleClean}>
          清空
        </Button>
        <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
          导出
        </Button>
      </ActionButtons>
      <OperlogsTable
        total={total}
        page={page}
        rows={pageList}
        rowsPerPage={rowsPerPage}
        onSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        onView={handleView}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        dictData={dictData}
      />
      <OperlogDetailDialog open={detailOpen} onClose={() => setDetailOpen(false)} data={detailData} />
    </Stack>
  );
}
