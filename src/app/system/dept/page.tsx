'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';

import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import { useDict } from '@/hooks/use-dict';

import { listDept, delDept, getDept } from '@/api/system/dept';
import { DeptVO } from '@/api/system/dept/types';
import { showToast } from '@/utils/toast';
import DeptModal from '@/components/system/dept/dept-modal';
import { DeptsTable } from '@/components/system/dept/depts-table';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // 列表与总数
  const [pageList, setPageList] = useState<DeptVO[]>([]);
  const [total, setTotal] = useState<number>(0);

  // 弹窗
  const [editData, setEditData] = useState<DeptVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 选中
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 查询条件
  const [searchParams, setSearchParams] = useState({
    deptName: '',
    deptCategory: '',
    status: '',
  });
  const confirm = useConfirm();

  // 获取列表
  const getPageList = useCallback(async () => {
    const res = await listDept({
      deptName: searchParams.deptName,
      deptCategory: searchParams.deptCategory,
      status: searchParams.status as unknown as number,
      pageNum: page + 1,
      pageSize: rowsPerPage,
    } as any);
    // 这个接口的key是data，没有考虑到分页
    const rows = res.data;
    setPageList(rows);
    setTotal(rows.length);
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

  // 字典：使用用户模块的通用启停字典
  const { sys_normal_disable } = useDict('sys_normal_disable');

  const searchFields = [
    { name: 'deptName', label: '部门名称', type: 'text' as const, placeholder: '请输入部门名称' },
    { name: 'deptCategory', label: '类别编码', type: 'text' as const, placeholder: '请输入类别编码' },
    {
      name: 'status',
      label: '状态',
      type: 'select' as const,
      options: sys_normal_disable?.map((item) => ({ value: item.value, label: item.label })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
  ];

  const handleSearch = (data: SearchFormData) => {
    setSearchParams({
      deptName: (data as any).deptName || '',
      deptCategory: (data as any).deptCategory || '',
      status: (data as any).status || '',
    });
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ deptName: '', deptCategory: '', status: '' });
    setPage(0);
  };

  const handleAdd = async () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = async (row: DeptVO) => {
    const deptId = row?.deptId || selectedRows[0];
    const { data } = await getDept(deptId);
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (row: DeptVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除部门"${row.deptName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[dept] handleDelete cancelled', reason);
      return;
    }

    await delDept(row.deptId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const dictData = { sys_normal_disable };

  return (
    <Stack spacing={3}>
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />

      <ActionButtons onAdd={handleAdd} selectedCount={selectedRows.length} />

      <DeptsTable
        total={total}
        page={page}
        rows={pageList}
        rowsPerPage={rowsPerPage}
        onSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        dictData={dictData}
      />

      <DeptModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改部门' : '添加部门'}
        dictData={dictData}
      />
    </Stack>
  );
}
