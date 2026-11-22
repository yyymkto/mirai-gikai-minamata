/**
 * 固有名詞辞書の型定義
 * @see docs/20261122_1200_議会動画文字起こし_固有名詞辞書設計.md
 */

export type ProperNounKind = "member" | "faction" | "committee" | "executive";

/** 正解の根拠。checkedOn はそのURLで内容を確認した日（YYYY-MM-DD） */
export type SourceRef = {
  url: string;
  checkedOn: string;
  note?: string;
};

/** 公式資料や文字起こしで実際に見つかった、正式表記と異なる表記 */
export type KnownVariant = {
  text: string;
  note: string;
  source?: SourceRef;
};

type BaseEntry = {
  id: string;
  kind: ProperNounKind;
  /** 公開に使う唯一の表記 */
  canonical: string;
  /**
   * ひらがな。人名は姓と名の間を半角スペースで区切る。
   * 公式資料で確認できない場合は null（推測で埋めない）
   */
  reading: string | null;
  /** 略称・会議中の呼ばれ方 */
  aliases: string[];
  knownVariants: KnownVariant[];
  /** 名前そのものの有効期間（YYYY-MM-DD）。不明な端は null */
  validFrom: string | null;
  validTo: string | null;
  /**
   * この内容が正しいと公式資料で確認できた基準日（YYYY-MM-DD）。
   * 会議の開催日がこれより後なら、改選・会派移籍・人事異動で古くなっている可能性がある
   */
  confirmedAsOf: string;
  sources: SourceRef[];
};

export type MemberEntry = BaseEntry & {
  kind: "member";
  factionId: string;
  role?: "議長" | "副議長";
};

export type FactionEntry = BaseEntry & {
  kind: "faction";
};

export type CommitteeEntry = BaseEntry & {
  kind: "committee";
  committeeType: "常任" | "議会運営" | "特別";
  chairId: string;
  viceChairId: string;
  /** 委員長・副委員長を含む全委員 */
  memberIds: string[];
  /** 現在の委員が選任された日 */
  membersAppointedOn: string;
  /** 条例上の定数 */
  capacity: number;
  capacityIsMax?: boolean;
};

export type ExecutiveEntry = BaseEntry & {
  kind: "executive";
  title: string;
};

export type ProperNounEntry =
  | MemberEntry
  | FactionEntry
  | CommitteeEntry
  | ExecutiveEntry;
