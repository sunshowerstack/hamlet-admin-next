'use client';

import React, { useEffect, useState } from 'react';
import Stack from '@mui/material/Stack';
import { Button, Grid, Paper } from '@mui/material';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import { useDict } from '@/hooks/use-dict';
import { DeptVO } from '@/api/system/dept/types';
import { treeselect } from '@/api/system/dept';
import { deptTreeSelect } from '@/api/system/user';

import { addPost, delPost, getPost, listPost, updatePost } from '@/api/system/post';
import { PostForm, PostQuery, PostVO } from '@/api/system/post/types';
import PostsTable from '@/components/system/post/posts-table';
import PostModal from '@/components/system/post/post-modal';
import { showToast } from '@/utils/toast';
import { Download } from '@mui/icons-material';
import { download } from '@/utils/request';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  // 分页
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [rows, setRows] = useState<PostVO[]>([]);
  const [total, setTotal] = useState(0);

  // 选择与弹窗
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<PostVO | null>(null);

  // 字典
  const { sys_normal_disable } = useDict('sys_normal_disable');

  // 部门树
  const [deptOptions, setDeptOptions] = useState<DeptVO[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // 搜索
  const [searchParams, setSearchParams] = useState({
    postCode: '',
    postName: '',
    postCategory: '',
    status: '',
    deptId: '',
    belongDeptId: '', // 左侧部门树
  });

  const confirm = useConfirm();

  useEffect(() => {
    getTreeSelect();
  }, []);

  useEffect(() => {
    getPageList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchParams]);

  const getTreeSelect = async () => {
    const res = await deptTreeSelect();
    setDeptOptions(res.data);
  };

  const initTreeData = async () => {
    if (deptOptions === undefined) {
      const { data } = await treeselect();
      setDeptOptions(data);
    }
  };

  const getPageList = async () => {
    const query: any = {
      ...searchParams,
      // 左侧选中的
      // belongDeptId: searchParams.deptId,
      pageNum: page + 1,
      pageSize: rowsPerPage,
    } as Partial<PostQuery> & { pageNum: number; pageSize: number };
    const res = await listPost(query as any);
    setRows(res.rows);
    setTotal(res.total);
  };

  const searchFields = [
    { name: 'postCode', label: '岗位编码', type: 'text' as const, placeholder: '请输入岗位编码' },
    { name: 'postName', label: '岗位名称', type: 'text' as const, placeholder: '请输入岗位名称' },
    { name: 'postCategory', label: '类别编码', type: 'text' as const, placeholder: '请输入类别编码' },
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
    setSearchParams((prev) => ({
      ...prev,
      postCode: (data as any).postCode || '',
      postName: (data as any).postName || '',
      postCategory: (data as any).postCategory || '',
      status: (data as any).status || '',
    }));
    setPage(0);
  };

  const handleReset = () => {
    setSearchParams({ postCode: '', postName: '', postCategory: '', status: '', deptId: '', belongDeptId: '' });
    setSelectedDeptId('');
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSelectedRows([]);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleAdd = async () => {
    await initTreeData();
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = async (row: PostVO) => {
    const postId = row?.postId || selectedRows[0];
    const { data } = await getPost(postId);
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (row: PostVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除岗位"${row.postName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[post] handleDelete cancelled', reason);
      return;
    }

    await delPost(row.postId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条岗位吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[post] handleBulkDelete cancelled', reason);
      return;
    }

    await delPost(selectedRows);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'system/post/export',
      {
        ...searchParams,
      },
      `post_${Date.now()}.xlsx`
    );
  };
  const renderTree = (nodes: DeptVO) =>
    nodes && (
      <TreeItem key={nodes.id} itemId={nodes.id + ''} label={nodes.label}>
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );

  return (
    <Grid container spacing={2} alignItems="top">
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <SimpleTreeView
            defaultExpandedItems={['100', '101', '102']}
            selectedItems={selectedDeptId}
            onSelectedItemsChange={(event, itemIds) => {
              const selectedId = Array.isArray(itemIds) ? itemIds[0] || '' : (itemIds as unknown as string) || '';
              setSelectedDeptId(selectedId);
              setSearchParams((prev) => ({ ...prev, belongDeptId: selectedId }));
              setPage(0);
            }}
          >
            {renderTree(deptOptions[0])}
          </SimpleTreeView>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, sm: 6, md: 8, lg: 10 }}>
        <Stack spacing={3}>
          <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
          <ActionButtons
            onAdd={handleAdd}
            onEdit={() => {
              const selectedItem = rows.find((item) => item.postId === selectedRows[0]);
              if (selectedItem) handleEdit(selectedItem);
            }}
            onDelete={handleBulkDelete}
            selectedCount={selectedRows.length}
          >
            <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
              导出
            </Button>
          </ActionButtons>

          <PostsTable
            total={total}
            page={page}
            rows={rows}
            rowsPerPage={rowsPerPage}
            onSelectionChange={setSelectedRows}
            selectedRows={selectedRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            dictData={{ sys_normal_disable }}
          />
          <PostModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            refreshList={getPageList}
            editData={editData}
            title={editData ? '修改岗位' : '添加岗位'}
            deptOptions={deptOptions}
            dictData={{ sys_normal_disable }}
            onSubmit={async (data: PostForm) => {
              if (editData) {
                await updatePost(data);
              } else {
                await addPost(data);
              }
              await getPageList();
              setModalOpen(false);
            }}
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
