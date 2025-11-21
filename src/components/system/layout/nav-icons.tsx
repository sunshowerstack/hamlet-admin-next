import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';

import { HouseIcon } from '@phosphor-icons/react/dist/ssr/House';
import { FolderIcon } from '@phosphor-icons/react/dist/ssr/Folder';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
import { BookIcon } from '@phosphor-icons/react/dist/ssr/Book';
import { IdentificationCardIcon } from '@phosphor-icons/react/dist/ssr/IdentificationCard';
import { ChatsIcon } from '@phosphor-icons/react/dist/ssr/Chats';
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/ssr/PencilSimple';
import { TreeStructureIcon } from '@phosphor-icons/react/dist/ssr/TreeStructure';
import { RowsIcon } from '@phosphor-icons/react/dist/ssr/Rows';
import { NotepadIcon } from '@phosphor-icons/react/dist/ssr/Notepad';
import { SignInIcon } from '@phosphor-icons/react/dist/ssr/SignIn';
import { DesktopIcon } from '@phosphor-icons/react/dist/ssr/Desktop';

import { UserListIcon } from '@phosphor-icons/react/dist/ssr/UserList';
import { HardDriveIcon } from '@phosphor-icons/react/dist/ssr/HardDrive';
import { UserCircleIcon } from '@phosphor-icons/react/dist/ssr/UserCircle';
import { BuildingsIcon } from '@phosphor-icons/react/dist/ssr/Buildings';
import { TagIcon } from '@phosphor-icons/react/dist/ssr/Tag';
import { CalendarCheckIcon } from '@phosphor-icons/react/dist/ssr/CalendarCheck';
import { ShoppingCartIcon } from '@phosphor-icons/react/dist/ssr/ShoppingCart';
import { ArrowsCounterClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowsCounterClockwise';
import { CoinsIcon } from '@phosphor-icons/react/dist/ssr/Coins';
import { CurrencyDollarIcon } from '@phosphor-icons/react/dist/ssr/CurrencyDollar';

// -------------------------------------------------------------
// 用的是独立的开源图标库Phosphor Icons
// 官网查询需要：去除"Icon"，而且是首字母小写,比如：HouseIcon需要用关键字: "house"
// -------------------------------------------------------------
export const navIcons = {
  'chart-pie': ChartPieIcon,
  users: UsersIcon,

  // 通用
  dashboard: HouseIcon,
  home: HouseIcon,
  search: MagnifyingGlassIcon,

  // ====================================
  // 【系统管理】
  // 角色管理: peoples
  // 菜单管理: tree-tables
  // 部门管理: tree
  // 岗位管理: post
  // 字典管理: dict
  // 参数设置: edit
  // 通知公告: message
  // 文件管理: upload
  // ====================================
  // 用户管理
  user: UserIcon,
  // 角色管理
  peoples: UsersIcon,
  // 菜单管理
  'tree-table': RowsIcon,
  // 部门管理
  tree: TreeStructureIcon,
  // 岗位管理
  post: IdentificationCardIcon,
  // 字典管理
  dict: BookIcon,
  // 参数设置
  edit: PencilSimpleIcon,
  // 2级目录：操作日志
  form: NotepadIcon,
  // 2级目录：登录日志
  logininfor: SignInIcon,
  // 通知公告
  message: ChatsIcon,
  // 文件管理
  upload: FolderIcon,
  // 客户端管理: international
  international: DesktopIcon,

  // ----------------------------
  // 系统监控
  // ----------------------------

  // 在线用户
  online: UserListIcon,
  // 缓存监控
  redis: HardDriveIcon,

  // ----------------------------
  // 商城域
  // ----------------------------

  // 会员管理(5)
  people: UserCircleIcon,
  //公司管理(1)
  company: BuildingsIcon,
  // 公司定价(2)
  example: TagIcon,
  // 活动管理(3)
  date: CalendarCheckIcon,
  // 订单管理(4)
  shopping: ShoppingCartIcon,
  // 售后管理
  waiting: ArrowsCounterClockwiseIcon,
  // 分销用户
  // user: ChatsIcon,
  // 佣金记录
  list: CoinsIcon,
  // 佣金提现
  money: CurrencyDollarIcon,

  // 设置与通知
  settings: GearSixIcon,

  // 其他
} as Record<string, Icon>;
