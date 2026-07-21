/**
 * サイト設定ファイル
 * Fork して別の地方議会向けに使用する場合はこのファイルを変更してください。
 * @see docs/kawasaki/20260304_1000_別地域向けfork手順.md
 */
export const siteConfig = {
  siteName: "みらい議会＠水俣市",
  siteDescription:
    "水俣市議会で今どんな議案が検討されているか、わかりやすく伝えるプラットフォームです",
  cityName: "水俣市",
  councilName: "水俣市議会",
  keywords: [
    "みらい議会＠水俣市",
    "議案",
    "水俣市",
    "市議会",
    "地方政治",
    "政策",
    "解説",
  ],
  councilBaseUrl: "https://www.city.minamata.lg.jp/",
  /** 議案・議決結果の一覧ページ */
  councilBillsDetailUrl:
    "https://www.city.minamata.lg.jp/default.html",
  twitterHashtag: "みらい議会_水俣市", // # なし
  externalLinks: {
    report: "https://docs.google.com/forms/d/e/1FAIpQLSc2UCHGoFN9xVWsW5FUSgahkQQDoLfhAdDwrrJMJC41br69XQ/viewform?usp=dialog",
    aboutNote: "",
    donation: "",
    teamAbout: "",
    terms: "",
    privacy: "",
    faq: "",
  },
  /**
   * ページを管理する政党名（空文字列の場合は政党名を省略した汎用表現を使用）
   * 例: "チームみらい"
   */
  managingParty: "" as string,
  /**
   * サービス運営者情報
   * 利用規約や問い合わせ先に使用します。
   */
  operator: {
    name: "吉野誠" as string,
    contactUrl: "https://x.com/yyymkto" as string,
    /** 利用規約の準拠法・管轄裁判所（第一審の専属的合意管轄） */
    jurisdiction: "熊本地方裁判所" as string,
  },
  /**
   * AI機能の有効/無効設定
   * 本番環境のコスト管理のため、機能ごとにオン/オフを切り替えられます。
   */
  features: {
    /** AIチャット機能（議案への質問・テキスト選択からの質問）*/
    aiChat: false,
    /** AIインタビュー機能（議案当事者へのヒアリング）*/
    aiInterview: true,
    /**
     * チームみらいセクションの表示（トップページ・フッター・デスクトップメニュー）
     * 非公式運営など、党の公式サービスとして出さない場合は false にする。
     */
    showTeamMiraiSection: false as boolean,
  },
} as const;
