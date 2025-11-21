'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';

import { listType, delType, refreshCache } from '@/api/system/dict/type';
import { DictTypeVO } from '@/api/system/dict/type/types';

import { DictTable } from '@/components/system/dict/dict-table';
import DictModal from '@/components/system/dict/dict-modal';
import { showToast } from '@/utils/toast';
import dayjs from 'dayjs';
import { SearchFormData } from '@/types/common';
import { Download } from '@mui/icons-material';
import { download } from '@/utils/request';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

const handleRefreshCache = async () => {
  await refreshCache();
  showToast('刷新缓存成功', ToastLevelEnum.SUCCESS);
};

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表数据
  const [rows, setRows] = useState<DictTypeVO[]>([]);
  const [total, setTotal] = useState(0);

  // 选中、多选
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 弹窗
  const [editData, setEditData] = useState<DictTypeVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    dictName: '',
    dictType: '',
    beginTime: '',
    endTime: '',
  } as {
    dictName: string;
    dictType: string;
    beginTime?: string;
    endTime?: string;
  });

  const confirm = useConfirm();

  const searchFields = [
    { type: 'text' as const, name: 'dictName', label: '字典名称', placeholder: '请输入字典名称' },
    { type: 'text' as const, name: 'dictType', label: '字典类型', placeholder: '请输入字典类型' },
    { type: 'dateRange' as const, name: 'createTime', label: '创建时间' },
  ];

  const getPageList = useCallback(async () => {
    const res = await listType({
      dictName: searchParams.dictName,
      dictType: searchParams.dictType,
      'params[beginTime]': searchParams.beginTime ?? '00:00:00',
      'params[endTime]': searchParams.endTime ?? '23:59:59',
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
    // const handleSearch = (form: SearchFormData) => {
    let beginTime = '';
    let endTime = '';
    // 创建时间
    const range = form['createTime'] as any;
    if (Array.isArray(range) && range[0] && range[1]) {
      beginTime = dayjs(range[0]).format('YYYY-MM-DD 00:00:00');
      endTime = dayjs(range[1]).format('YYYY-MM-DD 23:59:59');
    }

    setSearchParams({
      dictName: form.dictName || '',
      dictType: form.dictType || '',
      beginTime,
      endTime,
    });
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ dictName: '', dictType: '', beginTime: '', endTime: '' });
    setPage(0);
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (row: DictTypeVO) => {
    setEditData(row);
    setModalOpen(true);
  };

  const handleDelete = async (row: DictTypeVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除字典"${row.dictName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[dict] handleDelete cancelled', reason);
      return;
    }

    await delType(row.dictId + '');
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条字典吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[dict] handleBulkDelete cancelled', reason);
      return;
    }

    await delType(selectedRows);
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
      'system/dict/type/export',
      {
        ...searchParams,
      },
      `dict_${Date.now()}.xlsx`
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
          const item = rows.find((r) => r.dictId === selectedRows[0]);
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
      <DictTable
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
      />

      {/* 弹窗 */}
      <DictModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改字典类型' : '添加字典类型'}
      />
    </Stack>
  );
}
