/**
 * 水俣市議会 固有名詞辞書（初期データ）
 *
 * 公式資料に書かれていることだけを入れる。確認できない読みは null にする（推測で埋めない）。
 * @see docs/20261122_1200_議会動画文字起こし_固有名詞辞書設計.md
 */
import type {
  CommitteeEntry,
  ExecutiveEntry,
  FactionEntry,
  KnownVariant,
  MemberEntry,
  ProperNounEntry,
  SourceRef,
} from "./types";

const SOURCE = {
  memberList: {
    url: "https://www.city.minamata.lg.jp/gikai/kiji003736/index.html",
    checkedOn: "2026-11-22",
    note: "水俣市議会議員名簿（最終更新 2026-08-12）",
  },
  factions: {
    url: "https://www.city.minamata.lg.jp/gikai/kiji003739/index.html",
    checkedOn: "2026-11-22",
    note: "会派構成（令和8年7月2日現在）",
  },
  committees: {
    url: "https://www.city.minamata.lg.jp/gikai/kiji0033604/index.html",
    checkedOn: "2026-11-22",
    note: "委員会委員名簿（最終更新 2026-04-16）",
  },
  minutesR7Sep: {
    url: "https://www.city.minamata.lg.jp/gikai/kiji0034245/3_4245_up_we42acsq.pdf",
    checkedOn: "2026-11-19",
    note: "令和7年9月第3回定例会 会議録「説明のため出席した者」",
  },
  newsletter105: {
    url: "https://www.city.minamata.lg.jp/gikai/kiji0034575/3_4575_up_j58m1bxu.pdf",
    checkedOn: "2026-11-19",
    note: "みなまた市議会だより 第105号 p.7「賛否の分かれた事案」",
  },
  minutesSearch: {
    url: "http://www.kensakusystem.jp/minamata/index.html",
    checkedOn: "2026-11-19",
    note: "会議録検索システム。JIS第2水準までの漢字のみ使用と明記",
  },
} as const satisfies Record<string, SourceRef>;

/** 会派構成ページの基準日 */
const FACTION_AS_OF = "2026-07-02";

/** 会議録検索システムでは「髙」が「高」になりうる */
const TAKA_VARIANT_NOTE =
  "会議録検索システムはJIS第2水準までの漢字のみのため「高」で表記される場合がある";

// ---------------------------------------------------------------------------
// 会派（令和8年7月2日現在）
// 読みは運営者に確認した（2026-11-22）。確認していない会派は null。
// ---------------------------------------------------------------------------

function faction(
  id: string,
  canonical: string,
  options: {
    reading?: string;
    aliases?: string[];
    knownVariants?: KnownVariant[];
  } = {}
): FactionEntry {
  return {
    id,
    kind: "faction",
    canonical,
    reading: options.reading ?? null,
    aliases: options.aliases ?? [],
    knownVariants: options.knownVariants ?? [],
    validFrom: null,
    validTo: null,
    confirmedAsOf: FACTION_AS_OF,
    sources: [SOURCE.factions],
  };
}

export const MINAMATA_FACTIONS: readonly FactionEntry[] = [
  faction("faction-shinshikai", "真志会", { reading: "しんしかい" }),
  faction("faction-jimin-shinmirai", "自民新未来", {
    reading: "じみんしんみらい",
  }),
  faction("faction-is-minamata", "Ｉ❜ｓ水俣", {
    reading: "あいずみなまた",
    knownVariants: [
      {
        text: "I❜s水俣",
        note: "議員名簿では半角英字",
        source: SOURCE.memberList,
      },
      {
        text: "Iʼs水俣",
        note: "議会だよりでは別のアポストロフィ（U+02BC）",
        source: SOURCE.newsletter105,
      },
    ],
  }),
  faction("faction-jcp", "日本共産党", { aliases: ["共産党"] }),
  faction("faction-koseikai", "光政会", { reading: "こうせいかい" }),
  faction("faction-komei", "公明党"),
  faction("faction-kodomo-miraikai", "こども未来会", {
    reading: "こどもみらいかい",
  }),
  faction("faction-sanseikai", "参政会", { reading: "さんせいかい" }),
  faction("faction-next-smile", "ネクストすまいる"),
  faction("faction-keishinkai", "恵真会", { reading: "けいしんかい" }),
];

