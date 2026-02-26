import { createRoot } from "react-dom/client";
import { CookiesProvider } from "react-cookie";
import { UserInfoProvider } from "./contexts/UserInfoContext.tsx";
import "./index.scss";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <CookiesProvider>
        <UserInfoProvider>
            <App />
        </UserInfoProvider>
    </CookiesProvider>,
);
