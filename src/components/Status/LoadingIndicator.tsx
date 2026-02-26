import "./LoadingIndicator.style.scss";

interface LoadingIndicatorProps {
    size?: "normal" | "small"; // 사이즈 조절용 프롭 추가
}

export const LoadingIndicator = ({ size = "normal" }: LoadingIndicatorProps) => {
    const messages = [
        { icon: "⛏️", text: "노가다의 흔적 분석 중...", type: "mine" },
        { icon: "⚙️", text: "레벨과 경험치 확인 중...", type: "gear" },
        { icon: "💎", text: "획득한 Gold 확인 중...", type: "gold" },
        { icon: "🎒", text: "인벤토리 정리 중...", type: "pack" },
    ];

    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % messages.length);
        }, 2500); // 콤팩트한 느낌을 위해 전환 속도를 살짝 올림
        return () => clearInterval(timer);
    }, []);

    const current = messages[msgIndex];

    return (
        /* 🌟 size 클래스 추가 */
        <div className={`industrial-loader-container ${size}`}>
            <div className="heavy-progress-track">
                <div className="hazard-bar-moving"></div>
            </div>

            <div className="loading-text-wrapper" key={msgIndex}>
                <span className={`working-icon ani-${current.type}`}>{current.icon}</span>
                <p className="industrial-loading-text">{current.text}</p>
            </div>
        </div>
    );
};
