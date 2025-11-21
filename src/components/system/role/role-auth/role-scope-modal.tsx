'use client';

import React, { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Close } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { z as zod } from 'zod';

import { DeptTreeOption, RoleVO } from '@/api/system/role/types';
import { dataScope } from '@/api/system/role';
import { showToast } from '@/utils/toast';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { collectIds } from '@/utils/common';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

/** 数据范围选项*/
const dataScopeOptions: Array<{ value: string; label: string }> = [
  { value: '1', label: '全部数据权限' },
  { value: '2', label: '自定义数据权限' },
  { value: '3', label: '本部门数据权限' },
  { value: '4', label: '本部门及以下数据权限' },
  { value: '5', label: '仅本人数据权限' },
];

const schema = zod.object({
  // 页面不可见，表单提交时候必须.用optional()来规避number类型的初始值问题
  roleId: zod.string().min(1, { message: '请输入角色id' }),
  roleName: zod.string().min(1, { message: '请输入角色名称' }),
  roleKey: zod.string().min(1, { message: '请输入权限字符' }),
  dataScope: zod.string().min(1, { message: '请输入权限范围' }),
});

type FormValues = zod.infer<typeof schema>;

const defaultValues: FormValues = {
  roleId: '',
  roleName: '',
  roleKey: '',
  dataScope: '',
};

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: RoleVO | null;
  title: string;
  deptOptions: DeptTreeOption[];
  checkedKeys: string[]; // 接口返回数据
}

/**
 * 数据权限分配弹窗页面
 *
 * 注意：
 * 1.【自定义数据权限】场景，展示部门树形选择框，默认显示和手动选择的都是通过state变量selectedItems控制
 * 2. 属性选择框不用像text框之类的用<Controller>之类的来包装
 * 3. 监控表单字段【权限范围】需要使用到useWatch，其他字段同理
 */
