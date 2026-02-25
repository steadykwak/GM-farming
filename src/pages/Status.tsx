import "./styles/Status.style.scss";
import { Helmet } from "react-helmet";
import type { StudentInfo } from "@/apis/types";
import { CButton, CustomForm, type InputValueType } from "@/components/_common";
import { ROUTE_PATH } from "@/routes";
import { RenderResultController } from "@/components/Status/result";
import { RenderInventoryController } from "@/components/Status/inventory";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { useFetch } from "@/hooks/useFetch";

const Status = () => {
    const { userInfo, handleUserInfo, removeUserInfo } = useUserInfo();
    const [result, setResult] = useState<StudentInfo | null>(null);

    // 훅 내부에서 BATCH_ID를 알아서 처리하므로 수정 불필요
    const { error, isLoading, fetchData } = useFetch<StudentInfo>({
        action: "getstudentinfo",
    });

    const getUserStatus = useCallback(
        async (nameArg?: string, phoneArg?: string) => {
            const searchName = nameArg;
            const searchPhone = phoneArg;

            if (!searchName || !searchPhone) return;

            try {
                const query = `name=${searchName}&phone=${searchPhone}`;
                const data = await fetchData(query);

                if (data) {
                    setResult(data);
                    // handleUserInfo 호출로 인한 리렌더링이
                    // getUserStatus의 재생성을 유발하지 않도록 설계됨
                    handleUserInfo({
                        name: searchName,
                        phone: searchPhone,
                        goldLeft: data.goldLeft || 0,
                    });
                }
            } catch (error) {
                console.error("사용자 정보 조회 실패:", error);
            }
        },
        [fetchData, handleUserInfo], // userInfo.name/phone을 의존성에서 제거!
    );

    const submitCallback = async (value?: InputValueType) => {
        if (value?.name && value?.phone) {
            await getUserStatus(value.name, value.phone);
        }
    };

    useEffect(() => {
        if (userInfo.name && userInfo.phone && !result) {
            // !result 조건을 추가하면 이미 데이터를 가져온 후에는 재요청하지 않습니다.
            getUserStatus(userInfo.name, userInfo.phone);
        }
    }, [userInfo.name, userInfo.phone, getUserStatus, result]);

    return (
        <>
            <Helmet>
                <meta name="description" content="This is the status page." />
                <title>파밍 대시보드</title>
            </Helmet>
            <div className="form-container">
                <h1> ⛏️ 파밍을 얼마나 열심히 했는지 볼 수 있는 곳 👩🏻‍🌾</h1>
                {error && <p>{error}</p>}
                {userInfo.name
                    ? isLoading || (
                          <>
                              <CButton mode="link" to={ROUTE_PATH.ROOT} className="back-home">
                                  🏠 메인으로 돌아가기
                              </CButton>
                              <CButton className="back-home" mode="primary" onClick={removeUserInfo}>
                                  🔍 다른 플레이어 검색하기
                              </CButton>
                          </>
                      )
                    : isLoading || <CustomForm submitCallback={submitCallback} />}
            </div>

            <div className="result-container">
                <div id="result" className="result">
                    <RenderResultController isLoading={isLoading} error={error} result={result} />
                </div>
                <div id="inventory" className="inventory">
                    <RenderInventoryController isLoading={isLoading} error={error} result={result} />
                </div>
            </div>
        </>
    );
};

export default Status;
