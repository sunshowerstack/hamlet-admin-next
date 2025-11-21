import { create } from 'zustand';
import { getDicts } from '@/api/system/dict/data';
import { getRouters } from '@/api/menu';
import { getInfo } from '@/api/login';
import { findItemByPath } from '@/utils/common';
import { UserInfo } from '@/api/system/user/types';

export interface DictDataOption {
  label: string;
  value: string;
  // elTagType?: string;
  elTagClass?: string;
}

interface SidebarRouterState {
  // 侧边栏路由信息
  sideRouters: Array<{ path: string; children: any[] }>;
  // 字典数据
  dict: Array<{ key: string; value: DictDataOption[] }>;
  // 登录用户信息
  userInfo: UserInfo;
  // 登录用户头像，昵称，要单独定义变量，可以在个人中心更新头像要刷新
  avatar: string;
  nickName: string;
  setAvatar: (value: string) => void;
  setNickName: (value: string) => void;
  getDict: (key: string) => DictDataOption[] | null;
  setDict: (key: string, value: DictDataOption[]) => void;
  removeDict: (key: string) => boolean;
  cleanDict: () => void;
  fetchDict: (key: string) => Promise<DictDataOption[]>;
  fetchRouters: () => Promise<[]>;
  getRouterItem: (key: string) => any | null;
  fetchUserInfo: () => Promise<UserInfo | null>;
}

// 侧边栏的路由数据，字典等需要缓存的都在此实现
export const useSidebarRouterStore = create<SidebarRouterState>((set, get) => ({
  // 侧边菜单路由信息
  sideRouters: [],
  dict: [],
  // 登录用户信息 每层的初始值都要写？
  // userInfo: { user: {} as any, roles: [], permissions: [] },
  userInfo: {} as any,

  avatar: '',
  nickName: '',

  getDict: (key: string) => {
    const { dict } = get();
    const found = dict.find((item) => item.key === key);
    return found ? found.value : null;
  },

  setDict: (key: string, value: DictDataOption[]) => {
    set((state) => {
      // 检查是否已存在，如果存在则更新，否则添加
      const existingIndex = state.dict.findIndex((item) => item.key === key);
      if (existingIndex >= 0) {
        const newDict = [...state.dict];
        newDict[existingIndex] = { key, value };
        return { dict: newDict };
      } else {
        return { dict: [...state.dict, { key, value }] };
      }
    });
  },

  removeDict: (key: string) => {
    set((state) => ({
      dict: state.dict.filter((item) => item.key !== key),
    }));
    return true;
  },

  cleanDict: () => {
    set({ dict: [] });
  },

  fetchDict: async (key: string) => {
    try {
      const response = await getDicts(key);
      const dictData = response.data.map(
        (item: any): DictDataOption => ({
          label: item.dictLabel,
          value: String(item.dictValue),
          // elTagType: item.listClass,
          elTagClass: item.cssClass,
        })
      );

      // 自动缓存获取的数据
      get().setDict(key, dictData);
      return dictData;
    } catch (error) {
      console.error('获取字典数据失败:', error);
      return [];
    }
  },

  fetchRouters: async () => {
    try {
      const response = await getRouters();
      const { data } = response;
      // const dictData = response.data.map(
      //   (item: any): DictDataOption => ({
      //     label: item.dictLabel,
      //     value: String(item.dictValue),
      //     // elTagType: item.listClass,
      //     elTagClass: item.cssClass,
      //   })
      // );

      // 自动缓存获取的数据
      // get().setDict(key, dictData);
      set({ sideRouters: data });
      return data;
    } catch (error) {
      console.error('获取侧边菜单路由数据失败:', error);
      return [];
    }
  },

  getRouterItem: (path: string) => {
    const { sideRouters } = get();
    return findItemByPath(sideRouters, path);
    // const found = routers.find((item) => item.path === path);
    // return found;
  },

  fetchUserInfo: async () => {
    try {
      const response = await getInfo();
      console.log('fetchUserInfo response', response);
      const { data } = response;
      // 自动缓存获取的数据
      set({ userInfo: data, avatar: data.user.avatar, nickName: data.user.nickName });
      return data;
    } catch (error) {
      console.error('获取登录用户信息失败:', error);
      return null;
    }
  },
  setAvatar: (value: string) => {
    set({
      avatar: value,
    });
  },
  setNickName: (value: string) => {
    set({
      nickName: value,
    });
  },
}));
