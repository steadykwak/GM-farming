import { Helmet } from "react-helmet";
import "./styles/Ranking.style.scss";
import { CButton } from "@/components/_common";
import { ROUTE_PATH } from "@/routes";
import { useFetch } from "@/hooks/useFetch";
import { useUserInfo } from "@/contexts/UserInfoContext";

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

    // [수정] batchId를 직접 전달하지 않습니다.
    // useFetch 내부의 BATCH_ID 상수가 환경 변수를 읽어 처리합니다.
    const { isLoading, error, fetchData } = useFetch({
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
    }, [fetchData]); // fetchData를 의존성에 추가

    return (
        <>
            <Helmet>
                <meta name="description" content="This is the ranking page of My App." />
                <title>Farming Rank</title>
            </Helmet>
            <h1>🏆 랭킹</h1>
            <CButton mode="link" to={ROUTE_PATH.ROOT} className="back-home">
                🏠 메인으로 돌아가기
            </CButton>
            <table className="ranking-table">
                <thead>
                    <tr>
                        <th>플레이어</th>
                        <th>레벨</th>
                        <th>경험치</th>
                        <th>다음 레벨까지</th>
                        <th>티어</th>
                    </tr>
                </thead>
                <tbody id="ranking-body">
                    {isLoading ? (
                        <tr>
                            <td colSpan={5}>⏳ 랭킹 데이터를 불러오는 중...</td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={5}>❗ 오류가 발생했습니다: {error}</td>
                        </tr>
                    ) : rank && rank.length > 0 ? (
                        <RankList rank={rank} />
                    ) : (
                        <tr>
                            <td colSpan={5}>랭킹 데이터가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
};

interface RankListProps {
    rank: RankEntry[];
}

type RankRefType = { groupRank: number };

function RankList({ rank }: RankListProps) {
    const { userInfo } = useUserInfo();
    const myRank = useRef<HTMLTableRowElement>(null);
    const rankRef = useRef<RankRefType>({ groupRank: 0 });

    useEffect(() => {
        if (!myRank.current || !userInfo.name) {
            return;
        }
        myRank.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
        myRank.current.focus();
    }, [userInfo.name]);

    return (
        <>
            {rank.map((entry, index, rawRank) => {
                // 새로운 점수 그룹인지 확인
                if (index === 0 || entry.lv !== rawRank[index - 1]?.lv || entry.exp !== rawRank[index - 1]?.exp) {
                    // 새로운 그룹이 등장할 때마다 1등, 2등, 3등 순위 증가
                    rankRef.current.groupRank += 1;
                }

                const currentRank = rankRef.current.groupRank;

                let medal = "";
                const isMe = entry.name === userInfo.name;
                let className = "";

                switch (currentRank) {
                    case 1:
                        className = isMe ? "my-rank first" : "first";
                        medal = "🥇";
                        break;
                    case 2:
                        className = isMe ? "my-rank second" : "second";
                        medal = "🥈";
                        break;
                    case 3:
                        className = isMe ? "my-rank third" : "third";
                        medal = "🥉";
                        break;
                    default:
                        className = isMe ? "my-rank" : "";
                }

                return (
                    <tr key={index} ref={isMe ? myRank : null} className={className}>
                        <td>
                            {medal} {entry.name}
                        </td>
                        <td>Lv {entry.lv}</td>
                        <td>⭐ {entry.exp.toLocaleString()}</td>
                        <td>{entry.remainExp.toLocaleString()}</td>
                        <td>{entry.tier}</td>
                    </tr>
                );
            })}
        </>
    );
}

export default Ranking;
