import { Helmet } from "react-helmet";
import "./styles/Ranking.style.scss";
import { CButton } from "@/components/_common";
import { ROUTE_PATH } from "@/routes";
import { useFetch } from "@/hooks/useFetch";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { useState, useEffect, useRef } from "react"; // useState, useEffect 추가

interface RankEntry {
    name: string;
    lv: number;
    exp: number;
    goldLeft: number;
    remainExp: number;
    tier: string;
}

const Ranking = () => {
    const [rank, setRank] = useState<RankEntry[]>([]);
    const { isLoading, error, fetchData } = useFetch<RankEntry[]>({
        action: "getranking",
    });

    useEffect(() => {
        const fetchRankingData = async () => {
            try {
                const data = await fetchData();
                if (data) setRank(data);
            } catch (error) {
                console.log("Ranking fetch error:", error);
            }
        };
        fetchRankingData();
    }, [fetchData]);

    return (
        <div className="ranking-container">
            <Helmet>
                <meta name="description" content="명예의 전당 - 최고의 파머를 가립니다." />
                <title>Farming Rank | 명예의 전당</title>
            </Helmet>

            <header className="ranking-header">
                <h1 className="glitch-title">🏆 명예의 전당</h1>
                <div className="ranking-actions">
                    {" "}
                    {/* 버튼 크기 제어를 위한 컨테이너 추가 */}
                    <CButton mode="link" to={ROUTE_PATH.ROOT} className="common-action-btn">
                        🏠 메인으로 돌아가기
                    </CButton>
                    <CButton
                        mode="default"
                        className="common-action-btn"
                        onClick={() => {
                            // .my-rank 클래스를 가진 요소를 직접 찾아서 스크롤
                            const myRankElement = document.querySelector(".my-rank");
                            if (myRankElement) {
                                myRankElement.scrollIntoView({ behavior: "smooth", block: "center" });
                            } else {
                                alert("현재 랭킹 데이터에서 본인을 찾을 수 없습니다.");
                            }
                        }}
                    >
                        📍 내 순위 보기
                    </CButton>
                </div>
            </header>

            <div className="table-wrapper">
                <table className="ranking-table">
                    <thead>
                        <tr>
                            <th>순위</th> {/* 열 추가 */}
                            <th>플레이어</th>
                            <th>레벨</th>
                            <th>경험치</th>
                            <th>다음 레벨까지</th>
                            <th>티어</th>
                        </tr>
                    </thead>
                    <tbody id="ranking-body">
                        {isLoading ? (
                            <tr className="status-row">
                                <td colSpan={6}>
                                    <div className="status-msg loading">순위 데이터를 동기화 중...</div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="status-msg error">
                                    ❗ 시스템 오류: {error}
                                </td>
                            </tr>
                        ) : rank && rank.length > 0 ? (
                            <RankList rank={rank} /> // 이 주변에 중괄호 외의 문자열이나 공백이 없어야 함
                        ) : (
                            <tr>
                                <td colSpan={6} className="status-msg">
                                    기록된 데이터가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

function RankList({ rank }: { rank: RankEntry[] }) {
    const { userInfo } = useUserInfo();
    const myRankRef = useRef<HTMLTableRowElement>(null);

    // 렌더링 시점에 순위를 계산 (Ref 대신 지역 변수 사용으로 버그 방지)
    let groupRank = 0;

    useEffect(() => {
        if (myRankRef.current) {
            myRankRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [rank]);

    return (
        <>
            {rank.map((entry, index) => {
                // 공동 순위 계산 로직
                const isSameAsPrev = index > 0 && entry.lv === rank[index - 1].lv && entry.exp === rank[index - 1].exp;

                if (!isSameAsPrev) {
                    groupRank = index + 1; // 1부터 시작하는 실제 순위
                }

                const isMe = entry.name === userInfo.name;
                let medal = "";
                let rankClass = "";

                if (groupRank === 1) {
                    medal = "🥇";
                    rankClass = "first";
                } else if (groupRank === 2) {
                    medal = "🥈";
                    rankClass = "second";
                } else if (groupRank === 3) {
                    medal = "🥉";
                    rankClass = "third";
                }
                return (
                    <tr
                        key={`${entry.name}-${index}`}
                        ref={isMe ? myRankRef : null}
                        className={`${rankClass} ${isMe ? "my-rank" : ""}`}
                    >
                        <td className="rank-col">
                            <span className="rank-num">{medal || groupRank}</span>
                        </td>
                        <td className="player-col">
                            <span className="player-name">{entry.name}</span>
                        </td>
                        <td className="lv-col">
                            <span className="lv-text">Lv</span> {entry.lv}
                        </td>
                        <td className="exp-col">⭐ {entry.exp.toLocaleString()}</td>
                        <td className="remain-col">
                            {entry.remainExp === 0 ? "MAX" : entry.remainExp.toLocaleString()}
                        </td>
                        <td className="tier-col">
                            <span className={`tier-tag ${entry.tier.toLowerCase()}`}>{entry.tier}</span>
                        </td>
                    </tr>
                );
            })}
        </>
    );
}
export default Ranking;
