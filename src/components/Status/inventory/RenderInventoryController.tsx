import { CButton } from "@/components/_common";
import { NoStudent } from "../NoStudent";
import { ROUTE_PATH } from "@/routes";
import type { StudentInfo } from "@/apis/types";
import { ShopIndicator } from "../ShopIndicator";

// [추가] 기수 판별 유틸리티 (다른 파일에 있다면 import 하세요)
const getBatchId = () => {
    if (import.meta.env.VITE_BATCH_ID) return import.meta.env.VITE_BATCH_ID;
    const url = window.location.href;
    const portMatch = url.match(/:50(\d+)/);
    if (portMatch) return parseInt(portMatch[1], 10).toString();
    const pathMatch = url.match(/(?:gm|batch|v|0)(\d+)/i);
    return pathMatch ? parseInt(pathMatch[1], 10).toString() : "1";
};

type InventoryProps = Pick<StudentInfo, "itemMeal" | "itemMentor" | "itemBook" | "itemZepPoint" | "itemUnityAsset">;
interface RendorInventoryControllerProps {
    isLoading: boolean;
    error: string;
    result: InventoryProps | null;
}

export const RenderInventoryController = ({ result, isLoading, error }: RendorInventoryControllerProps) => {
    if (isLoading) return <ShopIndicator />;
    if (error) return <NoStudent />;
    if (!result) return "";

    const items = [
        { id: "meal", name: "GM 식사권", icon: "🎫", count: result.itemMeal },
        { id: "mentor", name: "멘토링 신청권", icon: "🎟️", count: result.itemMentor },
        { id: "book", name: "도서 구매권", icon: "📚", count: result.itemBook },
        { id: "zep", name: "ZEP 포인트 구매권", icon: "🪙", count: result.itemZepPoint },
        { id: "asset", name: "Unity 에셋 구매권", icon: "🎁", count: result.itemUnityAsset },
    ];

    // [수정] URL includes 대신 batchId 기반 필터링
    const batchId = getBatchId();
    let visibleItems = items;

    // 1기: ZEP 포인트 숨기기
    if (batchId === "1") {
        visibleItems = visibleItems.filter((item) => item.id !== "zep");
    }

    // 2, 3기: Unity 에셋 숨기기
    if (batchId === "4" || batchId === "5") {
        visibleItems = visibleItems.filter((item) => item.id !== "asset");
    }

    return (
        <>
            <h2 className="inventory-title">🎒 인벤토리</h2>
            <div className="inv-grid">
                {visibleItems.map((item, index) => (
                    <div className={`inv-slot ${!item.count ? "inv-empty" : "has-item"}`} key={index}>
                        <span className="inv-icon">{item.icon}</span>
                        <p className="inv-name">{item.name}</p>
                        <span className="inv-count">{item.count ? item.count : "0"}</span>
                    </div>
                ))}
            </div>

            {/* [수정] 클래스명을 수정하여 에메랄드 네온 스타일 적용 */}
            <CButton
                mode="link"
                to={ROUTE_PATH.STORE}
                className="common-action-btn go-inventory" // 클래스명 두 개 확인!
            >
                🛒 상점 가기
            </CButton>
        </>
    );
};
