'use client';

import React, { useEffect, useState } from 'react';
import { addMenu, updateMenu, treeselect } from '@/api/system/menu';
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
  IconButton,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Grid,
} from '@mui/material';

import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { DictDataOption } from '@/stores/dict-store';
import { MenuVO, MenuForm, MenuTreeOption } from '@/api/system/menu/types';
import { MenuTypeEnum } from '@/enums/menu-type-enum';

// ------ zod定义区域 start -------
const menuSchema = zod.object({
  menuName: zod.string().min(1, { message: '请输入菜单名称' }),
  parentId: zod.union([zod.string(), zod.number()]).optional(),
  orderNum: zod.number().min(0, { message: '排序不能小于0' }),
  path: zod.string().min(1, { message: '请输入路由地址' }),
  component: zod.string().optional(),
  perms: zod.string().optional(),
  menuType: zod.nativeEnum(MenuTypeEnum, { message: '请选择菜单类型' }),
  visible: zod.string().optional(),
  status: zod.string().optional(),
  icon: zod.string().optional(),
  isFrame: zod.string().optional(),
  remark: zod.string().optional(),
  menuId: zod.union([zod.string(), zod.number()]).optional(),
});

type MenuValues = zod.infer<typeof menuSchema>;

const defaultValues = {
  menuName: '',
  parentId: 0,
  orderNum: 0,
  path: '',
  component: '',
  perms: '',
  menuType: MenuTypeEnum.M,
  visible: '0',
  status: '0',
  icon: '',
  isFrame: '1',
  remark: '',
  menuId: '',
} satisfies MenuValues;
// ------ zod定义区域 end -------

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: MenuVO | null;
  title: string;
  dictData: {
    sys_normal_disable: DictDataOption[];
    sys_show_hide: DictDataOption[];
  };
}