// ---------------------------------------------------------------------------
// 議員（任期: 令和5年5月1日～令和9年4月30日。議員名簿の議席番号順）
// ---------------------------------------------------------------------------

const TERM_FROM = "2023-05-01";
const TERM_TO = "2027-04-30";

function member(
  id: string,
  canonical: string,
  reading: string,
  factionId: string,
  options: {
    role?: MemberEntry["role"];
    knownVariants?: KnownVariant[];
  } = {}
): MemberEntry {
  return {
    id,
    kind: "member",
    canonical,
    reading,
    aliases: [],
    knownVariants: options.knownVariants ?? [],
    validFrom: TERM_FROM,
    validTo: TERM_TO,
    confirmedAsOf: FACTION_AS_OF,
    sources: [SOURCE.memberList, SOURCE.factions],
    factionId,
    ...(options.role ? { role: options.role } : {}),
  };
}

export const MINAMATA_MEMBERS: readonly MemberEntry[] = [
  member("member-hiraoka-akemi", "平岡　朱", "ひらおか あけみ", "faction-jcp"),
  member(
    "member-sugisako-kazuki",
    "杉迫　一樹",
    "すぎさこ かずき",
    "faction-is-minamata"
  ),
  member("member-hiyama-mio", "肥山　美緒", "ひやま みお", "faction-sanseikai"),
  member(
    "member-yoshino-makoto",
    "吉野　誠",
    "よしの まこと",
    "faction-kodomo-miraikai"
  ),
  member(
    "member-sugimoto-yasuhiro",
    "杉本　康宏",
    "すぎもと やすひろ",
    "faction-shinshikai"
  ),
  member(
    "member-morikawa-takeharu",
    "森川　武治",
    "もりかわ たけはる",
    "faction-jimin-shinmirai"
  ),
  member("member-kido-rie", "木戸　理江", "きど りえ", "faction-keishinkai"),
  member(
    "member-iwamura-tatsuo",
    "岩村　龍男",
    "いわむら たつお",
    "faction-next-smile",
    { role: "議長" }
  ),
  member(
    "member-takaoka-akemi",
    "髙岡　朱美",
    "たかおか あけみ",
    "faction-jcp",
    {
      knownVariants: [
        {
          text: "高岡　朱美",
          note: TAKA_VARIANT_NOTE,
          source: SOURCE.minutesSearch,
        },
      ],
    }
  ),
  member(
    "member-fujimoto-toshiko",
    "藤本　壽子",
    "ふじもと としこ",
    "faction-is-minamata",
    {
      knownVariants: [
        {
          text: "藤本　寿子",
          note: "議会だよりでは新字体「寿」",
          source: SOURCE.newsletter105,
        },
      ],
    }
  ),
  member(
    "member-komichi-takaki",
    "小路　貴紀",
    "こみち たかき",
    "faction-shinshikai"
  ),
  member(
    "member-kuwahara-kazuharu",
    "桑原　一知",
    "くわはら かずはる",
    "faction-shinshikai"
  ),
  member(
    "member-mano-yoritaka",
    "真野　頼隆",
    "まの よりたか",
    "faction-shinshikai"
  ),
  member(
    "member-makishita-yasuyuki",
    "牧下　恭之",
    "まきした やすゆき",
    "faction-komei"
  ),
  member(
    "member-taguchi-norio",
    "田口　憲雄",
    "たぐち のりお",
    "faction-jimin-shinmirai",
    { role: "副議長" }
  ),
  member(
    "member-matsumoto-kazuyuki",
    "松本　和幸",
    "まつもと かずゆき",
    "faction-koseikai"
  ),
];

// ---------------------------------------------------------------------------
// 委員会（委員会委員名簿 2026-04-16 更新時点）
// validFrom は委員会の名前の有効期間。設置日が資料にない委員会は null。
// ---------------------------------------------------------------------------

const COMMITTEES_AS_OF = "2026-04-16";

