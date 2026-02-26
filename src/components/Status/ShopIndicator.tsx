import { useState, useEffect } from "react";
import "./ShopIndicator.style.scss";

interface ShopIndicatorProps {
    size?: "normal" | "small";
}

export const ShopIndicator = ({ size = "normal" }: ShopIndicatorProps) => {
    const [dots, setDots] = useState("");
    const baseText = "아이템을 배송 중입니다"; // 띄어쓰기 포함

    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // 🌟 띄어쓰기 완벽 대응 물결 텍스트
    const wavyText = baseText.split("").map((char, index) => {
        if (char === " ") {
            return (
                <span key={index} className="wavy-space">
                    &nbsp;
                </span>
            );
        }
        return (
            <span key={index} className="wavy-char" style={{ animationDelay: `${index * 0.07}s` }}>
                {char}
            </span>
        );
    });

    return (
        <div className={`shop-loader-container ${size}`}>
            <div className="throw-stage">
                {/* 출발지: 쇼핑 카트 */}
                <span className="source-cart">🛒</span>

                {/* 배송 물품: 포물선 이동 */}
                <div className="bag-wrapper-x">
                    <span className="flying-bag-y">🛍️</span>
                </div>

                {/* 목적지: 플레이어 가방 */}
                <span className="receiving-pack">🎒</span>
            </div>

            <div className="wavy-text-wrapper">
                <p className="shop-loading-text">
                    {wavyText}
                    <span className="dot-sync">{dots}</span>
                </p>
            </div>
        </div>
    );
};
