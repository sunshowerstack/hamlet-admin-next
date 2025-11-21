'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Stack from '@mui/material/Stack';

// jsx组件 列表表格
import { RolesTable } from '@/components/system/role/roles-table';
// 接口定义
import { listRole, delRole, getRole, deptTreeSelect } from '@/api/system/role';
import { useDict } from '@/hooks/use-dict';
import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import RoleModal from '@/components/system/role/role-modal';
import { DeptTreeOption, RoleVO } from '@/api/system/role/types';
import { showToast } from '@/utils/toast';
import RoleScopeModal from '@/components/system/role/role-auth/role-scope-modal';
import { roleMenuTreeselect, treeselect as menuTreeselect } from '@/api/system/menu/index';
import { MenuTreeOption, RoleMenuTree } from '@/api/system/menu/types';
import { Button } from '@mui/material';
import { Download } from '@mui/icons-material';
import { download } from '@/utils/request';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  console.log('[Page] start...');
  // 当前页码
  const [page, setPage] = useState(0);
  // 每页条数
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // 列表数据
  const [pageList, setPageList] = useState<RoleVO[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [checkedDeptKeys, setCheckedDeptKeys] = useState<string[]>([]);
  const [checkedMenuKeys, setCheckedMenuKeys] = useState<string[]>([]);

  const [deptOptions, setDeptOptions] = useState<DeptTreeOption[]>([]);
  const [menuOptions, setMenuOptions] = useState<MenuTreeOption[]>([]);

  const [editData, setEditData] = useState<RoleVO | null>(null);
  // 用户分配弹窗
  const [modalOpen, setModalOpen] = useState(false);
  // 数据权限分配弹窗
  const [scopeModalOpen, setScopeModalOpen] = useState(false);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // 搜索条件状态
  const [searchParams, setSearchParams] = useState({
    roleName: '',
    roleKey: '',
    status: '',
  });

  const confirm = useConfirm();

  /**
   * 获取列表数据
   */
  const getPageList = useCallback(async () => {
    const res = await listRole({
      roleName: searchParams.roleName,
      roleKey: searchParams.roleKey,
      status: searchParams.status,
      pageNum: page + 1, // 后端页码从1开始，前端从0开始
      pageSize: rowsPerPage,
    });
    console.log('res====', res);
    // listRole返回的是RoleVO[]，不是分页对象
    const rows = res.rows;
    setPageList(rows);
    setTotal(res.total);
  }, [page, rowsPerPage, searchParams]);

  // 监听分页参数变化，重新查询数据
  useEffect(() => {
    console.log('[Page] useEffect start...');
    getPageList();
  }, [getPageList]);

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
  const { sys_normal_disable } = useDict('sys_normal_disable');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_normal_disable,
  };

  const searchFields = [
    {
      name: 'roleName',
      label: '角色名称',
      type: 'text' as const,
      placeholder: '请输入角色名称',
    },
    {
      name: 'roleKey',
      label: '权限字符',
      type: 'text' as const,
      placeholder: '请输入权限字符',
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
  ];

  const handleSearch = (searchData: SearchFormData) => {
    console.log('[Page] 搜索条件:', searchData);
    // 更新搜索参数
    setSearchParams({
      roleName: searchData.roleName || '',
      roleKey: searchData.roleKey || '',
      status: searchData.status || '',
    });
    // 重置到第一页
    setPage(0);
  };

  const handleReset = () => {
    console.log('[Page] 重置搜索');
    // 重置搜索参数
    setSearchParams({
      roleName: '',
      roleKey: '',
      status: '',
    });
    // 重置到第一页
    setPage(0);
  };

  const handleAdd = () => {
    getMenuTreeselect();
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = async (row: RoleVO) => {
    const roleId = row?.roleId || selectedRows[0];
    const { data } = await getRole(roleId);

    // 默认选中的菜单项
    const res = await getRoleMenuTreeselect(roleId);

    if (res.checkedKeys) {
      // 转成字符串数组为了匹配SimpleTreeView的属性里的定义
      const strCheckedKeys = res.checkedKeys.map((key) => key + '');
      setCheckedMenuKeys(strCheckedKeys);
    }

    setEditData(data);
    setModalOpen(true);
  };

  /** 根据角色ID查询菜单树结构 */
  const getRoleMenuTreeselect = (roleId: string | number) => {
    return roleMenuTreeselect(roleId).then((res): RoleMenuTree => {
      setMenuOptions(res.data.menus);
      return res.data;
    });
  };

  // 分配数据权限
  const handleDataScope = async (row: RoleVO) => {
    const roleId = row?.roleId || selectedRows[0];
    const { data } = await getRole(roleId);
    // 传递当前的数据给对话框组件
    setEditData(data);
    const res = await getRoleDeptTreeSelect(roleId);
    // 权限范围：自定义数据权限时候 勾选的项目
    console.log('[handleDataScope] res.checkedKeys======', res.checkedKeys);

    if (res.checkedKeys) {
      // 转成字符串数组为了匹配SimpleTreeView的属性里的定义
      const strCheckedKeys = res.checkedKeys.map((key) => key + '');
      setCheckedDeptKeys(strCheckedKeys);
    }
    // 显示对话框
    setScopeModalOpen(true);
  };

  /** 根据角色ID查询部门树结构 */
  const getRoleDeptTreeSelect = async (roleId: string | number) => {
    const res = await deptTreeSelect(roleId);
    setDeptOptions(res.data.depts);
    return res.data;
  };

  const handleDelete = async (row: RoleVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除角色"${row.roleName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[role] handleDelete cancelled', reason);
      return;
    }

    await delRole(row.roleId);
    setPage(0);
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      return;
    }
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除选中的 ${selectedRows.length} 个角色吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[role] handleBulkDelete cancelled', reason);
      return;
    }

    await delRole(selectedRows);
    await getPageList();
    setSelectedRows([]);
    showToast('批量删除成功', ToastLevelEnum.SUCCESS);
  };

  /** 导出按钮操作 */
  const handleExport = () => {
    download(
      'system/role/export',
      {
        ...searchParams,
      },
      `role_${Date.now()}.xlsx`
    );
  };

  /** 查询菜单树结构 */
  const getMenuTreeselect = async () => {
    const res = await menuTreeselect();
    setMenuOptions(res.data);
  };

  return (
    <Stack spacing={3}>
      {/* 1.查询条件区域 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      {/* 2.表格上方按钮操作区域 */}
      <ActionButtons
        onAdd={handleAdd}
        onEdit={() => {
          const selectedItem = pageList.find((item) => item.roleId === selectedRows[0]);
          if (selectedItem) {
            handleEdit(selectedItem);
          }
        }}
        onDelete={handleBulkDelete}
        selectedCount={selectedRows.length}
      >
        <Button size="small" startIcon={<Download fontSize="small" />} variant="outlined" onClick={handleExport}>
          导出
        </Button>
      </ActionButtons>

      {/* 3.表格区域 */}
      <RolesTable
        total={total}
        page={page}
        rows={pageList}
        rowsPerPage={rowsPerPage}
        onSelectionChange={setSelectedRows}
        selectedRows={selectedRows}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDataScope={handleDataScope} // 分配数据权限对话框
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        dictData={dictData}
      />
      {/* 4.弹窗组件 - 增改角色 */}
      <RoleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改角色' : '添加角色'}
        dictData={dictData}
        menuOptions={menuOptions}
        checkedKeys={checkedMenuKeys}
      />
      {/* 5.弹窗组件 - 分配数据权限*/}
      <RoleScopeModal
        open={scopeModalOpen}
        onClose={() => setScopeModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={'分配数据权限'}
        deptOptions={deptOptions}
        checkedKeys={checkedDeptKeys} // 默认需要勾选的
      />
    </Stack>
  );
}
