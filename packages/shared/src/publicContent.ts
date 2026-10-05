/**
 * 公开内容 API 的跨端类型事实源，只允许可部署白名单字段。
 * 本模块不读写数据；本机路径、编辑状态或私人数据一旦加入，将由生成器反向验真失败拦截。
 */
export const PUBLIC_CONTENT_SCHEMA_VERSION = 1;

export interface PublicGarden {
  id: string;
  title: string;
  description: string | null;
  homeContent: string;
  postCount: number;
  apiPath: string;
}

export interface PublicPostSummary {
  id: string;
  garden: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string | null;
  tags: string[];
  apiPath: string;
  markdownPath: string;
}

export interface PublicPost extends PublicPostSummary {
  content: string;
  contentHash: string;
}

export interface PublicContentManifest {
  schemaVersion: number;
  gardens: PublicGarden[];
  posts: PublicPostSummary[];
}

export interface PublicSearchEntry extends PublicPostSummary {
  searchText: string;
}

export interface PublicSearchManifest {
  schemaVersion: number;
  posts: PublicSearchEntry[];
}
