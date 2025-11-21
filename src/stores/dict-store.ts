import { create } from 'zustand';
import { getDicts } from '@/api/system/dict/data';

export interface DictDataOption {
  label: string;
  value: string;
  // elTagType?: string;
  elTagClass?: string;
}

interface DictStore {
  dict: Array<{ key: string; value: DictDataOption[] }>;
  getDict: (key: string) => DictDataOption[] | null;
  setDict: (key: string, value: DictDataOption[]) => void;
  removeDict: (key: string) => boolean;
  cleanDict: () => void;
  fetchDict: (key: string) => Promise<DictDataOption[]>;
}

export const useDictStore = create<DictStore>((set, get) => ({
  dict: [],

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
}));