export default function RoleScopeModal({
  open,
  onClose,
  refreshList,
  editData,
  title,
  deptOptions,
  checkedKeys,
}: Props) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  // 使用 useWatch 监听某个字段的变化
  const watchedValue = useWatch({
    control, // 来自上面的定义
    name: 'dataScope', // 监听的字段名称
  });

  // 存储所有部门id的数组
  // eg：['100', '101', '103', '104', '105', '106', '107', '102', '108', '109']
  // 使用 useMemo 缓存，避免每次渲染都重新计算，防止 useEffect 死循环
  const allDeptIds = useMemo(() => collectIds(deptOptions), [deptOptions]);

  console.log('[RoleScopeModal] allDeptIds===', allDeptIds);

  // 【自定义数据权限】的场景使用
  // 展开的项目: 注意：必须定义为string类型，因为SimpleTreeView的组件定义的expandedItems属性就是string[]
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  // 选中的项目
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

  const handleExpandedItemsChange = (event: React.SyntheticEvent | null, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  const handleExpandClick = () => {
    // 展开或收缩
    setExpandedItems((oldExpanded) => (oldExpanded.length === 0 ? allDeptIds : []));
  };

  const handleSelectedItemsChange = (event: React.SyntheticEvent | null, ids: string[]) => {
    setSelectedItems(ids);
  };

  const handleSelectClick = () => {
    setSelectedItems((oldSelected) => (oldSelected.length === 0 ? allDeptIds : []));
  };

  useEffect(() => {
    // 默认展开
    setExpandedItems(allDeptIds);
    // 默认选中的值
    console.log('[RoleScopeModal] checkedKeys====', checkedKeys);
    setSelectedItems(checkedKeys);
    if (editData) {
      setValue('roleId', editData.roleId + ''); // roleId定义：string ｜ number，一致转string
      setValue('roleName', editData.roleName as any);
      setValue('roleKey', editData.roleKey || '');
      setValue('dataScope', editData.dataScope || '');
    } else {
      reset(defaultValues);
    }
    // 如果allDeptIds不利用useMemo缓存，依赖数组里只要加入allDeptIds就会导致死循环（checkedKeys没事）
  }, [editData, open, reset, setValue, checkedKeys, allDeptIds]);

  // 提交处理
  const doSubmit = async (formData: FormValues) => {
    console.log('[doSubmit] formData:', formData);
    console.log('[doSubmit] selectedItems:', selectedItems);
    const payload = { ...formData } as any;
    // 选择【自定义数据权限】时，要支持树形选择
    // form.value.deptIds = getDeptAllCheckedKeys();
    // 勾选上的部门，这里比element方便
    payload.deptIds = selectedItems;
    // element里还需要把半选中的值也加上，比如：父级100，子级101，102，103，现在勾选了101，那要把100也带上
    console.log('[doSubmit] payload:', payload);

    await dataScope(payload);
    showToast('修改成功', ToastLevelEnum.SUCCESS);
    refreshList();
    onClose();
  };

  // 渲染树结构
  const renderTree = (nodes: any) => {
    if (!Array.isArray(nodes)) return null;

    return nodes.map((node) => {
      const itemId = node.id + '';
      // 是否有子项
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;

      if (hasChildren) {
        return (
          // 保证1级菜单的文字和2级菜单的文字大小一致:body2 为13px
          <TreeItem key={itemId} itemId={itemId} label={<Typography variant="body2">{node.label}</Typography>}>
            {renderTree(node.children)}
          </TreeItem>
        );
      }

      return (
        <TreeItem
          key={itemId}
          itemId={itemId}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">{node.label}</Typography>
            </Box>
          }
        />
      );
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>{title}</Typography>
        <IconButton aria-label="close" onClick={onClose} sx={{ color: (theme) => theme.palette.grey[500] }}>
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit(doSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              control={control}
              name="roleId"
              render={({ field }) => (
                <FormControl error={Boolean(errors.roleId)} required>
                  <InputLabel>角色id</InputLabel>
                  <OutlinedInput {...field} label="角色名称" type="text" placeholder="请输入角色id" disabled />
                  {errors.roleId ? <FormHelperText>{errors.roleId.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="roleName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.roleName)} required>
                  <InputLabel>角色名称</InputLabel>
                  <OutlinedInput {...field} label="角色名称" type="text" placeholder="请输入角色名称" disabled />
                  {errors.roleName ? <FormHelperText>{errors.roleName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            <Controller
              control={control}
              name="roleKey"
              render={({ field }) => (
                <FormControl error={Boolean(errors.roleKey)} required>
                  <InputLabel>权限字符</InputLabel>
                  <OutlinedInput {...field} label="权限字符" type="text" placeholder="请输入权限字符" disabled />
                  {errors.roleKey ? <FormHelperText>{errors.roleKey.message}</FormHelperText> : null}
                </FormControl>
              )}
            />
            <Controller
              name="dataScope"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth error={!!errors.dataScope}>
                  <InputLabel size="small">权限范围</InputLabel>
                  <Select {...field} label="权限范围" size="small">
                    {dataScopeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.dataScope && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                      {errors.dataScope.message}
                    </Typography>
                  )}
                </FormControl>
              )}
            />
            {/* 【自定义数据权限】的场景 */}
            {watchedValue === '2' ? (
              <Box sx={{ gap: 1 }}>
                <FormLabel id="scope-label">数据权限</FormLabel>
                <Button onClick={handleExpandClick}>{expandedItems.length === 0 ? '展开' : '折叠'}</Button>
                <Button onClick={handleSelectClick}>{selectedItems.length === 0 ? '全选' : '全不选'}</Button>
                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    border: '1px solid #eee',
                    p: 1,
                  }}
                >
                  <SimpleTreeView
                    expandedItems={expandedItems}
                    onExpandedItemsChange={handleExpandedItemsChange}
                    selectedItems={selectedItems}
                    onSelectedItemsChange={handleSelectedItemsChange}
                    onItemClick={(_, itemId) => {}}
                    multiSelect
                    checkboxSelection
                  >
                    {renderTree(deptOptions)}
                  </SimpleTreeView>
                </Box>
              </Box>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={onClose} variant="outlined">
            取消
          </Button>
          <Button size="small" type="submit" variant="contained">
            确定
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
