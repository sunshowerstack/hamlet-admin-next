import * as React from 'react';
import type { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { AuthGuard } from '@/components/auth/auth-guard';
import { MainNav } from '@/components/system/layout/main-nav';
import { SideTreeNav } from '@/components/system/layout/side-tree-nav';
import TabBar from '@/components/common/tab-bar';
import TabContent from '@/components/common/tab-content';
import { config } from '@/config';

export const metadata = { title: `首页 - ${config.site.name}` } satisfies Metadata;

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  console.log('[dashbord] Layout start...');
  return (
    <AuthGuard>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--MainNav-zIndex': 1000,
            '--SideNav-width': '200px',
            '--SideNav-zIndex': 1100,
            '--MobileNav-width': '200px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: '100%',
        }}
      >
        {/* 左侧菜单导航 */}
        <SideTreeNav />
        {/* <div
          dangerouslySetInnerHTML={{
            __html: `<!-- -------- SideTreeNav -------- start -->`,
          }}
        /> */}
        <Box sx={{ display: 'flex', flex: '1 1 auto', flexDirection: 'column', pl: { lg: 'var(--SideNav-width)' } }}>
          {/* 主区域top部分的导航 */}
          <MainNav />
          <main>
            {/* 【搜索条件+表格】区域的上下padding为32 */}
            <Container maxWidth="xl" sx={{ pb: '20px' }}>
              {/* 不再依赖next.js的默认的路由布局嵌套 */}
              {/* {children}*/}
              <TabBar /> {/* 顶部 Tab 栏 */}
              <TabContent /> {/* Tab 对应的页面内容 */}
            </Container>
          </main>
        </Box>
      </Box>
    </AuthGuard>
  );
}
