'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';

// jsx组件 列表表格
import { UsersTable } from '@/components/system/user/users-table';

// 接口定义
import { useDict } from '@/hooks/use-dict';
import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import UserModal from '@/components/system/user/user-modal';
import { delUser, deptTreeSelect, getUser, listUser, resetUserPwd } from '@/api/system/user';
import { PostVO } from '@/api/system/post/types';
import { RoleVO } from '@/api/system/role/types';
import { DeptVO } from '@/api/system/dept/types';
import { treeselect } from '@/api/system/dept';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { Button, Paper, Stack, Grid } from '@mui/material';
import { UserVO } from '@/api/system/user/types';
import { ResetPasswordDialog } from '@/components/system/user/reset-password-dialog';
import { showToast } from '@/utils/toast';
import { download } from '@/utils/request';
import { Download, Upload } from '@mui/icons-material';
import UserTemplateUploadModal from '@/components/system/user/user-template-upload-modal';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

// 上传配置
const uploadConfig = {
  limit: 1,
  accept: '.xlsx, .xls',
  // 上传URL
  url: process.env.NEXT_PUBLIC_API_BASE_URL + '/system/user/importData',
};

export default function Page(): React.JSX.Element {
  console.log('[user] page start...');
  // 重置密码
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserVO | null>(null);

  // 当前页码
  const [page, setPage] = useState(0);
  // 每页条数
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // 列表数据
  const [pageList, setPageList] = useState<UserVO[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [editData, setEditData] = useState<UserVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const [postOptions, setPostOptions] = useState<PostVO[]>([]);
  const [roleOptions, setRoleOptions] = useState<RoleVO[]>([]);
  // 用户页面的左侧的部门树形组件
  const [deptOptions, setDeptOptions] = useState<DeptVO[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [postIds, setPostIds] = useState<string[]>([]);

  // 左侧部门树选中项（受控，单选）
  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  // 搜索条件状态
  const [searchParams, setSearchParams] = useState({
    userName: '',
    phonenumber: '',
    status: '',
    beginTime: '',
    endTime: '',
    deptId: '',
  });

  const confirm = useConfirm();

  // 监听分页参数变化，重新查询数据
  useEffect(() => {
    console.log('[user] useEffect start...');
    // 左侧下拉框数据
    getTreeSelect();
    // 列表数据
    getPageList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, searchParams]);

  /**
   * 获取列表数据
   */
  const getPageList = async () => {
    const queryParams = {
      userName: searchParams.userName,
      phonenumber: searchParams.phonenumber,
      status: searchParams.status,
      deptId: searchParams.deptId,
      'params[beginTime]': searchParams.beginTime ?? '00:00:00',
      'params[endTime]': searchParams.endTime ?? '23:59:59',
      pageNum: page + 1, // 后端页码从1开始，前端从0开始
      pageSize: rowsPerPage,
    };
    const res = await listUser(queryParams);
    console.log('[user] getPageList() res====', res);
    setPageList(res.rows);
    setTotal(res.total);
  };

  /** 查询部门下拉树结构 */
  const getTreeSelect = async () => {
    const res = await deptTreeSelect();
    console.log('[user] getTreeSelect res.data====', res.data);
    setDeptOptions(res.data);
  };

  /** 初始化部门数据 */
  const initTreeData = async () => {
    // 判断部门的数据是否存在，存在不获取，不存在则获取
    if (deptOptions === undefined) {
      const { data } = await treeselect();
      setDeptOptions(data);
    }
  };

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

  // 搜索条件里的下拉框内容
  const { sys_normal_disable, sys_user_sex } = useDict('sys_normal_disable', 'sys_user_sex');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_normal_disable,
    sys_user_sex,
  };

  const searchFields = [
    {
      name: 'userName',
      label: '用户名称',
      type: 'text' as const,
      placeholder: '请输入用户名称',
    },
    {
      name: 'phonenumber',
      label: '手机号码',
      type: 'text' as const,
      placeholder: '请输入手机号码',
    },
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
    {
      name: 'createTime',
      label: '创建时间',
      type: 'dateRange' as const,
      placeholder: '请输入创建时间',
    },
  ];

  const handleSearch = (searchData: SearchFormData) => {
    console.log('[user] handleSearch() 搜索条件:', searchData);

    // 处理日期范围数据
    let beginTime = '';
    let endTime = '';

    if (searchData.createTime && Array.isArray(searchData.createTime)) {
      const [startDate, endDate] = searchData.createTime;
      if (startDate) {
        beginTime = dayjs(startDate).format('YYYY-MM-DD 00:00:00');
      }
      if (endDate) {
        endTime = dayjs(endDate).format('YYYY-MM-DD 23:59:59');
      }
    }

    // 更新搜索参数，导致页面渲染render，而searchParams，page又是useEffect的监控条件之一，所以一改变就会再次执行useEffect
    setSearchParams({
      userName: searchData.userName || '',
      phonenumber: searchData.phonenumber || '',
      status: searchData.status || '',
      beginTime,
      endTime,
      deptId: searchParams.deptId || '',
    });
    // 重置到第一页
    setPage(0);
  };

  const handleReset = () => {
    // 重置搜索参数
    setSearchParams({
      userName: '',
      phonenumber: '',
      status: '',
      beginTime: '',
      endTime: '',
      deptId: '',
    });
    // 清空部门树选中项
    setSelectedDeptId('');
    // 重置到第一页
    setPage(0);
  };

  const handleAdd = async () => {
    const { data } = await getUser();
    console.log('[user] handleAdd() data====', data);
    setPostOptions(data.posts);
    setRoleOptions(data.roles);

    await initTreeData();
    setEditData(null);

    setModalOpen(true);
  };

  const handleEdit = async (row: UserVO) => {
    console.log('[user] handleEdit() row:', row);
    const userId = row?.userId || selectedRows[0];

    const { data } = await getUser(userId);
    console.log('[user] handleEdit() data:', data);
    // 弹框的待编辑的数据
    setEditData(data.user);
    // 弹框的下拉框内容
    setPostOptions(data.posts);
    setRoleOptions(data.roles);

    setPostIds(data.postIds);
    setRoleIds(data.roleIds);

    setModalOpen(true);
  };

  const handleDelete = async (row: UserVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除用户“${row.userName}”吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[user] handleDelete cancelled', reason);
      return;
    }

    await delUser(row.userId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      return;
    }
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 条用户吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[user] handleBulkDelete cancelled', reason);
      return;
    }

    await delUser(selectedRows);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleResetPwd = (row: UserVO) => {
    setSelectedUser(row);
    setResetPasswordDialogOpen(true);
  };

  const handleConfirmReset = async (password: string) => {
    if (!selectedUser) return;

    try {
      await resetUserPwd(selectedUser.userId, password);
      // 使用 MUI 的提示组件
      // 需要安装 @mui/lab 或使用其他通知库
      // enqueueSnackbar('修改成功，新密码是：' + password, { variant: 'success' });
      setResetPasswordDialogOpen(false);
    } catch (error) {
      // 处理错误
      console.log('error:', error);
    }
  };
  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'system/user/export',
      {
        ...searchParams,
      },
      `user_${Date.now()}.xlsx`
    );
  };

  /** 导入按钮操作 */
  const handleImport = () => {
    setImportModalOpen(true);
  };

  const renderTree = (nodes: DeptVO) =>
    nodes && (
      <TreeItem
        key={nodes.id}
        itemId={nodes.id + ''}
        // nodeId={nodes.id}
        label={nodes.label}
      >
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );

  return (
    <Grid container spacing={2} alignItems="top">
      {/* 部门树形下拉框 flex: '0 0 200px'防止右侧内容改变是被挤压*/}
      <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <SimpleTreeView
            defaultExpandedItems={['100', '101', '102']}
            selectedItems={selectedDeptId}
            onSelectedItemsChange={(event, itemIds) => {
              const selectedId = Array.isArray(itemIds) ? itemIds[0] || '' : (itemIds as unknown as string) || '';
              setSelectedDeptId(selectedId);
              setSearchParams((prev) => ({ ...prev, deptId: selectedId }));
              setPage(0);
            }}
          >
            {renderTree(deptOptions[0])}
          </SimpleTreeView>
        </Paper>
      </Grid>
      {/* 大屏幕左右比例：3:9 */}
      <Grid size={{ xs: 12, sm: 6, md: 8, lg: 10 }}>
        <Stack spacing={3}>
          {/* 1.查询条件区域 */}
          <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
          {/* 2.表格上方按钮操作区域 */}
          <ActionButtons
            onAdd={handleAdd}
            onEdit={() => {
              const selectedItem = pageList.find((item) => item.userId + '' === selectedRows[0]);
              if (selectedItem) {
                handleEdit(selectedItem);
              }
            }}
            onDelete={handleBulkDelete}
            selectedCount={selectedRows.length}
          >
            <Button size="small" startIcon={<Upload fontSize="small" />} variant="outlined" onClick={handleImport}>
              导入
            </Button>
            <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
              导出
            </Button>
          </ActionButtons>
          {/* 3.表格区域 */}
          <UsersTable
            total={total}
            page={page}
            rows={pageList}
            rowsPerPage={rowsPerPage}
            onSelectionChange={setSelectedRows}
            selectedRows={selectedRows}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPwd}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            dictData={dictData}
          />
          {/* 4.弹窗组件 */}
          <UserModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            refreshList={getPageList}
            editData={editData}
            title={editData ? '修改用户' : '添加用户'}
            postOptions={postOptions}
            roleOptions={roleOptions}
            postIds={postIds}
            roleIds={roleIds}
            deptOptions={deptOptions}
            dictData={dictData}
          />
          {/* 上传对话框组件（通过dialogOpen控制显示） */}
          <UserTemplateUploadModal
            open={importModalOpen}
            uploadConfig={uploadConfig}
            refreshList={getPageList}
            onClose={() => setImportModalOpen(false)} // 关闭对话框的回调
          />
          {/* 5.重置密码dialog */}
          <ResetPasswordDialog
            open={resetPasswordDialogOpen}
            onClose={() => setResetPasswordDialogOpen(false)}
            onConfirm={handleConfirmReset}
            user={selectedUser!}
          />
        </Stack>
      </Grid>
    </Grid>
  );
}
