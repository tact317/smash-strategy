// ここにアプリ内の全コレクションアイテムを定義します
export const collectionItems = {
    // BGM
    bgm_main_dark: { id: 'bgm_main_dark', type: 'bgm', name: 'ダークテーマ', source: '/audio/home_bgm.mp3', unlockedByDefault: true },
    bgm_main_smash: { id: 'bgm_main_smash', type: 'bgm', name: 'スマッシュテーマ', source: '/audio/splash_bgm.mp3', unlockedByDefault: true },
    bgm_calm: { id: 'bgm_calm', type: 'bgm', name: '静寂の調べ', source: '/audio/calm_bgm.mp3', unlockedByDefault: false },

    // 背景画像
    img_home_default: { id: 'img_home_default', type: 'image', name: 'デフォルト背景', source: '/images/menu-bg-default.jpg', unlockedByDefault: true },
    img_home_01: { id: 'img_home_01', type: 'image', name: 'ファイターズ', source: '/images/menu-bg-1.jpg', unlockedByDefault: false },

    // 効果音 (SE)
    se_click_default: { id: 'se_click_default', type: 'se', name: 'デフォルトクリック', source: '/audio/click.mp3', unlockedByDefault: true },
    se_click_kirby: { id: 'se_click_kirby', type: 'se', name: 'カービィ風クリック', source: '/audio/click_kirby.mp3', unlockedByDefault: false },
};