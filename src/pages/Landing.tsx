import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // useNavigate 추가
import "./styles/Landing.style.scss";
import type { StudentInfo } from "@/apis/types";
import { ROUTE_PATH } from "@/routes";
import { useModal } from "@/contexts/ModalContext";
import { CButton, CustomForm, type InputValueType } from "@/components/_common";
import { useFetch } from "@/hooks/useFetch";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { LoadingIndicator } from "@/components/Status/LoadingIndicator";

const Landing = () => {
    const { open } = useModal(); // useModal 구조 분해
    const { userInfo, handleUserInfo } = useUserInfo();
    const navigate = useNavigate();
    const { fetchData } = useFetch<StudentInfo>({ action: "getstudentinfo" });

    const entranceStore = () => {
        // 사용자 정보가 없으면 모달을 띄움
        if (!userInfo.name || !userInfo.phone) {
            open({
                id: "store-entrance",
                title: "상점 입장",
                content: <StoreEntrance />,
                mode: "no-btn", // 하단 기본 버튼 숨김
            });
        } else {
            // 정보가 있으면 바로 상점으로 이동
            navigate(ROUTE_PATH.STORE);
        }
    };

    // 기존의 무한 루프 위험이 있던 useEffect 교정
    useEffect(() => {
        if (userInfo.name && userInfo.phone) {
            const fetchLatestInfo = async () => {
                const data = await fetchData(`name=${userInfo.name}&phone=${userInfo.phone}`);
                if (data) {
                    handleUserInfo({
                        ...userInfo,
                        goldLeft: data.goldLeft,
                    });
                }
            };
            fetchLatestInfo();
        }
    }, []); // 초기 1회만 실행

    return (
        <main className="container">
            <CButton className="menuBtn" mode="link" to={ROUTE_PATH.STATUS}>
                🔍 플레이어 상태 확인하기
            </CButton>
            <CButton className="menuBtn" mode="link" to={ROUTE_PATH.RANKING}>
                🏆 랭킹보기
            </CButton>
            <CButton className="menuBtn" mode="default" onClick={entranceStore}>
                🛒 상점가기
            </CButton>
        </main>
    );
};

/** * 🌟 Store.tsx와 동일한 로직을 가진 모달 컨텐츠 컴포넌트
 */
const StoreEntrance = () => {
    const { close } = useModal();
    const { handleUserInfo } = useUserInfo();
    const navigate = useNavigate();
    const { isLoading, error, fetchData } = useFetch<StudentInfo>({
        action: "getstudentinfo",
    });

    const submitCallback = async (value?: InputValueType) => {
        if (!value?.name || !value?.phone) return;

        const data = await fetchData(`name=${value.name}&phone=${value.phone}`);
        if (!data) return;

        handleUserInfo({
            name: value.name,
            phone: value.phone,
            goldLeft: data.goldLeft,
        });

        // 모달 닫고 상점으로 이동
        close("store-entrance");
        navigate(ROUTE_PATH.STORE);
    };

    return (
        <div className="store-entrance">
            {/* 상단 에러 메시지 표시 */}
            {!isLoading && error && (
                <p className="status-msg error" style={{ color: "#ef4444", textAlign: "center", marginBottom: "10px" }}>
                    {error}
                </p>
            )}

            {isLoading ? (
                <div style={{ padding: "40px 0" }}>
                    <LoadingIndicator />
                </div>
            ) : (
                <CustomForm
                    submitCallback={submitCallback}
                    // 🔥 Store/Status와 동일하게 하단 닫기 버튼으로 모달을 닫음
                    onCancel={() => close("store-entrance")}
                />
            )}
        </div>
    );
};

export default Landing;
