'use client';

import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Close, Visibility, VisibilityOff } from '@mui/icons-material';
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
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { addUser, updateUser } from '@/api/system/user';
import { Grid } from '@mui/system';
import { PostVO } from '@/api/system/post/types';
import { RoleVO } from '@/api/system/role/types';
import { DeptVO } from '@/api/system/dept/types';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { UserVO } from '@/api/system/user/types';

// ------ zod定义区域 start -------
// 在组件内部创建动态schema
const createUserSchema = (isAdd: boolean) => {
  console.log('[UserModal] [createUserSchema] isAdd:', isAdd);
  const baseSchema = {
    userId: zod.string(),
    deptId: zod.string(),
    userName: zod.string().min(1, { message: '请输入用户名称' }),
    nickName: zod.string().min(1, { message: '请输入用户昵称' }),
    status: zod.string(),
    phonenumber: zod.string(),
    email: zod.string(),
    sex: zod.string(),
    postIds: zod.array(zod.string()),
    roleIds: zod.array(zod.union([zod.string(), zod.number()])).min(1, { message: '请选择角色' }),
    remark: zod.string(),
  };

  // 只有在新增模式下才要求密码
  if (isAdd) {
    return zod.object({
      ...baseSchema,
      password: zod.string().min(1, { message: '请输入密码' }),
    });
  }

  return zod.object(baseSchema);
};

// type UserValues = zod.infer<typeof userSchema>;

// 不能再用infer，因为password是动态字段
type UserValues = {
  userId: string;
  deptId: string;
  userName: string;
  nickName: string;
  password?: string; // 改为可选字段
  status: string;
  phonenumber: string;
  email: string;
  sex: string;
  postIds: string[];
  roleIds: (string | number)[];
  remark: string;
};

const defaultValues = {
  userId: '',
  deptId: '',
  userName: '',
  nickName: '',
  password: '',
  status: '0',
  phonenumber: '',
  email: '',
  sex: '',
  postIds: [],
  roleIds: [],
  remark: '',
} satisfies UserValues;
// ------ zod定义区域 end -------

interface Props {
  open: boolean;
  onClose: () => void;
  refreshList: () => void;
  editData?: UserVO | null;
  title: string;
  postOptions: PostVO[];
  roleOptions: RoleVO[];
  deptOptions: DeptVO[];
  postIds: string[];
  roleIds: string[];
  dictData: {
    sys_normal_disable: DictDataOption[];
    sys_user_sex: DictDataOption[];
  };
}

