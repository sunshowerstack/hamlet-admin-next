'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';
import { useDict } from '@/hooks/use-dict';
import { showToast } from '@/utils/toast';

import { listClient, delClient } from '@/api/system/client';
import type { ClientVO } from '@/api/system/client/types';
import { ClientsTable } from '@/components/system/client/clients-table';
import ClientModal from '@/components/system/client/client-modal';
import { download } from '@/utils/request';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [pageList, setPageList] = useState<ClientVO[]>([]);

  // 选择与弹窗
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ClientVO | null>(null);

  // 字典：状态、设备类型
  const { sys_normal_disable, sys_device_type } = useDict('sys_normal_disable', 'sys_device_type');

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    clientKey: '',
    clientSecret: '',
    status: '',
  });

  const confirm = useConfirm();

  const getPageList = useCallback(async () => {
    const res: any = await listClient({
      clientKey: searchParams.clientKey,
      clientSecret: searchParams.clientSecret,
      status: searchParams.status,
      pageNum: page + 1,
      pageSize: rowsPerPage,
    });
    const rows = res.rows;
    setPageList(rows);
    setTotal(res.total);
  }, [page, rowsPerPage, searchParams]);

  useEffect(() => {
    getPageList();
  }, [getPageList]);

  const handleSearch = (form: any) => {
    setSearchParams({
      clientKey: form.clientKey || '',
      clientSecret: form.clientSecret || '',
      status: form.status || '',
    });
    setPage(0);
  };
  const handleReset = () => {
    setSearchParams({ clientKey: '', clientSecret: '', status: '' });
    setPage(0);
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleRowsPerPageChange = (n: number) => {
    setRowsPerPage(n);
    setPage(0);
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };
  const handleEdit = (row: ClientVO) => {
    setEditData(row);
    setModalOpen(true);
  };
  const handleDelete = async (row: ClientVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除客户端"${row.clientId}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[client] handleDelete cancelled', reason);
      return;
    }
    await delClient(row.id);
    getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条客户端吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[client] handleBulkDelete cancelled', reason);
      return;
    }
    await delClient(selectedRows as any);
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
    getPageList();
  };

  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'system/client/export',
      {
        ...searchParams,
      },
      `client_${Date.now()}.xlsx`
    );
  };

  const searchFields = [
    { name: 'clientKey', label: '客户端key', type: 'text' as const, placeholder: '请输入客户端key' },
    { name: 'clientSecret', label: '客户端秘钥', type: 'text' as const, placeholder: '请输入客户端秘钥' },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: sys_normal_disable?.map((item) => ({
        value: item.value,
        label: item.label,
      })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
  ];

  return (
    <Stack spacing={3}>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      <ActionButtons
        onAdd={handleAdd}
        onEdit={() => {
          const row = pageList.find((r) => r.id === selectedRows[0]);
          if (row) handleEdit(row);
        }}
        onDelete={handleBulkDelete}
        selectedCount={selectedRows.length}
      >
        <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
          导出
        </Button>
      </ActionButtons>
      <ClientsTable
        total={total}
        rows={pageList}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        dictData={{ sys_normal_disable, sys_device_type }}
      />
      <ClientModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改客户端' : '添加客户端'}
        dictData={{ sys_normal_disable, sys_device_type }}
      />
    </Stack>
  );
}
