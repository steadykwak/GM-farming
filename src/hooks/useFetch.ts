import { useState, useCallback } from "react";

interface FetchParameters {
    action: string;
}

/** * [유틸리티] 현재 기수(batchId)를 결정하는 함수
 * 1순위: 환경 변수 (Vercel 배포용)
 * 2순위: 로컬 포트 번호 (로컬 테스트용)
 */
const getBatchId = () => {
    // 1. 배포 환경 변수 (Vercel) - 가장 정확함
    if (import.meta.env.VITE_BATCH_ID) {
        return import.meta.env.VITE_BATCH_ID;
    }

    const url = window.location.href;

    // 2. 로컬 포트 번호 추출 (예: :5010 -> 10)
    // 5000번대 포트를 쓴다고 가정할 때, 마지막 자리수들을 가져옵니다.
    const portMatch = url.match(/:50(\d+)/);
    if (portMatch && portMatch[1]) {
        // 5001 -> "01" -> "1", 5010 -> "10"
        return parseInt(portMatch[1], 10).toString();
    }

    // 3. URL 경로에서 기수 번호 추출 (예: gm01, gm10 또는 batch-1 등)
    // URL에서 gm이나 batch 뒤에 붙은 숫자를 찾습니다.
    const pathMatch = url.match(/(?:gm|batch|v|0)(\d+)/i);
    if (pathMatch && pathMatch[1]) {
        return parseInt(pathMatch[1], 10).toString();
    }

    // 4. 모든 조건 실패 시 기본값
    return "1";
};

// const BASE_URL = import.meta.env.DEV ? import.meta.env.VITE_TEST_BASE_URL : import.meta.env.VITE_BASE_URL || "/";
const BASE_URL = import.meta.env.VITE_BASE_URL || "";
export const useFetch = <T>({ action }: FetchParameters) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // action을 useRef에 담아서 fetchData가 action에 의존하지 않게 만듭니다.
    const actionRef = useRef(action);
    useEffect(() => {
        actionRef.current = action;
    }, [action]);

    const fetchData = useCallback(async (query?: string, fetchOptions?: RequestInit) => {
        try {
            setIsLoading(true);
            setError("");

            const currentBatchId = getBatchId();
            const params = new URLSearchParams();

            // actionRef.current를 사용하면 action이 바뀌어도 fetchData 함수 자체는 변하지 않습니다.
            params.append("action", actionRef.current);
            params.append("batchId", currentBatchId);

            if (query) {
                const queryParts = query.split("&");
                queryParts.forEach((part) => {
                    const [key, value] = part.split("=");
                    if (key && value) params.append(key, value);
                });
            }

            const url = `${BASE_URL}?${params.toString()}`;

            // POST body 처리 로직 (동일)
            let finalOptions = fetchOptions;
            if (fetchOptions?.method === "POST" && fetchOptions.body) {
                try {
                    const bodyObj = JSON.parse(fetchOptions.body as string);
                    bodyObj.batchId = currentBatchId;
                    finalOptions = { ...fetchOptions, body: JSON.stringify(bodyObj) };
                } catch (e) {
                    console.error(e);
                }
            }

            const response = await fetch(url, finalOptions);
            if (!response.ok) throw new Error("Network response was not ok");

            const result = await response.json();
            if (result && result.error) throw new Error(result.error);

            setData(result);
            return result;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "오류 발생";
            setError(message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, []); // 의존성 배열을 빈 배열로 두어 함수가 절대 변하지 않게 합니다.

    return { data, error, isLoading, fetchData };
};
