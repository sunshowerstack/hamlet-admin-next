export interface TabItem {
  key: string;
  title: string;
  path: string;
  closable: boolean;
  icon?: string;
}

export interface MenuItem {
  key: string;
  title: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
}

export interface BreadcrumbItem {
  title: string;
  path: string;
}

export interface TableData {
  id: string;
  [key: string]: any;
}

export interface SearchFormData {
  [key: string]: any;
}

// 日期范围类型定义
export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}
