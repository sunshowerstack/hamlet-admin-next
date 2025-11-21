'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import RouterLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { HouseIcon } from '@phosphor-icons/react/dist/ssr';

import { paths } from '@/paths';

import { navIcons } from './nav-icons';
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { useSidebarRouterStore } from '@/stores/sidebar-router-store';
import { useTabsStore } from '@/stores/tabs-store';

export interface MobileNavProps {
  onClose?: () => void;
  open?: boolean;
}

export function MobileNav({ open, onClose }: MobileNavProps): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const { fetchRouters, sideRouters } = useSidebarRouterStore();
  const tabs = useTabsStore((state) => state.tabs);
  const switchTab = useTabsStore((state) => state.switchTab);

  useEffect(() => {
    fetchRouters();
  }, [fetchRouters]);

  const handleMenuClick = (itemId: string) => {
    if (!itemId.startsWith('route:')) {
      return;
    }
    const routePath = itemId.slice('route:'.length);
    if (!routePath) {
      return;
    }
    router.push(routePath);

    const tabKey = routePath + '?';
    const tab = tabs.find((item) => item.key === tabKey);
    if (tab) {
      switchTab(tabKey);
    }
    onClose?.();
  };

  return (
    <Drawer
      PaperProps={{
        sx: {
          '--MobileNav-background': 'var(--mui-palette-neutral-950)',
          '--MobileNav-color': 'var(--mui-palette-common-white)',
          '--NavItem-color': 'var(--mui-palette-neutral-300)',
          '--NavItem-hover-background': 'rgba(255, 255, 255, 0.04)',
          '--NavItem-active-background': 'var(--mui-palette-primary-main)',
          '--NavItem-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-disabled-color': 'var(--mui-palette-neutral-500)',
          '--NavItem-icon-color': 'var(--mui-palette-neutral-400)',
          '--NavItem-icon-active-color': 'var(--mui-palette-primary-contrastText)',
          '--NavItem-icon-disabled-color': 'var(--mui-palette-neutral-600)',
          bgcolor: 'var(--MobileNav-background)',
          color: 'var(--MobileNav-color)',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          width: 'var(--MobileNav-width)',
          zIndex: 'var(--MobileNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
      onClose={onClose}
      open={open}
    >
      <Stack spacing={2} sx={{ p: 2, minHeight: '64px' }}>
        <Box component={RouterLink} href={paths.home} sx={{ textDecoration: 'none', color: 'white' }}>
          <Typography>管理系统</Typography>
        </Box>
      </Stack>
      <Divider sx={{ borderColor: 'var(--mui-palette-neutral-700)' }} />
      <Box component="nav" sx={{ flex: '1 1 auto', p: '12px' }}>
        <SimpleTreeView
          expandedItems={expandedItems}
          onItemExpansionToggle={(_event: React.SyntheticEvent | null, itemId: string, isExpanded: boolean) => {
            if (isExpanded) {
              const currentLevel = itemId.split('/').length;
              const filtered = expandedItems.filter((id) => id.split('/').length !== currentLevel);
              setExpandedItems([...filtered, itemId]);
            } else {
              setExpandedItems(expandedItems.filter((id) => id !== itemId));
            }
          }}
          onItemClick={(_, itemId) => {
            handleMenuClick(itemId);
          }}
        >
          <TreeItem
            key={'mobile-home'}
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
    </Drawer>
  );
}

function resolveIconKey(node: any): string | undefined {
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
          <TreeItem key={itemId} itemId={itemId} label={<Typography variant="body2">{node.meta?.title}</Typography>}>
            {renderTree(node.children, fullPath)}
          </TreeItem>
        );
      }

      const rawComponent: string = node.component ?? '';
      let reactComponentPath: string = rawComponent.slice(0, -'/index'.length);
      if (reactComponentPath.startsWith('monitor/')) {
        reactComponentPath = reactComponentPath.replace('monitor', 'system');
      }

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
