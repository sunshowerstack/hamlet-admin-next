'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { usePopover } from '@/hooks/use-popover';
import { useSidebarRouterStore } from '@/stores/sidebar-router-store';

import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';
import { IconButton } from '@mui/material';
import { ListIcon } from '@phosphor-icons/react';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);

  const popoverHook = usePopover<HTMLDivElement>();
  const { avatar } = useSidebarRouterStore();

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-background-paper)',
          position: 'sticky',
          top: 0,
          zIndex: 'var(--mui-zIndex-appBar)',
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: '64px', px: 2 }}
        >
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            {/* 移动端菜单按钮（移动端菜单栏默认关闭，通过按钮点击显示） */}
            <IconButton
              onClick={(): void => {
                setOpenNav(true);
              }}
              sx={{ display: { lg: 'none' } }}
            >
              <ListIcon />
            </IconButton>
            {/* top部分的一些小图标按钮
            <Tooltip title="Search">
              <IconButton>
                <MagnifyingGlassIcon />
              </IconButton>
            </Tooltip> */}
          </Stack>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
            {/* <Tooltip title="Contacts">
              <IconButton>
                <UsersIcon />
              </IconButton>
            </Tooltip> */}
            {/* <Tooltip title="Notifications">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton>
                  <BellIcon />
                </IconButton>
              </Badge>
            </Tooltip> */}
            <Avatar
              onClick={popoverHook.handleOpen}
              ref={popoverHook.anchorRef}
              src={avatar}
              sx={{ cursor: 'pointer', width: 36, height: 36 }}
            />
          </Stack>
        </Stack>
      </Box>
      <UserPopover anchorEl={popoverHook.anchorRef.current} onClose={popoverHook.handleClose} open={popoverHook.open} />
      {/* 移动端菜单栏组件 */}
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
