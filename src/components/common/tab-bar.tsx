'use client';
// App Router 中客户端组件需加此标识
import React, { useEffect } from 'react';
import { Tabs, Tab, Box, Tooltip, Typography } from '@mui/material';
import { TabItem, useTabsStore } from '@/stores/tabs-store';

import { usePathname, useSearchParams } from 'next/navigation';
import { Close } from '@mui/icons-material';
// import { useRouter } from 'next/navigation';
import { useSidebarRouterStore } from '@/stores/sidebar-router-store';

export default function TabBar() {
  const { sideRouters, getRouterItem } = useSidebarRouterStore();

  console.log('[TabBar] start..');
  const { tabs, activeKey, switchTab, closeTab, generateKey, addTab } = useTabsStore();

  console.log('[TabBar] activeKey ===', activeKey);
  console.log('[TabBar] tabs ===', tabs);

  // const router = useRouter();

  const pathname = usePathname(); // 当前路由路径
  const searchParams = useSearchParams(); // 当前路由参数
  console.log('[TabBar] pathname:', pathname);

  // 监听路由变化：首次进入页面或直接修改地址栏时，自动添加 Tab
  useEffect(() => {
    console.log('[TabBar] useEffect() no1...');
    console.log('[TabBar] sideRouters====', sideRouters);
    if (!sideRouters || sideRouters.length === 0) {
      return;
    }

    const currentSearch = searchParams.toString();
    console.log('[TabBar] currentSearch:', currentSearch);

    const currentKey = generateKey(pathname, currentSearch);

    let currentTitle;
    if (pathname === '/system') {
      currentTitle = '首页';
    } else if (pathname === '/system/user/profile') {
      currentTitle = '个人中心';
    } else if (pathname === '/system/dict/dict-data') {
      currentTitle = '字典数据';
    } else if (pathname === '/system/user/user-auth') {
      // 用户管理里分配角色
      currentTitle = '分配角色';
    } else if (pathname === '/system/role/role-auth') {
      // 角色管理里分配用户
      currentTitle = '分配用户';
    } else if (pathname === '/system/oss/config') {
      // 文件管理里配置OSS
      currentTitle = '文件配置';
    } else {
      // 路径抹除'/sytem/'（ 比如'/sytem/user'  -->  'user'）
      const moduleName = pathname.slice('/system/'.length);
      const tab = getRouterItem(moduleName);
      currentTitle = tab.meta?.title;
    }
    console.log('[TabBar] currentTitle:', currentTitle);

    addTab({ pathname, searchParams: currentSearch, title: currentTitle });
  }, [pathname, searchParams, addTab, generateKey, sideRouters, getRouterItem]);

  // 地址栏同步逻辑已移动到 tabs-store 的 switchTab/closeTab 中

  // 浏览器重新路由，地址栏地址也需要动态切换，只是state改变的重新渲染地址栏不会改变
  const closeCurrentTab = (tabKey: string) => {
    closeTab(tabKey);

    // 【注意】 不能在这里router.push，还是有异步问题，拿不到state已经被异步更新的activeKey
    // 还是通过新加一个useEffect来监听activeKey的变化，来重新加载路由。切换tab同理。
    // router.push(`${tab.pathname}?${tab.searchParams}`);
  };

  // 渲染 Tab 内容（带关闭按钮）
  const renderTab = (tab: TabItem) => (
    <Tab
      key={tab.key}
      value={tab.key}
      sx={{
        minWidth: 'auto',
        px: 1,
        py: 1, // 减少上下内边距（默认是 12px，这里改为 8px）
        minHeight: '32px', // 减小 Tab 的最小高度
      }}
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">{tab.title}</Typography>
          {tab.key === '/system' ? null : (
            <Box
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation(); // 防止事件冒泡触发Tab切换
                closeCurrentTab(tab.key);
              }}
              sx={{
                p: 0.5,
                alignItems: 'center', // 垂直居中x图标
                display: 'flex', // 垂直居中x图标
                borderRadius: '50%',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.1)',
                },
              }}
            >
              <Close sx={{ fontSize: 14 }} />
            </Box>
          )}
        </Box>
      }
    />
  );

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={activeKey}
        onChange={(_, newValue) => switchTab(newValue as string)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: '32px', // 减小tabs的最小高度
        }}
      >
        {tabs.map((tab) => renderTab(tab))}
      </Tabs>
    </Box>
  );
}
