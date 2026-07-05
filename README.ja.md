# exES-mv3

[English](README.md) | 日本語

[ErogameScape（エロゲー批評空間）](https://erogamescape.dyndns.org/) のゲームページに、
各通販サイトの価格比較と過去のセールキャンペーンを表示する Chrome / Brave 拡張機能
（Manifest V3）です。

本プロジェクトは [ryoha000/exES](https://github.com/ryoha000/exES)（MIT）を起点に、
Manifest V2 廃止で動かなくなったプラットフォームを MV3 へ移植し、全ショップの
スクレイパーを現行サイトに合わせて再構築し、さらに Steam 対応を追加したものです。
オリジナルの設計と UI は ryoha000 さんによるものです。

## 対応ショップ

| ショップ | 状態 | 備考 |
|---------|------|------|
| Getchu | ✅ | JANコード + JSON-LD 価格 |
| 駿河屋 | ✅ | 新品 / 中古 |
| Sofmap | ✅ | 新品 / 中古 |
| DLsite | ✅ | product-info API |
| FANZA (DMM) | ✅ | 年齢ゲートは declarativeNetRequest ルールで通過 |
| Steam | ✅ | 公式 appdetails API。セール時は `3278 → 1966`、基本無料は `無料` と表示 |
| Amazon | ⚠️ | スクレイパー自体は動作するが、ErogameScape が Amazon リンクの掲載をやめたため実際には発火しない |

過去のセールキャンペーン（過去のキャンペーン）も ErogameScape から取得して
表示します。

## インストール（パッケージ化されていない拡張機能として読み込み）

```
npm install
npm run build   # dist/ に出力
```

`chrome://extensions`（または `brave://extensions`）を開き、**デベロッパーモード**を
有効にして **「パッケージ化されていない拡張機能を読み込む」** から `dist/`
ディレクトリを選択してください。

## 開発

```
npm test            # vitest ユニットテスト（パーサは実データfixtureでオフライン検証）
npm run typecheck   # tsc --noEmit
npm run build       # webpack → dist/
```

## プライバシーについて

バックグラウンドの fetch は `credentials:'include'` を使うため、照会先ショップの
ホスト（amazon.co.jp / getchu.com / sofmap.com / suruga-ya.jp / dmm.co.jp /
dlsite.com / store.steampowered.com）に対して**ブラウザに保存されたあなたの
Cookie が送信されます**。これはオリジナル（MV2）と同じ挙動で、Cookie ゲートの
あるページ（例: Amazon の18禁商品）の取得に必要です。リクエストは対象ショップ
にのみ送られ、拡張機能が情報を収集することはありません。

## ライセンス

MIT — [LICENSE](LICENSE) を参照。原作 © 2021 ryoha000。
