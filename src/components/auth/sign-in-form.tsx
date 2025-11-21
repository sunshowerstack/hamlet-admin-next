'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';

import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';
import { getCodeImg } from '@/api/login';
import { Box } from '@mui/material';
import { to } from 'await-to-js';
import { LoginData } from '@/api/types';

const loginSchema = zod.object({
  tenantId: zod.string(),
  username: zod.string().min(1, { message: '请输入账号' }),
  password: zod.string().min(1, { message: '请输入密码' }),
  rememberMe: zod.boolean(),
  code: zod.string().min(1, { message: '请输入验证码' }),
  // uuid:  zod.string(),
  clientId: zod.string(),
  grantType: zod.string(),
});

type LoginValues = zod.infer<typeof loginSchema>;

const defaultValues = {
  tenantId: '000000',
  username: 'admin',
  password: '',
  rememberMe: false,
  code: '',
  // uuid:'',
  clientId: '',
  grantType: '',
} satisfies LoginValues;

export function SignInForm(): React.JSX.Element {
  const router = useRouter();

  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>();

  const [isPending, setIsPending] = React.useState<boolean>(false);

  // 验证码图片
  const [captcha, setCaptcha] = React.useState<string>();
  const [uuid, setUuid] = React.useState<string>();

  React.useEffect(() => {
    console.log('[SignInForm] useEffect() start...');
    // 获取验证码code
    getCode();
  }, []);

  // 利用RHF的 useForm
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({ defaultValues, resolver: zodResolver(loginSchema) });

  const onSubmit = React.useCallback(
    async (loginValues: LoginValues): Promise<void> => {
      setIsPending(true);

      // 登录提交
      // const { error } = await authClient.signInWithPassword(loginValues);

      // 提交时合并数据
      const completeData: LoginData = {
        ...loginValues,
        uuid: uuid || '',
      };

      console.log('completeData===', completeData);

      // 调用action的登录方法
      const [err] = await to(authClient.signInWithPassword(completeData));

      if (err) {
        console.log('err===', err);
        // loading.value = false;
        setError('root', { type: 'server', message: err.message });
        setIsPending(false);

        // 重新获取验证码 TODO:
        // if (captchaEnabled.value) {
        await getCode();
        // }
      }

      // Refresh the auth state
      await checkSession?.();

      // UserProvider, for this case, will not refresh the router
      // After refresh, GuestGuard will handle the redirect
      router.refresh();
    },
    [checkSession, router, setError, uuid]
  );

  /**
   * 获取验证码
   */
  const getCode = async () => {
    const res = await getCodeImg();
    console.log('res====', res);
    const { data } = res;
    const captchaEnabled = data.captchaEnabled === undefined ? true : data.captchaEnabled;
    if (captchaEnabled) {
      setCaptcha('data:image/gif;base64,' + data.img);
      // uuid提交表单时候需要，页面不展示
      setUuid(data.uuid);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4">管理系统</Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <FormControl error={Boolean(errors.username)}>
                <InputLabel>账号</InputLabel>
                <OutlinedInput {...field} label="username" type="text" />
                {errors.username ? <FormHelperText>{errors.username.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel>密码</InputLabel>
                <OutlinedInput
                  {...field}
                  endAdornment={
                    showPassword ? (
                      <EyeIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(false);
                        }}
                      />
                    ) : (
                      <EyeSlashIcon
                        cursor="pointer"
                        fontSize="var(--icon-fontSize-md)"
                        onClick={(): void => {
                          setShowPassword(true);
                        }}
                      />
                    )
                  }
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {/* 验证码区域 */}
          <Box display="flex" alignItems="center" justifyContent="space-between">
            {/* 验证码输入框 */}
            <Controller
              control={control}
              name="code"
              render={({ field }) => (
                <FormControl error={Boolean(errors.code)} sx={{ flex: 1, marginRight: 2 }}>
                  <InputLabel>验证码</InputLabel>
                  <OutlinedInput {...field} label="验证码" />
                </FormControl>
              )}
            />
            {/* 验证码图片 */}
            <Box
              component="img"
              src={captcha}
              alt="验证码图片"
              sx={{
                width: 100,
                height: 38,
                cursor: 'pointer',
                borderRadius: 1, // 圆角
              }}
              onClick={getCode}
            />
          </Box>
          {/* 验证码错误信息 */}
          {errors.code ? (
            <FormHelperText error={true} sx={{ marginTop: -1 }}>
              {errors.code.message}
            </FormHelperText>
          ) : null}
          {/* <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              忘记密码?
            </Link>
          </div> */}
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            登录
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
