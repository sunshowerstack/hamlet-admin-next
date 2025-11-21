import { create } from 'zustand';
import { usePathname, useSearchParams } from 'next/navigation';

// 定义单个 Tab 的类型
export interface TabItem {
  key: string; // 唯一标识（使用 pathname，确保同一路径同一实例）
  pathname: string; // 路由路径（如 /system/user）
  searchParams: string; // 路由参数（如 id=1&name=test，转成字符串存储）
  title: string; // Tab 显示标题（如“用户管理”）
  component?: React.ReactNode; // 缓存的页面组件（可选，也可通过路由懒加载）
}

interface TabsState {
  tabs: TabItem[]; // 已打开的 Tab 列表
  activeKey: string; // 当前激活的 Tab key
  // 添加 Tab（首次打开页面时调用）
  addTab: (tab: Omit<TabItem, 'key'>) => void;
  // 切换 Tab
  switchTab: (key: string) => void;
  // 关闭 Tab
  closeTab: (key: string) => void;
  // 生成 Tab 的唯一 key（仅 pathname）
  generateKey: (pathname: string, searchParams: string) => string;
}

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [{ key: '/system', pathname: '/system', searchParams: '', title: '首页' }],
  activeKey: '/system',

  generateKey: (pathname, _searchParams) => `${pathname}`,

  addTab: (tab) => {
    const { tabs, generateKey } = get();
    const key = generateKey(tab.pathname, tab.searchParams);
    const existIndex = tabs.findIndex((item) => item.key === key);
    if (existIndex === -1) {
      set({
        tabs: [...tabs, { key, ...tab }],
        activeKey: key,
      });
    } else {
      const updated = [...tabs];
      updated[existIndex] = {
        ...updated[existIndex],
        searchParams: tab.searchParams,
        title: tab.title || updated[existIndex].title,
      };
      set({ tabs: updated, activeKey: key });
    }
  },

  switchTab: (key) => {
    set({ activeKey: key });
    // 切换时同步更新地址栏，但不触发导航，保持组件不卸载
    const tab = get().tabs.find((item) => item.key === key);
    if (tab && globalThis.window !== undefined) {
      const fullPath = tab.searchParams ? `${tab.pathname}?${tab.searchParams}` : tab.pathname;
      if (globalThis.location.pathname + globalThis.location.search !== fullPath) {
        globalThis.history.replaceState(null, '', fullPath);
      }
    }
    return tab;
    // if (tab) {
    //   const { push } = require('next/navigation'); // 动态导入避免客户端报错
    //   push(`${tab.pathname}?${tab.searchParams}`);
    // }
  },

  closeTab: (key) => {
    console.log('key:', key);
    const { tabs, activeKey } = get();
    console.log('tabs:', tabs);
    console.log('activeKey:', activeKey);
    const newTabs = tabs.filter((item) => item.key !== key);

    console.log('newTabs:', newTabs);

    // 若关闭的是当前激活 Tab，自动激活前一个 Tab
    let newActiveKey = '';
    if (activeKey === key && newTabs.length > 0) {
      newActiveKey = newTabs.at(-1)!.key;
    } else {
      newActiveKey = activeKey;
    }

    console.log('newActiveKey:', newActiveKey);
    set({ tabs: newTabs, activeKey: newActiveKey });

    // 关闭后同步地址栏为新的激活 Tab
    if (globalThis.window !== undefined) {
      const newActiveTab = newTabs.find((t) => t.key === newActiveKey);
      if (newActiveTab) {
        const fullPath = newActiveTab.searchParams
          ? `${newActiveTab.pathname}?${newActiveTab.searchParams}`
          : newActiveTab.pathname;
        if (globalThis.location.pathname + globalThis.location.search !== fullPath) {
          globalThis.history.replaceState(null, '', fullPath);
        }
      }
    }
  },
}));
