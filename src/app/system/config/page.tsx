'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';

import { listConfig, delConfig, refreshCache } from '@/api/system/config';
import { ConfigVO } from '@/api/system/config/types';

import { ConfigsTable } from '@/components/system/config/configs-table';
import ConfigModal from '@/components/system/config/config-modal';
import { useDict } from '@/hooks/use-dict';
import { showToast } from '@/utils/toast';
import { download } from '@/utils/request';
import { Download } from '@mui/icons-material';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

const handleRefreshCache = async () => {
  await refreshCache();
};

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表数据
  const [rows, setRows] = useState<ConfigVO[]>([]);
  const [total, setTotal] = useState(0);

  // 选中、多选
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 弹窗
  const [editData, setEditData] = useState<ConfigVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    configName: '',
    configKey: '',
    configType: '',
  });
  const confirm = useConfirm();

  // 字典数据 - 在父组件统一获取
  const { sys_yes_no } = useDict('sys_yes_no');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_yes_no,
  };

  console.log('sys_yes_no:', sys_yes_no);
  // const searchFields = useMemo(
  //   () => [
  //     { type: 'text' as const, name: 'configName', label: '参数名称', placeholder: '请输入参数名称' },
  //     { type: 'text' as const, name: 'configKey', label: '参数键名', placeholder: '请输入参数键名' },
  //     {
  //       type: 'select' as const,
  //       name: 'configType',
  //       label: '系统内置',
  //       options: sys_yes_no?.map((item) => ({
  //         value: item.value,
  //         label: item.label,
  //       })),
  //     },
  //   ],
  //   []
  // );

  const searchFields = [
    { type: 'text' as const, name: 'configName', label: '参数名称', placeholder: '请输入参数名称' },
    { type: 'text' as const, name: 'configKey', label: '参数键名', placeholder: '请输入参数键名' },
    {
      type: 'select' as const,
      name: 'configType',
      label: '系统内置',
      options: sys_yes_no?.map((item) => ({
        value: item.value,
        label: item.label,
      })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
  ];

  const getPageList = useCallback(async () => {
    const res = await listConfig({
      configName: searchParams.configName,
      configKey: searchParams.configKey,
      configType: searchParams.configType,
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
      configName: form.configName || '',
      configKey: form.configKey || '',
      configType: form.configType || '',
    });
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ configName: '', configKey: '', configType: '' });
    setPage(0);
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (row: ConfigVO) => {
    setEditData(row);
    setModalOpen(true);
  };

  const handleDelete = async (row: ConfigVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除参数"${row.configName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[config] handleDelete cancelled', reason);
      return;
    }

    await delConfig(row.configId + '');
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条参数吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[config] handleBulkDelete cancelled', reason);
      return;
    }

    await delConfig(selectedRows);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
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

  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'system/config/export',
      {
        ...searchParams,
      },
      `config_${Date.now()}.xlsx`
    );
  };
  return (
    <Stack spacing={3}>
      {/* 查询 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      {/* 操作区 */}
      <ActionButtons
        onAdd={handleAdd}
        onEdit={() => {
          const item = rows.find((r) => r.configId === selectedRows[0]);
          if (item) handleEdit(item);
        }}
        onDelete={handleBulkDelete}
        selectedCount={selectedRows.length}
      >
        <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
          导出
        </Button>
        <Button size="small" startIcon={<RefreshIcon fontSize="small" />} variant="outlined" onClick={handleRefreshCache}>
          刷新缓存
        </Button>
      </ActionButtons>

      {/* 表格 */}
      <ConfigsTable
        rows={rows}
        total={total}
        page={page}
        rowsPerPage={rowsPerPage}
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        dictData={dictData}
      />

      {/* 弹窗 */}
      <ConfigModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改参数' : '新增参数'}
        dictData={dictData}
      />
    </Stack>
  );
}