export default function UserModal({
  open,
  onClose,
  refreshList,
  editData,
  title,
  postOptions,
  roleOptions,
  deptOptions,
  postIds,
  roleIds,
  dictData,
}: Props) {
  console.log('[UserModal] start...');
  const [isPending, setIsPending] = React.useState<boolean>(false);

  // 密码明密文切换
  const [showPassword, setShowPassword] = React.useState(false);

  // Popover 状态管理
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [popoverOpen, setPopoverOpen] = React.useState(false);

  // 选中的部门状态
  const [selectedDept, setSelectedDept] = React.useState<{ id: string; label: string } | null>(null);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // 从props中获取字典数据
  const { sys_normal_disable, sys_user_sex } = dictData;

  console.log('[UserModal] sys_normal_disable:', sys_normal_disable);

  // 利用RHF的 useForm
  // 在useForm中使用动态schema
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    setValue,
  } = useForm<UserValues>({
    defaultValues,
    resolver: zodResolver(createUserSchema(!editData)),
  });

  // 打印出被校验报错的字端
  console.log('[UserModal] 表单验证状态:', { errors });

  useEffect(() => {
    console.log('[UserModal] editData===', editData);
    if (editData) {
      setValue('userId', editData.userId + '');
      setValue('deptId', editData.deptId + '');
      setValue('userName', editData.userName || '');
      setValue('nickName', editData.nickName || '');
      setValue('status', editData.status || '');
      setValue('phonenumber', editData.phonenumber || '');
      setValue('email', editData.email || '');
      setValue('sex', editData.sex || '');
      setValue('postIds', postIds);
      setValue('roleIds', roleIds);
      setValue('remark', editData.remark || '');
    } else {
      reset(defaultValues);
    }
  }, [editData, open, setValue, reset, postIds, roleIds]);

  const doSubmit = async (formData: UserValues) => {
    console.log('[UserModal] doSubmit start...');
    console.log('[UserModal] formData====', formData);
    setIsPending(true);
    // 新增提交 或 修改提交
    const submitData = {
      ...formData,
      deptId: formData.deptId,
      // roleIds: formData.roleIds.map((id) => String(id)),
      roleIds: formData.roleIds.map(String),
    } as any;
    const res = editData ? await updateUser(submitData) : await addUser(submitData);
    setIsPending(false);

    console.log('[UserModal] doSubmit res:', res);

    // 刷新表格
    refreshList();
    onClose();
  };

  const renderTree = (nodes: any) => (
    <TreeItem
      key={nodes.id}
      itemId={nodes.id}
      label={
        <Box
          onClick={(e) => {
            e.stopPropagation();
            // 选择节点
            setSelectedDept({ id: nodes.id, label: nodes.label });
            setValue('deptId', nodes.id + '');
            setPopoverOpen(false);
            setAnchorEl(null);
          }}
          sx={{
            width: '100%',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {nodes.label}
        </Box>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map((node: any) => renderTree(node)) : null}
    </TreeItem>
  );

  // 处理 Popover 关闭
  const handlePopoverClose = () => {
    setPopoverOpen(false);
    setAnchorEl(null);
  };

  // 初始化选中状态
  useEffect(() => {
    if (editData && editData.deptId) {
      // 根据 deptId 查找对应的部门信息
      const findDeptById = (depts: any[], targetId: number): any => {
        for (const dept of depts) {
          if (dept.id === targetId) {
            return dept;
          }
          if (dept.children) {
            const found = findDeptById(dept.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const foundDept = findDeptById(deptOptions, editData.deptId);
      console.log('[UserModal] foundDept==', foundDept);

      if (foundDept) {
        setSelectedDept({ id: foundDept.id, label: foundDept.label });
      }
    } else {
      setSelectedDept(null);
    }
  }, [editData, deptOptions]);
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
          <Grid container spacing={3}>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              {/* 用户昵称 */}
              <Controller
                control={control}
                name="nickName"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.nickName)} fullWidth required>
                    <InputLabel size="small">用户昵称</InputLabel>
                    <OutlinedInput {...field} label="nickName" type="text" size="small" />
                    {errors.nickName ? <FormHelperText>{errors.nickName.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                control={control}
                name="deptId"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.deptId)} fullWidth required>
                    {/* <InputLabel size="small">归属部门</InputLabel> */}
                    <Box
                      sx={{
                        border: '1px solid #d0d7de',
                        borderRadius: 1,
                        minHeight: 40,
                        display: 'flex',
                        alignItems: 'center',
                        px: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: '#4096ff',
                        },
                      }}
                      onClick={(e) => {
                        const target = e.currentTarget;
                        setAnchorEl(target);
                        setPopoverOpen(true);
                      }}
                    >
                      <Typography variant="body2" color={selectedDept ? 'text.primary' : 'text.secondary'}>
                        {selectedDept ? selectedDept.label : '归属部门'}
                      </Typography>
                    </Box>
                    <Popover
                      open={popoverOpen}
                      anchorEl={anchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                      PaperProps={{
                        sx: {
                          maxHeight: 300,
                          overflow: 'auto',
                          minWidth: 200,
                          mt: 0.5,
                        },
                      }}
                    >
                      <Paper sx={{ p: 1 }}>
                        <SimpleTreeView
                          sx={{
                            '& .MuiTreeItem-content': {
                              padding: '4px 8px',
                            },
                          }}
                        >
                          {renderTree(deptOptions[0])}
                        </SimpleTreeView>
                      </Paper>
                    </Popover>
                  </FormControl>
                )}
              />
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                control={control}
                name="phonenumber"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.phonenumber)} fullWidth>
                    <InputLabel size="small">手机号码</InputLabel>
                    <OutlinedInput {...field} label="phonenumber" type="text" size="small" />
                    {errors.phonenumber ? <FormHelperText>{errors.phonenumber.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <FormControl error={Boolean(errors.email)} fullWidth>
                    <InputLabel size="small">邮箱</InputLabel>
                    <OutlinedInput {...field} label="email" type="text" size="small" />
                    {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                  </FormControl>
                )}
              />
            </Grid>
            {/* 用户名，密码 修改场景不显示 */}
            {editData ? null : (
              <>
                <Grid
                  size={{
                    md: 6,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="userName"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.userName)} fullWidth required>
                        <InputLabel size="small">用户名称</InputLabel>
                        <OutlinedInput {...field} label="userName" type="text" size="small" />
                        {errors.userName ? <FormHelperText>{errors.userName.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    md: 6,
                    xs: 12,
                  }}
                >
                  <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormControl error={Boolean(errors.password)} fullWidth required>
                        <InputLabel size="small">用户密码</InputLabel>
                        {/* <OutlinedInput {...field} label="password" type="password" size="small" /> */}
                        <OutlinedInput
                          {...field}
                          id="outlined-adornment-password"
                          type={showPassword ? 'text' : 'password'}
                          label="Password"
                          size="small"
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label={showPassword ? 'hide the password' : 'display the password'}
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                onMouseUp={handleMouseUpPassword}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                        {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
                      </FormControl>
                    )}
                  />
                </Grid>
              </>
            )}
            {/* 用户性别 */}
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                name="sex"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.sex}>
                    <InputLabel size="small">用户性别</InputLabel>
                    <Select {...field} label="用户性别" size="small">
                      {sys_user_sex.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.sex && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.sex.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            {/* 状态 */}
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <FormControl component="fieldset">
                    {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      状态
                    </Typography> */}
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
            </Grid>
            {/* 岗位 */}
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                name="postIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.postIds}>
                    <InputLabel size="small">岗位</InputLabel>
                    <Select {...field} label="岗位" size="small">
                      {postOptions?.map((option) => (
                        <MenuItem key={option.postId} value={option.postId}>
                          {option.postName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.postIds && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.postIds.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            {/* 角色 */}
            <Grid
              size={{
                md: 6,
                xs: 12,
              }}
            >
              <Controller
                name="roleIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.roleIds} required>
                    <InputLabel size="small">角色</InputLabel>
                    <Select {...field} label="角色" size="small" multiple>
                      {roleOptions.map((option) => (
                        <MenuItem key={option.roleId} value={option.roleId}>
                          {option.roleName}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.roleIds && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
                        {errors.roleIds.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
            {/* 备注 */}
            <Grid
              size={{
                md: 12,
                xs: 12,
              }}
            >
              <Controller
                name="remark"
                control={control}
                render={({ field }) => (
                  <Box>
                    {/* <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      备注
                    </Typography> */}
                    <TextField
                      {...field}
                      multiline
                      rows={4}
                      label="备注"
                      placeholder="请输入备注"
                      fullWidth
                      variant="outlined"
                    />
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button size="small" onClick={onClose} variant="outlined">
            取消
          </Button>
          <Button disabled={isPending} size="small" type="submit" variant="contained">
            确定
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
