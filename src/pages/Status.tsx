import { useState, useEffect, useCallback } from "react";
import "./styles/Status.style.scss";
import { Helmet } from "react-helmet";
import type { StudentInfo } from "@/apis/types";
import { CButton, CustomForm, type InputValueType } from "@/components/_common";
import { ROUTE_PATH } from "@/routes";
import { RenderInventoryController } from "@/components/Status/inventory";
import { useUserInfo } from "@/contexts/UserInfoContext";
import { useFetch } from "@/hooks/useFetch";
import { useModal } from "@/contexts/ModalContext";
import { LoadingIndicator } from "@/components/Status/LoadingIndicator";

const Status = () => {
    const { userInfo, handleUserInfo } = useUserInfo();
    const [result, setResult] = useState<StudentInfo | null>(null);
    const { open, close } = useModal();

    // 메인 페이지용 fetch
    const { error, isLoading, fetchData } = useFetch<StudentInfo>({
        action: "getstudentinfo",
    });

    const currentExp = result?.exp || 0;
    const remainExp = result?.remainExp || 0;
    const totalExpNeeded = currentExp + remainExp;
    const percent = totalExpNeeded > 0 ? Math.min(100, Math.floor((currentExp / totalExpNeeded) * 100)) : 0;

    // 🌟 데이터를 로드하는 공통 함수
    const loadData = useCallback(
        async (name: string, phone: string) => {
            const data = await fetchData(`name=${name}&phone=${phone}`);
            if (data) {
                setResult(data);
                handleUserInfo({ name, phone, goldLeft: data.goldLeft || 0 });
                return true;
            }
            return false;
        },
        [fetchData, handleUserInfo],
    );

    // 초기 진입 시 정보 있으면 로드
    useEffect(() => {
        if (userInfo.name && userInfo.phone && !result && !isLoading) {
            loadData(userInfo.name, userInfo.phone);
        }
    }, [userInfo.name, userInfo.phone, result, isLoading, loadData]);

    // 🌟 [핵심] 모달을 띄우는 함수
    const openSearchModal = () => {
        open({
            id: "status-search-modal",
            title: "플레이어 검색",
            mode: "no-btn",
            content: (
                <StatusSearchContent
                    onSuccess={(data, name, phone) => {
                        setResult(data);
                        handleUserInfo({ name, phone, goldLeft: data.goldLeft || 0 });
                        close("status-search-modal");
                    }}
                    onCancel={() => close("status-search-modal")}
                />
            ),
        });
    };

    return (
        <div className="form-container">
            <Helmet>
                <title>파밍 대시보드</title>
            </Helmet>

            <h1 className="player-title"> ⛏️ 파밍을 얼마나 열심히 했는지 볼 수 있는 곳</h1>
            {/* 🌟 CASE 1: 정보가 없는 경우 (통합형 알림 바) */}
            {!userInfo.name && !isLoading && (
                <div className="empty-state-container">
                    <div className="status-msg-wrap">
                        <p className="status-msg">플레이어 정보가 없습니다.</p>
                        <span className="status-sub">유저 정보 찾기를 눌러서 검색해 주세요.</span>
                    </div>

                    <div className="empty-actions">
                        <CButton mode="primary" className="search-trigger-btn" onClick={openSearchModal}>
                            <span className="icon">🔍</span>
                            <span>유저 정보 찾기</span>
                        </CButton>
                        <CButton mode="link" to={ROUTE_PATH.ROOT} className="empty-home-btn">
                            🏠 메인으로
                        </CButton>
                    </div>
                </div>
            )}

            {/* 로딩/에러 표시 */}
            {isLoading && !result && (
                <div style={{ padding: "50px 0" }}>
                    <LoadingIndicator />
                </div>
            )}
            {error && !result && <p className="status-msg error">{error}</p>}

            {/* 🌟 CASE 2: 플레이어 정보가 있는 경우 (결과 카드 + 하단 버튼) */}
            {result && !isLoading && (
                <>
                    {/* 정보가 있을 때만 나타나는 하단 버튼 섹션 */}
                    <div className="actions" style={{ marginTop: "20px" }}>
                        <CButton mode="link" to={ROUTE_PATH.ROOT} className="common-action-btn">
                            🏠 메인으로
                        </CButton>
                        <CButton mode="primary" className="common-action-btn" onClick={openSearchModal}>
                            🔍 다시 검색
                        </CButton>
                    </div>
                </>
            )}

            {error && !result && <p className="status-msg error">{error}</p>}

            {result && !isLoading && (
                <div className="player-card">
                    <div className="exp-section">
                        <div className="header-info">
                            <h2 className="lv-name">
                                Lv.{result.lv} {result.name}
                            </h2>
                            <span className="gold-text">💰 {result.goldLeft?.toLocaleString()} G</span>
                        </div>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${percent}%` }}></div>
                        </div>
                        <p className="sub">
                            현재 {percent}% | 다음 레벨까지 <b>{remainExp.toLocaleString()}</b> EXP 남음
                        </p>
                    </div>

                    <div className="gold-summary">
                        <div className="stat-box">
                            <p className="label">총 획득</p>
                            <p className="val get">{result.goldGet?.toLocaleString()} G</p>
                        </div>
                        <div className="stat-box">
                            <p className="label">총 사용</p>
                            <p className="val use">{result.goldUse?.toLocaleString()} G</p>
                        </div>
                        <div className="stat-box">
                            <p className="label">보유 중</p>
                            <p className="val left">{result.goldLeft?.toLocaleString()} G</p>
                        </div>
                    </div>

                    <div className="inventory-section">
                        <RenderInventoryController isLoading={isLoading} error={error} result={result} />
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * 🌟 모달 전용 검색 컨텐츠 컴포넌트
 * (Status 내부에서 정의하거나 분리해서 사용)
 */
const StatusSearchContent = ({
    onSuccess,
    onCancel,
}: {
    onSuccess: (data: StudentInfo, name: string, phone: string) => void;
    onCancel: () => void;
}) => {
    const { isLoading, error, fetchData } = useFetch<StudentInfo>({ action: "getstudentinfo" });

    const handleSearch = async (value?: InputValueType) => {
        if (!value?.name || !value?.phone) return;
        const data = await fetchData(`name=${value.name}&phone=${value.phone}`);
        if (data) {
            onSuccess(data, value.name, value.phone);
        }
    };

    return (
        <div className="store-entrance">
            {error && (
                <p className="status-msg error" style={{ color: "#ef4444", textAlign: "center", marginBottom: "10px" }}>
                    {error}
                </p>
            )}
            {isLoading ? (
                <div style={{ padding: "40px 0" }}>
                    <LoadingIndicator size="small" />
                </div>
            ) : (
                <CustomForm submitCallback={handleSearch} onCancel={onCancel} />
            )}
        </div>
    );
};

export default Status;