function committee(
  entry: Omit<
    CommitteeEntry,
    | "kind"
    | "knownVariants"
    | "validFrom"
    | "validTo"
    | "confirmedAsOf"
    | "sources"
  > & {
    knownVariants?: KnownVariant[];
    validFrom?: string | null;
    validTo?: string | null;
  }
): CommitteeEntry {
  return {
    ...entry,
    kind: "committee",
    knownVariants: entry.knownVariants ?? [],
    validFrom: entry.validFrom ?? null,
    validTo: entry.validTo ?? null,
    confirmedAsOf: COMMITTEES_AS_OF,
    sources: [SOURCE.committees],
  };
}

export const MINAMATA_COMMITTEES: readonly CommitteeEntry[] = [
  committee({
    id: "committee-somu-sangyo",
    canonical: "総務産業常任委員会",
    reading: "そうむさんぎょうじょうにんいいんかい",
    aliases: ["総務産業委員会", "総務産業"],
    committeeType: "常任",
    membersAppointedOn: "2025-06-05",
    capacity: 8,
    chairId: "member-mano-yoritaka",
    viceChairId: "member-fujimoto-toshiko",
    memberIds: [
      "member-mano-yoritaka",
      "member-fujimoto-toshiko",
      "member-hiraoka-akemi",
      "member-hiyama-mio",
      "member-komichi-takaki",
      "member-makishita-yasuyuki",
      "member-taguchi-norio",
      "member-matsumoto-kazuyuki",
    ],
  }),
  committee({
    id: "committee-kosei-bunkyo",
    canonical: "厚生文教常任委員会",
    reading: "こうせいぶんきょうじょうにんいいんかい",
    aliases: ["厚生文教委員会", "厚生文教"],
    committeeType: "常任",
    membersAppointedOn: "2025-06-05",
    capacity: 8,
    chairId: "member-kido-rie",
    viceChairId: "member-takaoka-akemi",
    memberIds: [
      "member-kido-rie",
      "member-takaoka-akemi",
      "member-sugisako-kazuki",
      "member-yoshino-makoto",
      "member-sugimoto-yasuhiro",
      "member-morikawa-takeharu",
      "member-iwamura-tatsuo",
      "member-kuwahara-kazuharu",
    ],
  }),
  committee({
    id: "committee-gikai-unei",
    canonical: "議会運営委員会",
    reading: "ぎかいうんえいいいんかい",
    aliases: ["議運"],
    committeeType: "議会運営",
    membersAppointedOn: "2025-06-05",
    capacity: 8,
    capacityIsMax: true,
    chairId: "member-komichi-takaki",
    viceChairId: "member-takaoka-akemi",
    memberIds: [
      "member-komichi-takaki",
      "member-takaoka-akemi",
      "member-morikawa-takeharu",
      "member-fujimoto-toshiko",
      "member-mano-yoritaka",
      "member-matsumoto-kazuyuki",
    ],
  }),
  committee({
    id: "committee-kankyo-taisaku",
    canonical: "環境対策特別委員会",
    reading: "かんきょうたいさくとくべついいんかい",
    aliases: [],
    committeeType: "特別",
    membersAppointedOn: "2023-05-15",
    capacity: 8,
    chairId: "member-kido-rie",
    viceChairId: "member-fujimoto-toshiko",
    memberIds: [
      "member-kido-rie",
      "member-fujimoto-toshiko",
      "member-hiraoka-akemi",
      "member-hiyama-mio",
      "member-morikawa-takeharu",
      "member-komichi-takaki",
      "member-kuwahara-kazuharu",
      "member-matsumoto-kazuyuki",
    ],
  }),
  committee({
    id: "committee-kosoku-kotsu",
    canonical: "高速交通対策特別委員会",
    reading: "こうそくこうつうたいさくとくべついいんかい",
    aliases: [],
    committeeType: "特別",
    membersAppointedOn: "2023-05-15",
    capacity: 7,
    chairId: "member-mano-yoritaka",
    viceChairId: "member-makishita-yasuyuki",
    memberIds: [
      "member-mano-yoritaka",
      "member-makishita-yasuyuki",
      "member-sugisako-kazuki",
      "member-yoshino-makoto",
      "member-sugimoto-yasuhiro",
      "member-takaoka-akemi",
      "member-taguchi-norio",
    ],
  }),
  committee({
    id: "committee-gikai-kaikaku",
    canonical: "議会改革特別委員会",
    reading: "ぎかいかいかくとくべついいんかい",
    aliases: [],
    committeeType: "特別",
    validFrom: "2024-03-14",
    membersAppointedOn: "2024-03-14",
    capacity: 8,
    chairId: "member-komichi-takaki",
    viceChairId: "member-takaoka-akemi",
    memberIds: [
      "member-komichi-takaki",
      "member-takaoka-akemi",
      "member-hiyama-mio",
      "member-sugimoto-yasuhiro",
      "member-morikawa-takeharu",
      "member-fujimoto-toshiko",
      "member-kuwahara-kazuharu",
      "member-matsumoto-kazuyuki",
    ],
  }),
  committee({
    id: "committee-ippan-kaikei-kessan",
    canonical: "一般会計決算特別委員会",
    reading: "いっぱんかいけいけっさんとくべついいんかい",
    aliases: ["決算特別委員会"],
    committeeType: "特別",
    // 決算の審査ごとに設置される。審査終了日が分かったら validTo を入れる
    validFrom: "2025-09-11",
    membersAppointedOn: "2025-09-11",
    capacity: 7,
    chairId: "member-komichi-takaki",
    viceChairId: "member-fujimoto-toshiko",
    memberIds: [
      "member-komichi-takaki",
      "member-fujimoto-toshiko",
      "member-hiraoka-akemi",
      "member-hiyama-mio",
      "member-yoshino-makoto",
      "member-sugimoto-yasuhiro",
      "member-morikawa-takeharu",
    ],
  }),
];

