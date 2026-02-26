import "./ModalLoading.style.scss";

export const ModalLoadingIndicator = ({ message = "데이터 스캔 중..." }) => {
    return (
        <div className="modal-loader-wrapper">
            <div className="cyber-spinner">
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="ring"></div>
                <div className="scanning-dot"></div>
            </div>
            <p className="modal-loading-text">{message}</p>
        </div>
    );
};
