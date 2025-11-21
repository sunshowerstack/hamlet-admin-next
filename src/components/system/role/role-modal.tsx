'use client';

import React, { useEffect, useState } from 'react';
import { addRole, updateRole } from '@/api/system/role';
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
  FormControlLabel,
  FormLabel,
  IconButton,
  InputLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { DictDataOption } from '@/stores/dict-store';
import { RoleVO } from '@/api/system/role/types';
import { collectIds } from '@/utils/common';
import { MenuTreeOption } from '@/api/system/menu/types';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';

// ------ zod定义区域 start -------
const roleSchema = zod.object({
  roleId: zod.string(),
  roleName: zod.string().min(1, { message: '请输入角色名称' }),
  roleKey: zod.string().min(1, { message: '请输入权限字符' }),
  roleSort: zod.number().min(1, { message: '请输入显示顺序' }),
  status: zod.string(),
  remark: zod.string(),
  menuCheckStrictly: zod.boolean(),
  deptCheckStrictly: zod.boolean(),
  dataScope: zod.string(),
  menuIds: zod.array(zod.string()),
  deptIds: zod.array(zod.string()),
});

type RoleValues = zod.infer<typeof roleSchema>;

const defaultValues = {
  roleId: '',
  roleName: '',
  roleKey: '',
  roleSort: 1,
  status: '0',
  remark: '',
  menuCheckStrictly: true, // 老接口适配，实际没啥用
  deptCheckStrictly: true, // 老接口适配，实际没啥用
  dataScope: '1',
  menuIds: [],
  deptIds: [],
} satisfies RoleValues;
// ------ zod定义区域 end -------

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: RoleVO | null;
  title: string;
  menuOptions: MenuTreeOption[];
  checkedKeys: string[];
  dictData: {
    sys_normal_disable: DictDataOption[];
  };
}

export default function RoleModal({
  open,
  onClose,
  refreshList,
  editData,
  title,
  menuOptions,
  checkedKeys,
  dictData,
}: Props) {
  console.log('[RoleModal] start...');
  // 从props中获取字典数据
  const { sys_normal_disable } = dictData;

  // 利用RHF的 useForm
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RoleValues>({
    defaultValues,
    resolver: zodResolver(roleSchema),
  });
  console.log('[RoleModal] checkedKeys===', checkedKeys);

  // 存储所有菜单id的数组
  const allDeptIds = collectIds(menuOptions);

  console.log('[RoleModal] allDeptIds===', allDeptIds);

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
    // 默认选中菜单树形组件
    setSelectedItems(checkedKeys);
    if (editData) {
      setValue('roleId', editData.roleId + '');
      setValue('roleName', editData.roleName);
      setValue('roleKey', editData.roleKey);
      setValue('roleSort', editData.roleSort || 1);
      setValue('status', editData.status || '0');
      setValue('dataScope', editData.dataScope);
      setValue('remark', editData.remark);
    } else {
      reset(defaultValues);
    }
  }, [editData, open, setValue, reset, checkedKeys]);

  const doSubmit = async (formData: RoleValues) => {
    // 新增提交 或 修改提交
    formData.menuIds = selectedItems;

    console.log('[doSubmit] selectedItems=', selectedItems);
    const res = editData ? await updateRole(formData) : await addRole(formData);
    console.log('[RoleModal] doSubmit res:', res);

    // 刷新表格
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
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography>{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      {/* form表单定义 */}
      <form onSubmit={handleSubmit(doSubmit)}>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 角色名称 */}
            <Controller
              control={control}
              name="roleName"
              render={({ field }) => (
                <FormControl error={Boolean(errors.roleName)} required>
                  <InputLabel>角色名称</InputLabel>
                  <OutlinedInput {...field} label="角色名称" type="text" />
                  {errors.roleName ? <FormHelperText>{errors.roleName.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 权限字符 */}
            <Controller
              control={control}
              name="roleKey"
              render={({ field }) => (
                <FormControl error={Boolean(errors.roleKey)} required>
                  <InputLabel>权限字符</InputLabel>
                  <OutlinedInput {...field} label="权限字符" type="text" />
                  {errors.roleKey ? <FormHelperText>{errors.roleKey.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 显示顺序 */}
            <Controller
              control={control}
              name="roleSort"
              render={({ field }) => (
                <FormControl error={Boolean(errors.roleSort)} required>
                  <InputLabel>显示顺序</InputLabel>
                  <OutlinedInput
                    {...field}
                    label="显示顺序"
                    type="number"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                  {errors.roleSort ? <FormHelperText>{errors.roleSort.message}</FormHelperText> : null}
                </FormControl>
              )}
            />

            {/* 状态 */}
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl component="fieldset">
                  <FormLabel id="status-label">状态</FormLabel>
                  {/* 横方向配置 */}
                  <RadioGroup row {...field}>
                    {sys_normal_disable.map((option) => (
                      <FormControlLabel
                        key={option.value}
                        control={<Radio size="small" />}
                        value={option.value}
                        label={option.label}
                      />
                    ))}
                  </RadioGroup>
                </FormControl>
              )}
            />
            <Box sx={{ gap: 1 }}>
              <FormLabel id="menu-auth-label">菜单权限</FormLabel>
              <Button onClick={handleExpandClick}>{expandedItems.length === 0 ? '展开' : '折叠'}</Button>
              <Button onClick={handleSelectClick}>{selectedItems.length === 0 ? '全选' : '全不选'}</Button>
              <Box
                sx={{
                  maxHeight: 150,
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
                  {renderTree(menuOptions)}
                </SimpleTreeView>
              </Box>
            </Box>
            {/* 备注 */}
            <Controller
              name="remark"
              control={control}
              render={({ field }) => (
                <Box>
                  <FormLabel id="remark-label">备注</FormLabel>
                  <TextField {...field} multiline rows={2} placeholder="请输入备注" fullWidth variant="outlined" />
                </Box>
              )}
            />
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
