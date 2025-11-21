'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Tabs,
  Tab,
  Grid,
  Stack,
  Button,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { z as zod } from 'zod';
import { showToast } from '@/utils/toast';
import { ProfileDetailForm } from '@/components/system/user/profile/profile-detail-form';
import { ToastLevelEnum } from '@/enums/toast-level-enum';

interface Props {
  nickName: string;
  phonenumber: string;
  email: string;
  sex: string;
  onProfileChange: (next: { nickName?: string; phonenumber?: string; email?: string; sex?: string }) => void;
  onSaveProfile: () => void;
  onChangePwd: (oldPassword: string, newPassword: string) => Promise<void> | void;
}

// 密码修改表单的 zod schema
const passwordChangeSchema = zod
  .object({
    oldPassword: zod.string().min(1, { message: '请输入旧密码' }).max(20, { message: '密码长度不能超过20位' }),
    newPassword: zod.string().min(6, { message: '新密码长度至少为6位' }).max(20, { message: '密码长度不能超过20位' }),
    confirmPassword: zod.string().min(1, { message: '请确认新密码' }).max(20, { message: '密码长度不能超过20位' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmPassword'],
  });

export function ProfileRightPanel(props: Props): React.JSX.Element {
  const { nickName, phonenumber, email, sex, onProfileChange, onSaveProfile, onChangePwd } = props;

  const [tab, setTab] = React.useState(0);

  // 修改密码本地状态
  const [oldPassword, setOldPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  // 密码显示/隐藏状态
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  // 密码显示/隐藏处理函数
  const handleClickShowOldPassword = () => setShowOldPassword((show) => !show);
  const handleClickShowNewPassword = () => setShowNewPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  // 表单验证错误
  const [errors, setErrors] = React.useState<{
    oldPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const handleSavePwd = async () => {
    // 使用 zod 进行校验
    const result = passwordChangeSchema.safeParse({
      oldPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      // 处理校验错误
      const fieldErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        const path = err.path[0] as keyof typeof fieldErrors;
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // 校验通过，清空错误
    setErrors({});

    try {
      await onChangePwd(oldPassword, newPassword);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('密码修改成功', ToastLevelEnum.SUCCESS);
    } catch (error) {
      // 错误处理由 onChangePwd 内部处理
      console.error('handleSavePwd error:', error);
    }
  };

  // 处理输入变化，清空对应字段的错误
  const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // 限制最大长度为20
    setOldPassword(value);
    if (errors.oldPassword) {
      setErrors((prev) => ({ ...prev, oldPassword: undefined }));
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // 限制最大长度为20
    setNewPassword(value);
    if (errors.newPassword) {
      setErrors((prev) => ({ ...prev, newPassword: undefined }));
    }
    // 如果确认密码已输入，需要重新校验
    if (confirmPassword) {
      const result = passwordChangeSchema.safeParse({
        oldPassword,
        newPassword: value,
        confirmPassword,
      });
      if (result.success) {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
        return;
      }

      const confirmError = result.error.errors.find((err) => err.path[0] === 'confirmPassword');
      if (confirmError) {
        setErrors((prev) => ({ ...prev, confirmPassword: confirmError.message }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 20); // 限制最大长度为20
    setConfirmPassword(value);
    if (errors.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  };

  return (
    <Card>
      <CardHeader title="基本资料" sx={{ color: '#6a6a6c' }} />
      <Divider />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
        <Tab label="基本资料" />
        <Tab label="修改密码" />
      </Tabs>
      <Divider />

      {tab === 0 && (
        <CardContent>
          <ProfileDetailForm
            nickName={nickName}
            phonenumber={phonenumber}
            email={email}
            sex={sex}
            onChange={onProfileChange}
            onSave={onSaveProfile}
          />
        </CardContent>
      )}

      {tab === 1 && (
        <CardContent>
          <Grid container spacing={3}>
            <Grid size={{ md: 12, xs: 12 }}>
              <FormControl fullWidth error={!!errors.oldPassword}>
                <InputLabel htmlFor="outlined-adornment-old-password">旧密码</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-old-password"
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={handleOldPasswordChange}
                  label="旧密码"
                  inputProps={{ maxLength: 20 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showOldPassword ? '隐藏密码' : '显示密码'}
                        onClick={handleClickShowOldPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                        size="small"
                      >
                        {showOldPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.oldPassword && <FormHelperText>{errors.oldPassword}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <FormControl fullWidth error={!!errors.newPassword}>
                <InputLabel htmlFor="outlined-adornment-new-password">新密码</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  label="新密码"
                  inputProps={{ maxLength: 20 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showNewPassword ? '隐藏密码' : '显示密码'}
                        onClick={handleClickShowNewPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                        size="small"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.newPassword && <FormHelperText>{errors.newPassword}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <FormControl fullWidth error={!!errors.confirmPassword}>
                <InputLabel htmlFor="outlined-adornment-confirm-password">确认密码</InputLabel>
                <OutlinedInput
                  id="outlined-adornment-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  label="确认密码"
                  inputProps={{ maxLength: 20 }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showConfirmPassword ? '隐藏密码' : '显示密码'}
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        onMouseUp={handleMouseUpPassword}
                        edge="end"
                        size="small"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.confirmPassword && <FormHelperText>{errors.confirmPassword}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
          <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
            <Button variant="contained" onClick={handleSavePwd}>
              保存
            </Button>
          </Stack>
        </CardContent>
      )}
    </Card>
  );
}
