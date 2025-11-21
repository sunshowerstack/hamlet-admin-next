'use client';
import React, { useState, useEffect } from 'react';

import RouterLink from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { paths } from '@/paths';
import { navIcons } from './nav-icons';

import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { useSidebarRouterStore } from '@/stores/sidebar-router-store';
import { useTabsStore } from '@/stores/tabs-store';
import { HouseIcon } from '@phosphor-icons/react/dist/ssr';

export function SideTreeNav(): React.JSX.Element {
  const router = useRouter();

  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  // const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const { fetchRouters, sideRouters } = useSidebarRouterStore();
  // const { tabs, activeKey, switchTab, closeTab, generateKey, addTab } = useTabsStore();
  // 【优化】选择器方式获取store里的成员，不监视整个store
  const tabs = useTabsStore((state) => state.tabs);
  const switchTab = useTabsStore((state) => state.switchTab);

  // 监听分页参数变化，重新查询数据
  useEffect(() => {
    console.log('[SideTreeNav] useEffect start...');
    // 触发获取路由数据到state
    fetchRouters();
  }, [fetchRouters]);

  // 点击左侧菜单，跳转路由（触发 TabBar 的 useEffect 自动添加 Tab）
  const handleMenuClick = (itemId: string) => {
    console.log('[handleMenuClick]  itemId:', itemId);
    if (!itemId.startsWith('route:')) {
      return;
    }
    const routePath = itemId.slice('route:'.length);
    console.log('[handleMenuClick]  routePath:', routePath);
    if (!routePath) {
      return;
    }
    router.push(routePath);

    const tabKey = routePath + '?';

    // 切换tab， 在TabBar.tsx里监听activeKey变化，执行router.push
    const tab = tabs.find((item) => item.key === tabKey);
    if (tab) {
      switchTab(tabKey);
    }
  };

  return (
    <Box
      sx={{
        '--SideNav-background': 'var(--mui-palette-neutral-950)',
        '--SideNav-color': 'var(--mui-palette-common-white)',
        '--NavItem-color': 'var(--mui-palette-neutral-300)',
        '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
        '--NavItem-active-background': 'var(--mui-palette-primary-main)',
        '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
        '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
        '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
        '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        left: 0,
        maxWidth: '100%',
        position: 'fixed',
        scrollbarWidth: 'none',
        top: 0,
        width: 'var(--SideNav-width)',
        zIndex: 'var(--SideNav-zIndex)',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {/* minHeight 最小高度为64 */}
      <Stack spacing={2} sx={{ p: 2, minHeight: '64px' }}>
        <Box component={RouterLink} href={paths.home} sx={{ textDecoration: 'none', color: 'white' }}>
          <Typography>管理系统</Typography>
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        <SimpleTreeView
          expandedItems={expandedItems}
          onItemExpansionToggle={(event: React.SyntheticEvent | null, itemId: string, isExpanded: boolean) => {
            // // 实现手风琴效果：只展开当前项，关闭其他项
            // setExpandedItems(isExpanded ? [itemId] : []);
            if (isExpanded) {
              // 展开当前项，关闭同级项
              const currentLevel = itemId.split('/').length;
              const filtered = expandedItems.filter((id) => id.split('/').length !== currentLevel);
              setExpandedItems([...filtered, itemId]);
            } else {
              // 收缩当前项
              setExpandedItems(expandedItems.filter((id) => id !== itemId));
            }
          }}
          onItemClick={(_, itemId) => {
            handleMenuClick(itemId);
          }}
        >
          <TreeItem
            key={999}
            itemId={'route:/system'}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HouseIcon size={18} weight="regular" />
                <Typography variant="body2">首页</Typography>
              </Box>
            }
          />
          {renderTree(sideRouters)}
        </SimpleTreeView>
      </Box>
    </Box>
  );
}

// 可与现有工具函数放在一起
function resolveIconKey(node: any): string | undefined {
  // 视你的后端返回结构调整：常见为 node.icon / node.meta.icon
  return node?.icon ?? node?.meta?.icon;
}

function getNodeIcon(node: any): Icon | null {
  const key = resolveIconKey(node);
  if (!key) return null;
  return (navIcons[key] as Icon) ?? null;
}

const renderTree = (nodes: any, parentPath = '') => {
  if (!Array.isArray(nodes)) return null;

  return nodes
    .filter((node) => !node.hidden)
    .map((node) => {
      const isAbsolute = typeof node.path === 'string' && node.path.startsWith('/');
      const fullPath = isAbsolute
        ? node.path
        : [parentPath, node.path].filter(Boolean).join('/').replaceAll(/\/+/g, '/');

      const itemId = fullPath || node.name || Math.random().toString(36).slice(2);
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const IconCmp = getNodeIcon(node);

      if (hasChildren) {
        return (
          // 保证1级菜单的文字和2级菜单的文字大小一致:body2 为13px
          <TreeItem key={itemId} itemId={itemId} label={<Typography variant="body2">{node.meta?.title}</Typography>}>
            {renderTree(node.children, fullPath)}
          </TreeItem>
        );
      }

      // 叶子节点：用 component 作为路由地址
      const rawComponent: string = node.component ?? '';
      // 路径改为next风格的: eg："system/user/index"  --> "system/user"
      let reactComponentPath: string = rawComponent.slice(0, -'/index'.length);
      // "monitor/operlog"  --> "system/operlog"
      if (reactComponentPath.startsWith('monitor/')) {
        reactComponentPath = reactComponentPath.replace('monitor', 'system');
      }

      // 叶子节点：用 components 作为路由地址
      const leafItemId = `route:/${reactComponentPath}`;

      return (
        <TreeItem
          key={itemId}
          itemId={leafItemId}
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {IconCmp ? <IconCmp size={18} weight="regular" /> : null}
              <Typography variant="body2">{node.meta?.title}</Typography>
            </Box>
          }
        />
      );
    });
};
