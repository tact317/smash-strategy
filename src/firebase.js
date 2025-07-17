import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// ★★★ ここに、先ほどFirebaseの画面でコピーした設定を貼り付けます ★★★
const firebaseConfig = {
  apiKey: "AIzaSyCvXJDRDsd9FWCWCFuXQv_amE2BnS2wsaU",
  authDomain: "smash-strategy-notebook-14e22.firebaseapp.com",
  projectId: "smash-strategy-notebook-14e22",
  storageBucket: "smash-strategy-notebook-14e22.firebasestorage.app",
  messagingSenderId: "258363400874",
  appId: "1:258363400874:web:ab954df9873114c52166d3"
};


// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// Firestoreデータベースのインスタンスを取得してエクスポート
// これを使って、今後データの読み書きを行います
export const db = getFirestore(app);
export { app }; // これを追加