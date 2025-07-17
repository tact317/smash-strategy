import React from 'react';

function CollectionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">コレクション</h2>
        {/* ここにキャラクターの戦績を表示する */}
        <p>キャラクターごとの戦績を表示します。</p>
      </div>
    </div>
  );
}

export default CollectionPage;