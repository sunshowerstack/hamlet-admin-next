'use client';
import React, { useMemo, useRef, Suspense, lazy } from 'react';
import { useTabsStore } from '@/stores/tabs-store';
import { CircularProgress, Box } from '@mui/material';

// 懒加载页面组件（根据 pathname 匹配组件路径）
const getPageComponent = (pathname: string) => {
  console.log('[TabContent] getPageComponent() start');
  console.log('[TabContent] getPageComponent() pathname:', pathname);

  // 约定：path部分"/dashboard/"后面的即为模块名: TODO: 待考虑带参数情况
  const moduleName = pathname.slice('/system/'.length);

  // 这里的手动import和next.js里的router.push后默认的导入行为区别在哪里？
  if (!moduleName) {
    // 为空即视作dashboard首页
    return lazy(() => import(`@/app/system/page`));
  }
  // 要用模板字符串，并且避免特殊字符出现在变量里：防止找不到模块的错误："Cannot find module xxx"
  return lazy(() => import(`@/app/system/${moduleName}/page`));
};

export default function TabContent() {
  console.log('[TabContent] start...');

  // const { tabs, activeKey } = useTabsStore();
  // 【优化】选择器方式
  const tabs = useTabsStore((state) => state.tabs);
  const activeKey = useTabsStore((state) => state.activeKey);
  const componentCache = useRef<Record<string, React.ReactNode>>({});

  // 生成（或复用）所有已打开 Tab 的组件，并保持挂载
  const tabPanels = useMemo(() => {
    return tabs.map((tab) => {
      const { key, pathname, searchParams } = tab;
      if (!componentCache.current[key]) {
        const PageComponent = getPageComponent(pathname);
        const WrappedComponent = () => <PageComponent searchParams={searchParams} />;
        const CachedComponent = React.memo(WrappedComponent);
        componentCache.current[key] = (
          <Suspense
            fallback={
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            }
          >
            <CachedComponent />
          </Suspense>
        );
      }
      // 是否是激活的tabkey
      const isActive = key === activeKey;
      return (
        // 样式控制组件显示或隐藏
        <Box key={key} sx={{ display: isActive ? 'block' : 'none', width: '100%' }}>
          {componentCache.current[key]}
        </Box>
      );
    });
  }, [tabs, activeKey]);

  return <Box sx={{ width: '100%' }}>{tabPanels}</Box>;
}
