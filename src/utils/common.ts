// 日期格式化
export function parseTime(time: any, pattern?: string) {
  if (arguments.length === 0 || !time) {
    return null;
  }
  const format = pattern || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof time === 'object') {
    date = time;
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = Number.parseInt(time);
    } else if (typeof time === 'string') {
      time = time
        .replaceAll(new RegExp(/-/gm), '/')
        .replace('T', ' ')
        .replaceAll(new RegExp(/\.[\d]{3}/gm), '');
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000;
    }
    date = new Date(time);
  }
  const formatObj: { [key: string]: any } = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  return format.replaceAll(/{(y|m|d|h|i|s|a)+}/g, (result: string, key: string) => {
    let value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }
    if (result.length > 0 && value < 10) {
      value = '0' + value;
    }
    return value || 0;
  });
}

/**
 * 添加日期范围
 * @param params
 * @param dateRange
 * @param propName
 */
export const addDateRange = (params: any, dateRange: any[], propName?: string) => {
  const search = params;
  search.params =
    typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params) ? search.params : {};
  dateRange = Array.isArray(dateRange) ? dateRange : [];
  if (propName === 'undefined') {
    search.params['beginTime'] = dateRange[0];
    search.params['endTime'] = dateRange[1];
  } else {
    search.params['begin' + propName] = dateRange[0];
    search.params['end' + propName] = dateRange[1];
  }
  return search;
};

// 回显数据字典
export const selectDictLabel = (datas: any, value: number | string) => {
  if (value === undefined) {
    return '';
  }
  const actions: Array<string | number> = [];
  Object.keys(datas).some((key) => {
    if (datas[key].value == '' + value) {
      actions.push(datas[key].label);
      return true;
    }
  });
  if (actions.length === 0) {
    actions.push(value);
  }
  return actions.join('');
};

// 回显数据字典（字符串数组）
export const selectDictLabels = (datas: any, value: any, separator: any) => {
  if (value === undefined || value.length === 0) {
    return '';
  }
  if (Array.isArray(value)) {
    value = value.join(',');
  }
  const actions: any[] = [];
  const currentSeparator = undefined === separator ? ',' : separator;
  const temp = value.split(currentSeparator);
  Object.keys(value.split(currentSeparator)).some((val) => {
    let match = false;
    Object.keys(datas).some((key) => {
      if (datas[key].value == '' + temp[val]) {
        actions.push(datas[key].label + currentSeparator);
        match = true;
      }
    });
    if (!match) {
      actions.push(temp[val] + currentSeparator);
    }
  });
  return actions.join('').slice(0, -1);
};

// 字符串格式化(%s )
export function sprintf(str: string, ...args: any[]) {
  if (args.length > 0) {
    let flag = true,
      i = 1;
    str = str.replaceAll('%s', function () {
      const arg = args[i++];
      if (arg === 'undefined') {
        flag = false;
        return '';
      }
      return arg;
    });
    return flag ? str : '';
  }
}

// 转换字符串，undefined,null等转化为""
export const parseStrEmpty = (str: any) => {
  if (!str || str == 'undefined' || str == 'null') {
    return '';
  }
  return str;
};

// 数据合并
export const mergeRecursive = (source: any, target: any) => {
  for (const p in target) {
    try {
      if (target[p].constructor == Object) {
        source[p] = mergeRecursive(source[p], target[p]);
      } else {
        source[p] = target[p];
      }
    } catch (error) {
      console.log(error);
      source[p] = target[p];
    }
  }
  return source;
};

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export const handleTree = <T>(data: any[], id?: string, parentId?: string, children?: string): T[] => {
  const config: {
    id: string;
    parentId: string;
    childrenList: string;
  } = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children',
  };

  const childrenListMap: any = {};
  const nodeIds: any = {};
  const tree: T[] = [];

  for (const d of data) {
    const parentId = d[config.parentId];
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = [];
    }
    nodeIds[d[config.id]] = d;
    childrenListMap[parentId].push(d);
  }

  for (const d of data) {
    const parentId = d[config.parentId];
    if (nodeIds[parentId] == null) {
      tree.push(d);
    }
  }
  const adaptToChildrenList = (o: any) => {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]];
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c);
      }
    }
  };

  for (const t of tree) {
    adaptToChildrenList(t);
  }

  return tree;
};

/**
 * 参数处理
 * @param {*} params  参数
 */
export const tansParams = (params: any) => {
  let result = '';
  for (const propName of Object.keys(params)) {
    const value = params[propName];
    const part = encodeURIComponent(propName) + '=';
    if (value !== null && value !== '' && value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && value[key] !== 'undefined') {
            const params = propName + '[' + key + ']';
            const subPart = encodeURIComponent(params) + '=';
            result += subPart + encodeURIComponent(value[key]) + '&';
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&';
      }
    }
  }
  return result;
};

// 返回项目路径
export const getNormalPath = (p: string): string => {
  if (p.length === 0 || !p || p === 'undefined') {
    return p;
  }
  const res = p.replace('//', '/');
  // if (res[res.length - 1] === '/') {
  //   return res.slice(0, res.length - 1);
  // }
  // eslint safe
  if (res.at(-1) === '/') {
    return res.slice(0, -1);
  }
  return res;
};

// 验证是否为blob格式
export const blobValidate = (data: any) => {
  return data.type !== 'application/json';
};

export default {
  handleTree,
};

/**
 * 根据path在菜单数组中查找对应的菜单项
 * @param items 菜单数组
 * @param targetPath 要查找的path
 * @returns 找到的菜单项或undefined
 */
export function findItemByPath(
  items: Array<{ path: string; children: any[] }>,
  targetPath: string
): { path: string; children: any[] } | undefined {
  // 遍历当前层级的所有项
  for (const item of items) {
    // 如果当前项的path匹配，直接返回
    if (item.path === targetPath) {
      return item;
    }

    // 如果有子项，递归查找
    if (item.children && item.children.length > 0) {
      const foundInChildren = findItemByPath(item.children, targetPath);
      // 如果在子项中找到，返回结果
      if (foundInChildren) {
        return foundInChildren;
      }
    }
  }

  // 没找到返回undefined
  return undefined;
}

// 递归遍历函数
export function collectIds(items: any): string[] {
  // 初始化当前层级的id数组
  let ids: string[] = [];
  items.forEach((item: any) => {
    // 收集当前元素的id
    ids.push(item.id + '');
    // 如果有children，递归收集子元素的id并拼接到当前数组
    if (item.children && item.children.length > 0) {
      ids = [...ids, ...collectIds(item.children)];
    }
  });
  // 返回当前层级收集到的所有id（包含子层级）
  return ids;
}

export function fillArray(selectedRows: string[], id: string) {
  const selectedIndex = selectedRows.indexOf(id);
  let newSelected: string[] = [];
  if (selectedIndex === -1) {
    newSelected = [...selectedRows, id];
  } else if (selectedIndex === 0) {
    newSelected = selectedRows.slice(1);
  } else if (selectedIndex === selectedRows.length - 1) {
    newSelected = selectedRows.slice(0, -1);
  } else if (selectedIndex > 0) {
    newSelected = [...selectedRows.slice(0, selectedIndex), ...selectedRows.slice(selectedIndex + 1)];
  }
  return newSelected;
}
