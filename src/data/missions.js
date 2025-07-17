// ここにアプリ内の全ミッションを定義します
export const missions = {
    // ノート作成系
    CREATE_FIRST_NOTE: {
        title: "最初の第一歩",
        description: "いずれかのキャラクターでキャラ対策メモを1つ作成する。",
        type: 'NOTE_COUNT_TOTAL', // ミッションの種類
        goal: 1, // 達成目標値
        reward: { type: 'se', id: 'se_click_kirby' } // 達成報酬
    },
    CREATE_10_NOTES: {
        title: "メモ魔の兆し",
        description: "キャラ対策メモを合計10個作成する。",
        type: 'NOTE_COUNT_TOTAL',
        goal: 10,
        reward: { type: 'bgm', id: 'bgm_calm' }
    },
    // 戦績系
    WIN_10_MATCHES: {
        title: "勝利の味",
        description: "合計で10勝する。",
        type: 'WIN_COUNT_TOTAL',
        goal: 10,
        reward: { type: 'image', id: 'img_home_01' }
    },
    // ★★★ ここから下を追記 ★★★
    // キャラクター登録系
    REGISTER_10_CHARS: {
        title: "仲間集め",
        description: "キャラクターを10体登録する。",
        type: 'CHARACTER_COUNT',
        goal: 10,
        reward: { type: 'se', id: 'se_click_kirby' } // 仮の報酬
    },
    // ティアリスト作成系
    CREATE_3_TIER_LISTS: {
        title: "ランク付け名人",
        description: "ティアリストを3つ作成する。",
        type: 'TIER_LIST_COUNT',
        goal: 3,
        reward: { type: 'bgm', id: 'bgm_calm' } // 仮の報酬
    },
};