export const paths = {
  home: '/',
  auth: { signIn: '/auth/sign-in' },
  dashboard: {
    overview: '/system', // 登录后的首页
    account: '/system/user/profile',
  },
  errors: { notFound: '/errors/not-found' },
} as const;
