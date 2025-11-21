'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Stack from '@mui/material/Stack';

// jsx组件 列表表格
import { NoticesTable } from '@/components/system/notice/notices-table';
// 接口定义
import { listNotice, delNotice, getNotice } from '@/api/system/notice';
import { useDict } from '@/hooks/use-dict';
import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import NoticeModal from '@/components/system/notice/notice-modal';
import { NoticeVO } from '@/api/system/notice/types';
import { showToast } from '@/utils/toast';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  console.log('[Page] start...');
  // 当前页码
  const [page, setPage] = useState(0);
  // 每页条数
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // 列表数据
  const [pageList, setPageList] = useState<NoticeVO[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [editData, setEditData] = useState<NoticeVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 搜索条件状态
  const [searchParams, setSearchParams] = useState({
    noticeTitle: '',
    createByName: '',
    noticeType: '',
  });
  const confirm = useConfirm();
  /**
   * 获取列表数据
   */
  const getPageList = useCallback(async () => {
    const res = await listNotice({
      noticeTitle: searchParams.noticeTitle,
      createByName: searchParams.createByName,
      status: '',
      noticeType: searchParams.noticeType,
      pageNum: page + 1, // 后端页码从1开始，前端从0开始
      pageSize: rowsPerPage,
    });
    console.log('res====', res);
    const rows = res.rows;
    setPageList(rows);
    setTotal(res.total);
  }, [page, rowsPerPage, searchParams]);

  // 监听分页参数变化，重新查询数据
  useEffect(() => {
    console.log('[Page] useEffect start...');
    getPageList();
  }, [page, rowsPerPage, searchParams, getPageList]);

  // 处理页码改变
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // 页号切换，已选项清除
    setSelectedRows([]);
  };

  // 处理每页条数改变
  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // 重置到第一页
  };

  // 字典数据 - 在父组件统一获取
  const { sys_notice_status, sys_notice_type } = useDict('sys_notice_status', 'sys_notice_type');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_notice_status,
    sys_notice_type,
  };

  const searchFields = [
    {
      name: 'noticeTitle',
      label: '公告标题',
      type: 'text' as const,
      placeholder: '请输入公告标题',
    },
    {
      name: 'createByName',
      label: '操作人员',
      type: 'text' as const,
      placeholder: '请输入操作人员',
    },
    {
      name: 'noticeType',
      label: '类型',
      type: 'select' as const,
      options: sys_notice_type?.map((item) => ({
        value: item.value,
        label: item.label,
      })),
      defaultValue: '', // 是否有默认选中值
      hasAll: true, // 下拉选项是否带"全部"
    },
  ];

  const handleSearch = (searchData: SearchFormData) => {
    console.log('[Page] 搜索条件:', searchData);
    // 更新搜索参数
    setSearchParams({
      noticeTitle: searchData.noticeTitle || '',
      createByName: searchData.createByName || '',
      noticeType: searchData.noticeType || '',
    });
    // 重置到第一页
    setPage(0);
    // 重新查询数据 多余
    // getList();
  };

  const handleReset = () => {
    console.log('[Page] 重置搜索');
    // 重置搜索参数
    setSearchParams({
      noticeTitle: '',
      createByName: '',
      noticeType: '',
    });
    // 重置到第一页
    setPage(0);
    // 重新查询数据 多余
    // getList();
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = async (row: NoticeVO) => {
    const noticeId = row?.noticeId || selectedRows[0];
    const { data } = await getNotice(noticeId);

    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (row: NoticeVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除公告"${row.noticeTitle}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[notice] handleDelete cancelled', reason);
      return;
    }

    await delNotice(row.noticeId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      return;
    }
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条公告吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[notice] handleBulkDelete cancelled', reason);
      return;
    }

    await delNotice(selectedRows);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  return (
    <Stack spacing={3}>
      {/* 1.查询条件区域 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      {/* 2.表格上方按钮操作区域 */}
      <ActionButtons
        onAdd={handleAdd}
        onEdit={() => {
          const selectedItem = pageList.find((item) => item.noticeId + '' === selectedRows[0]);
          if (selectedItem) {
            handleEdit(selectedItem);
          }
        }}
        onDelete={handleBulkDelete}
        selectedCount={selectedRows.length}
      />
      {/* 3.表格区域 */}
      <NoticesTable
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
      {/* 4.弹窗组件 */}
      <NoticeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改公告' : '添加公告'}
        dictData={dictData}
      />
    </Stack>
  );
}
