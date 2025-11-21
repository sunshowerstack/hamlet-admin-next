'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Stack from '@mui/material/Stack';

// jsx组件 列表表格
import { MenusTable } from '@/components/system/menu/menus-table';
// 接口定义
import { listMenu, delMenu, getMenu } from '@/api/system/menu';
import { useDict } from '@/hooks/use-dict';
import SearchForm from '@/components/common/search-form';
import { SearchFormData } from '@/types/common';
import ActionButtons from '@/components/common/action-buttons';
import MenuModal from '@/components/system/menu/menu-modal';
import { MenuVO } from '@/api/system/menu/types';
import { showToast } from '@/utils/toast';
import { ToastLevelEnum } from '@/enums/toast-level-enum';
import { useConfirm } from 'material-ui-confirm';

export default function Page(): React.JSX.Element {
  console.log('[Page] start...');
  // 列表数据
  const [pageList, setPageList] = useState<MenuVO[]>([]);

  const [editData, setEditData] = useState<MenuVO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 搜索条件状态
  const [searchParams, setSearchParams] = useState({
    menuName: '',
    status: '',
  });
  const confirm = useConfirm();

  /**
   * 获取列表数据
   */
  const getPageList = useCallback(async () => {
    try {
      const res = await listMenu({
        menuName: searchParams.menuName,
        status: searchParams.status,
      });
      console.log('res====', res);
      // 菜单接口返回的是树形结构，直接使用
      setPageList(res.data);
    } catch (error) {
      console.error('获取菜单列表失败:', error);
    }
  }, [searchParams]);

  // 监听搜索参数变化，重新查询数据
  useEffect(() => {
    console.log('[Page] useEffect start...');
    getPageList();
  }, [getPageList]);

  // 字典数据 - 在父组件统一获取
  const { sys_normal_disable, sys_show_hide } = useDict('sys_normal_disable', 'sys_show_hide');

  // 字典数据对象，用于传递给子组件
  const dictData = {
    sys_normal_disable,
    sys_show_hide,
  };

  const searchFields = [
    {
      name: 'menuName',
      label: '菜单名称',
      type: 'text' as const,
      placeholder: '请输入菜单名称',
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
      menuName: searchData.menuName || '',
      status: searchData.status || '',
    });
  };

  const handleReset = () => {
    console.log('[Page] 重置搜索');
    // 重置搜索参数
    setSearchParams({
      menuName: '',
      status: '',
    });
  };

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = async (row: MenuVO) => {
    const menuId = row?.menuId;
    const { data } = await getMenu(menuId);

    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (row: MenuVO) => {
    const { confirmed, reason } = await confirm({
      title: '确认删除',
      description: `确定要删除菜单"${row.menuName}"吗？`,
      cancellationText: '取消',
      confirmationText: '确定',
      cancellationButtonProps: { color: 'secondary', variant: 'outlined' },
      confirmationButtonProps: { color: 'primary', variant: 'contained' },
    });

    if (!confirmed) {
      console.info('[menu] handleDelete cancelled', reason);
      return;
    }

    await delMenu(row.menuId);
    await getPageList();
    showToast('删除成功', ToastLevelEnum.SUCCESS);
  };

  return (
    <Stack spacing={3}>
      {/* 1.查询条件区域 */}
      <SearchForm fields={searchFields} onSearch={handleSearch} onReset={handleReset} />
      {/* 2.表格上方按钮操作区域 */}
      <ActionButtons onAdd={handleAdd} />
      {/* 3.表格区域 */}
      <MenusTable rows={pageList} onEdit={handleEdit} onDelete={handleDelete} onAdd={handleAdd} dictData={dictData} />
      {/* 4.弹窗组件 */}
      <MenuModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        refreshList={getPageList}
        editData={editData}
        title={editData ? '修改菜单' : '添加菜单'}
        dictData={dictData}
      />
    </Stack>
  );
}
