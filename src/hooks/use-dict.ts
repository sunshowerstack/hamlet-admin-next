import { useState, useEffect } from 'react';
// 避免和全局定义的DictDataOption冲突
import { useDictStore, DictDataOption } from '@/stores/dict-store';

export const useDict = (...args: string[]) => {
  const [result, setResult] = useState<{ [key: string]: DictDataOption[] }>({});
  const { getDict, fetchDict } = useDictStore();

  useEffect(() => {
    const loadDicts = async () => {
      const newResult: { [key: string]: DictDataOption[] } = {};

      for (const dictType of args) {
        // 先检查缓存
        const cached = getDict(dictType);
        if (cached) {
          newResult[dictType] = cached;
        } else {
          // 缓存中没有，从服务器获取
          const dictData = await fetchDict(dictType);
          newResult[dictType] = dictData;
        }
      }

      setResult(newResult);
    };

    loadDicts();
    // }, [args.join(',')]); // 依赖项是字典类型的组合 TODO:
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 参数args全是固定字符串的调用，不用加依赖项

  // useDict函数的返回值
  return result;
};