// ---------------------------------------------------------------------------
// 執行部（令和7年9月定例会の出席者。令和8年4月の人事異動後は未確認）
// 読みは公式資料で確認できないため null。姓名の区切りも資料から確定できないため空白なし。
// ---------------------------------------------------------------------------

/** 令和7年9月定例会の開会日 */
const EXECUTIVES_AS_OF = "2025-08-29";

function executive(
  id: string,
  title: string,
  canonical: string,
  knownVariants: KnownVariant[] = []
): ExecutiveEntry {
  return {
    id,
    kind: "executive",
    title,
    canonical,
    reading: null,
    aliases: [],
    knownVariants,
    validFrom: null,
    validTo: null,
    confirmedAsOf: EXECUTIVES_AS_OF,
    sources: [SOURCE.minutesR7Sep],
  };
}

export const MINAMATA_EXECUTIVES: readonly ExecutiveEntry[] = [
  executive("exec-mayor", "市長", "髙岡利治", [
    { text: "高岡利治", note: TAKA_VARIANT_NOTE, source: SOURCE.minutesSearch },
  ]),
  executive("exec-deputy-mayor", "副市長", "小林信也"),
  executive("exec-somu-kikaku", "総務企画部長", "梅下俊克"),
  executive("exec-fukushi-kankyo", "福祉環境部長", "今別府隆宏"),
  executive("exec-sangyo-kensetsu", "産業建設部長", "柿本英行"),
  executive("exec-kyoikucho", "教育長", "蓑田誠一"),
  executive("exec-jogesuido", "上下水道局長", "永田久美子"),
  executive("exec-hospital-somu", "総合医療センター事務部総務課長", "竹下昭博"),
  executive("exec-shicho-koshitsu", "総務企画部市長公室長", "白本亮"),
  executive("exec-somu-ka", "総務企画部総務課長", "赤司和弘"),
  executive("exec-zaisei-ka", "総務企画部財政課長", "中村優志"),
];

export const MINAMATA_DICTIONARY: readonly ProperNounEntry[] = [
  ...MINAMATA_FACTIONS,
  ...MINAMATA_MEMBERS,
  ...MINAMATA_COMMITTEES,
  ...MINAMATA_EXECUTIVES,
];
