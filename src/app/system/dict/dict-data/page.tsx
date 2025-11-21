'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';

import SearchForm from '@/components/common/search-form';
import ActionButtons from '@/components/common/action-buttons';

import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data';

import { showToast } from '@/utils/toast';
import { DictDataTable } from '@/components/system/dict/dict-data/dict-data-table';
import DictDataModal from '@/components/system/dict/dict-data/dict-data-modal';

import { DictDataVO } from '@/api/system/dict/data/types';
import { useSearchParams } from 'next/navigation';
import { optionselect as getDictOptionselect, getType } from '@/api/system/dict/type';
import { DictTypeVO } from '@/api/system/dict/type/types';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表数据
  const [rows, setRows] = useState<DictDataVO[]>([]);
  const [total, setTotal] = useState(0);

  // 选中、多选
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 弹窗
  const [editData, setEditData] = useState<DictDataVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [typeOptions, setTypeOptions] = useState<DictTypeVO[] | null>(null);

  // 当前路由参数,直接获取，不从zustand，useTabsStore()里获取
  const pathParams = useSearchParams();
  // 可能pathParams.get('xxx')可能产生null,用" || '' "规避
  const dictType = pathParams.get('dictType') || '';
  console.log('dictType:', dictType);

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    dictType: dictType,
    dictLabel: '',
  });
  const confirm = useConfirm();

  const searchFields = [
    {
      type: 'select' as const,
      name: 'dictType',
      label: '字典名称', // 其实是字典类型
      placeholder: '请输入',
      options: typeOptions?.map((item) => ({
        value: item.dictType,
        label: item.dictName,
      })),
      defaultValue: dictType, // 是否有默认选中值
      hasAll: false, // 下拉选项是否带"全部"
    },
    { type: 'text' as const, name: 'dictLabel', label: '字典标签', placeholder: '请输入' },
  ];

  const getPageList = useCallback(async () => {
    console.log('searchParams:', searchParams);
    const res = await listData({
      dictType: searchParams.dictType,
      dictLabel: searchParams.dictLabel,
      pageNum: page + 1,
      pageSize: rowsPerPage,
    } as any);
    console.log('res====', res);
    const rows = res.rows;
    setRows(rows);
    setTotal(res.total);
  }, [page, rowsPerPage, searchParams]);

  useEffect(() => {
    // 查询条件：字典类型下拉框options
    getTypeList();

    getPageList();
  }, [getPageList]);

  const handleSearch = (form: Record<string, string>) => {
    // const handleSearch = (form: SearchFormData) => {
    setSearchParams({
      dictType: form.dictType || '',
      dictLabel: form.dictLabel || '',
    });
    setPage(0);
  };

  const handleReset = (form: Record<string, string>) => {
    console.log('[handleReset] form:', form);
    setSearchParams({
      dictType: form.dictType || '',
      dictLabel: '',
    });
    setPage(0);
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (row: DictDataVO) => {
    setEditData(row);
    setModalOpen(true);
  };

  const handleDelete = async (row: DictDataVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除字典编码为"${row.dictCode}"的数据吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[dict-data] handleDelete cancelled', reason);
      return;
    }

    await delData(row.dictCode + '');
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
    // TODO:
    // useDictStore().removeDict(queryParams.value.dictType);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;

    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条字典数据吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[dict-data] handleBulkDelete cancelled', reason);
      return;
    }

    await delData(selectedRows);
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

  /** 查询字典类型列表 */
  const getTypeList = async () => {
    const res = await getDictOptionselect();
    setTypeOptions(res.data);
  };

  return (
    <Stack spacing={3}>
      {/* 查询 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      {/* 操作区 */}
      <ActionButtons
        onAdd={handleAdd}
        onEdit={() => {
          const item = rows.find((r) => r.dictCode === selectedRows[0]);
          if (item) handleEdit(item);
        }}
        onDelete={handleBulkDelete}
        selectedCount={selectedRows.length}
      />

      {/* 表格 */}
      <DictDataTable
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
      <DictDataModal
        selectedType={dictType}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改字典数据' : '添加字典数据'}
      />
    </Stack>
  );
}