export default function MenuModal({ open, onClose, refreshList, editData, title, dictData }: Props) {
  console.log('[MenuModal] start...');
  // 从props中获取字典数据
  const { sys_normal_disable, sys_show_hide } = dictData;

  // 菜单树选项
  const [menuTreeOptions, setMenuTreeOptions] = useState<MenuTreeOption[]>([]);

  // 利用RHF的 useForm
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MenuValues>({
    defaultValues,
    resolver: zodResolver(menuSchema),
  });

  // 监听菜单类型变化
  const menuType = watch('menuType');

  // 获取菜单树选项
  useEffect(() => {
    const getMenuTreeOptions = async () => {
      try {
        const { data } = await treeselect();
        setMenuTreeOptions(data);
      } catch (error) {
        console.error('获取菜单树选项失败:', error);
      }
    };
    if (open) {
      getMenuTreeOptions();
    }
  }, [open]);

  useEffect(() => {
    if (editData) {
      setValue('menuId', editData.menuId);
      setValue('menuName', editData.menuName || '');
      setValue('parentId', editData.parentId || 0);
      setValue('orderNum', editData.orderNum || 0);
      setValue('path', editData.path || '');
      setValue('component', editData.component || '');
      setValue('perms', editData.perms || '');
      setValue('menuType', editData.menuType || MenuTypeEnum.M);
      setValue('visible', editData.visible || '0');
      setValue('status', editData.status || '0');
      setValue('icon', editData.icon || '');
      setValue('isFrame', editData.isFrame || '1');
      setValue('remark', editData.remark || '');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, setValue, reset]);

  const doSubmit = async (formData: MenuValues) => {
    try {
      // 新增提交 或 修改提交
      const res = editData ? await updateMenu(formData) : await addMenu(formData);
      console.log('[MenuModal] doSubmit res:', res);

      // 刷新表格
      refreshList();
      onClose();
    } catch (error) {
      console.error('提交失败:', error);
    }
  };

  // 构建菜单树选项
  const buildMenuTreeOptions = (options: MenuTreeOption[], level = 0): MenuTreeOption[] => {
    return options.map((option) => ({
      ...option,
      label: '　'.repeat(level) + option.label,
      children: option.children ? buildMenuTreeOptions(option.children, level + 1) : undefined,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
            <Grid container spacing={2}>
              {/* 上级菜单 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="parentId"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>上级菜单</InputLabel>
                      <Select {...field} label="上级菜单">
                        <MenuItem value={0}>主类目</MenuItem>
                        {buildMenuTreeOptions(menuTreeOptions).map((option) => (
                          <MenuItem key={option.id} value={option.id}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 菜单类型 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name="menuType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.menuType} required>
                      <InputLabel>菜单类型</InputLabel>
                      <Select {...field} label="菜单类型">
                        <MenuItem value={MenuTypeEnum.M}>目录</MenuItem>
                        <MenuItem value={MenuTypeEnum.C}>菜单</MenuItem>
                        <MenuItem value={MenuTypeEnum.F}>按钮</MenuItem>
                      </Select>
                      {errors.menuType && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                          {errors.menuType.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 菜单图标 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="icon"
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>菜单图标</InputLabel>
                      <OutlinedInput
                        {...field}
                        label="菜单图标"
                        placeholder="点击选择图标"
                        startAdornment={
                          field.value ? (
                            <Box component="span" sx={{ mr: 1, color: 'text.secondary', fontSize: '14px' }}>
                              {field.value === 'system' ? '⚙️' : field.value}
                            </Box>
                          ) : null
                        }
                        endAdornment={
                          <Box component="span" sx={{ color: 'text.secondary', cursor: 'pointer' }}>
                            ▼
                          </Box>
                        }
                      />
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 菜单名称 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="menuName"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.menuName)} required>
                      <InputLabel>* 菜单名称</InputLabel>
                      <OutlinedInput {...field} label="* 菜单名称" type="text" placeholder="请输入菜单名称" />
                      {errors.menuName ? <FormHelperText>{errors.menuName.message}</FormHelperText> : null}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 显示排序 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="orderNum"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.orderNum)} required>
                      <InputLabel>* 显示排序</InputLabel>
                      <OutlinedInput {...field} label="* 显示排序" type="number" />
                      {errors.orderNum ? <FormHelperText>{errors.orderNum.message}</FormHelperText> : null}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 是否外链 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name="isFrame"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset">
                      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        ● 是否外链
                        <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                          ?
                        </Box>
                      </Typography>
                      <RadioGroup row {...field}>
                        <FormControlLabel value="1" control={<Radio />} label="是" />
                        <FormControlLabel value="0" control={<Radio />} label="否" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 路由地址 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="path"
                  render={({ field }) => (
                    <FormControl error={Boolean(errors.path)} required>
                      <InputLabel>* ● 路由地址</InputLabel>
                      <OutlinedInput {...field} label="* ● 路由地址" type="text" placeholder="请输入路由地址" />
                      {errors.path ? <FormHelperText>{errors.path.message}</FormHelperText> : null}
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 权限标识 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="perms"
                  render={({ field }) => (
                    <FormControl>
                      <InputLabel>权限标识</InputLabel>
                      <OutlinedInput {...field} label="权限标识" type="text" placeholder="请输入权限标识" />
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 组件路径 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="component"
                  render={({ field }) => (
                    <FormControl>
                      <InputLabel>组件路径</InputLabel>
                      <OutlinedInput {...field} label="组件路径" type="text" placeholder="请输入组件路径" />
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 显示状态 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name="visible"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset">
                      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        ● 显示状态
                        <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                          ?
                        </Box>
                      </Typography>
                      <RadioGroup row {...field}>
                        <FormControlLabel value="0" control={<Radio />} label="显示" />
                        <FormControlLabel value="1" control={<Radio />} label="隐藏" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 菜单状态 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl component="fieldset">
                      <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                        ● 菜单状态
                        <Box component="span" sx={{ ml: 0.5, color: 'text.secondary' }}>
                          ?
                        </Box>
                      </Typography>
                      <RadioGroup row {...field}>
                        <FormControlLabel value="0" control={<Radio />} label="正常" />
                        <FormControlLabel value="1" control={<Radio />} label="停用" />
                      </RadioGroup>
                    </FormControl>
                  )}
                />
              </Grid>

              {/* 备注 */}
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Controller
                  control={control}
                  name="remark"
                  render={({ field }) => (
                    <TextField {...field} multiline rows={3} placeholder="请输入备注" fullWidth variant="outlined" />
                  )}
                />
              </Grid>
            </Grid>
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
