// src/components/ShatterScreen.js (全文・最終FIX版)

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Delaunay from '../lib/delaunay.js';
import { motion } from 'framer-motion';

const ShatterScreen = ({ onTransitionEnd }) => {
    const containerRef = useRef(null);
    const imageRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isShattered, setIsShattered] = useState(false);
    const [error, setError] = useState(null);

    const handleShatter = (event) => {
        if (isShattered || !imageRef.current) return;
        
        const container = containerRef.current;
        const imageElement = imageRef.current;
        
        // isShatteredをすぐにtrueにすることで、元の画像が非表示に切り替わる
        setIsShattered(true);

        const rect = imageElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        const displayWidth = rect.width;
        const displayHeight = rect.height;
        const displayX = rect.left - containerRect.left;
        const displayY = rect.top - containerRect.top;
        
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        let vertices = [];
        const randomRange = (min, max) => min + (max - min) * Math.random();

        for (let i = 0; i < 400; i++) {
            vertices.push([randomRange(0, displayWidth), randomRange(0, displayHeight)]);
        }
        vertices.push([clickX, clickY], [0, 0], [displayWidth, 0], [0, displayHeight], [displayWidth, displayHeight]);
        
        const indices = Delaunay.triangulate(vertices);
        const fragments = [];

        for (let i = 0; i < indices.length; i += 3) {
            const p0 = vertices[indices[i]], p1 = vertices[indices[i + 1]], p2 = vertices[indices[i + 2]];
            if (!p0 || !p1 || !p2) continue;
            
            const canvas = document.createElement('canvas');
            const box = {
                x: Math.min(p0[0], p1[0], p2[0]),
                y: Math.min(p0[1], p1[1], p2[1]),
                w: Math.max(p0[0], p1[0], p2[0]) - Math.min(p0[0], p1[0], p2[0]),
                h: Math.max(p0[1], p1[1], p2[1]) - Math.min(p0[1], p1[1], p2[1]),
            };
            if (box.w === 0 || box.h === 0) continue;

            canvas.width = box.w;
            canvas.height = box.h;
            canvas.style.cssText = `position:absolute; left:${displayX + box.x}px; top:${displayY + box.y}px; width:${box.w}px; height:${box.h}px; opacity: 1;`;
            
            const ctx = canvas.getContext('2d');
            ctx.translate(-box.x, -box.y);
            ctx.beginPath();
            ctx.moveTo(p0[0], p0[1]);
            ctx.lineTo(p1[0], p1[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(imageElement, 0, 0, displayWidth, displayHeight);
            
            fragments.push(canvas);
            container.appendChild(canvas);
        }

        // ★★★ アニメーションの修正 ★★★
        gsap.to(fragments, {
            duration: 1.5,
            x: (i, target) => {
                const centerX = displayWidth / 2;
                const fragmentCenterX = parseFloat(target.style.left) + parseFloat(target.style.width) / 2 - displayX;
                return (fragmentCenterX - centerX) * randomRange(1.2, 2.0); // よりダイナミックに
            },
            y: (i, target) => {
                const centerY = displayHeight / 2;
                const fragmentCenterY = parseFloat(target.style.top) + parseFloat(target.style.height) / 2 - displayY;
                return (fragmentCenterY - centerY) * randomRange(1.2, 2.0); // よりダイナミックに
            },
            rotation: () => randomRange(-1080, 1080), // 回転数を増やす
            scale: () => randomRange(0.8, 1.5),
            autoAlpha: 0,
            ease: 'expo.out', // より爆発的なイージングに変更
            stagger: 0, // ★ staggerを0にして、全破片が同時に動き出すようにする
            onComplete: () => {
                fragments.forEach(canvas => {
                    if (container.contains(canvas)) {
                        container.removeChild(canvas);
                    }
                });
                onTransitionEnd();
            },
        });
    };

    return (
        <div 
            ref={containerRef} 
            className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden"
            onClick={isLoaded && !isShattered ? handleShatter : undefined}
        >
            {error && <div className="absolute z-10 text-red-500 bg-black/50 p-2">{error}</div>}
            
            <motion.img 
                ref={imageRef}
                src="/images/shatter-image.jpg"
                alt="Shatter Target"
                // ★★★ 画像サイズの修正 ★★★
                // max-w-full, max-h-full を削除し、w-full, h-full にすることで
                // 親要素（画面全体）に合わせて最大化される
                className="w-full h-full object-contain cursor-pointer"
                style={{ opacity: isLoaded && !isShattered ? 1 : 0 }}
                onLoad={() => setIsLoaded(true)}
                onError={() => setError("画像読み込み失敗: public/images/shatter-image.jpg を確認してください。")}
            />
        </div>
    );
};

export default ShatterScreen;