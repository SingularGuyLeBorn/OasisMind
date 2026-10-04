/** 公开内容 API 契约。这里只包含可部署字段，禁止加入本机路径、编辑状态或私人数据。 */
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
