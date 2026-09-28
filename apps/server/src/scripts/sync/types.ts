/**
 * 瀹炰綋鍚屾鍣ㄩ€氱敤鎺ュ彛
 *
 * 姣忎釜闇€瑕?content/ 鐩綍浣滀负浜嬪疄婧愮殑瀹炰綋锛岄兘闇€瑕佸疄鐜颁竴涓?Syncer銆?
 */

import { PrismaClient } from "@prisma/client";

export interface SyncRecord<T = unknown> {
  /** 鏂囦欢鐩稿璺緞锛堜笉鍚墿灞曞悕锛夛紝浣滀负绋冲畾鐨勬湰鍦版爣璇?*/
  slug: string;
  /** 鏈湴婧愭枃浠舵渶鍚庝慨鏀规椂闂达紝鐢ㄤ簬澧為噺鍚屾鍒ゆ柇 */
  mtime: Date;
  /** 瑙ｆ瀽鍚庣殑瀹炰綋鏁版嵁 */
  data: T;
}

export interface Syncer<T = unknown> {
  /** 瀹炰綋鍚嶏紝鐢ㄤ簬鏃ュ織杈撳嚭 */
  readonly entityName: string;

  /** content 瀛愮洰褰曞悕锛屼緥濡?"posts"銆?agents" */
  readonly contentDirName: string;

  /** 璇ュ悓姝ュ櫒澶勭悊鐨勬枃浠舵墿灞曞悕 */
  readonly extensions: string[];

  /** 鎵弿鐩綍骞惰В鏋愭墍鏈夋湰鍦版枃浠?*/
  scan(prisma: PrismaClient, contentDir: string): Promise<SyncRecord<T>[]>;

  /**
   * A13锛氫粎瑙ｆ瀽鍗曚釜鏂囦欢骞惰繑鍥炲叾 SyncRecord锛堣В鏋愬け璐ヨ繑鍥?null锛夈€?
   * 渚?watch 妯″紡 add/change 浜嬩欢浣跨敤锛岄伩鍏嶆瘡娆″彉鏇撮兘鍏ㄧ洰褰曟壂鎻忋€?
   * 瀹炵幇搴斾笌 scan 鍐呯殑鍗曟枃浠惰В鏋愰€昏緫涓€鑷达紙scan 閫氬父濮旀墭鏈柟娉曪級銆?
   */
  scanFile?(filePath: string, contentDir: string): Promise<SyncRecord<T> | null>;

  /** 灏嗗崟鏉¤褰?upsert 鍒版暟鎹簱 */
  upsert(prisma: PrismaClient, record: SyncRecord<T>): Promise<void>;

  /** 娓呯悊鏁版嵁搴撲腑宸蹭笉瀛樺湪鏈湴鏂囦欢鐨勮褰曘€俢ontentDir 鍙€夛紝鐢ㄤ簬纾佺洏瀛樺湪鎬ф鏌ワ紙閬垮厤璇垹瑙ｆ瀽澶辫触鐨勮褰曪級銆?*/
  cleanup(prisma: PrismaClient, activeSlugs: string[], contentDir?: string): Promise<number>;

  /**
   * #7锛歸atch unlink 澧為噺娓呯悊鈥斺€旀寜 slug 鍒犻櫎鍗曟潯 DB 璁板綍锛岄伩鍏?unlink 鏃跺叏鐩綍鎵弿銆?
   * Post 涓鸿蒋鍒狅紙set deletedAt锛屼笌 cleanup 涓€鑷达級锛屽叾浣欏疄浣撶‖鍒狅紙鎸?sourceSlug锛夈€?
   * 杩斿洖鍒犻櫎鏉℃暟銆?
   */
  deleteBySlug?(prisma: PrismaClient, slug: string): Promise<number>;

  /** 鑾峰彇鏁版嵁搴撲腑鐜版湁璁板綍鐨?slug 鈫?sourceMtime 鏄犲皠锛岀敤浜庡閲忓悓姝?*/
  getExistingMtimes(prisma: PrismaClient): Promise<Map<string, Date>>;
}
