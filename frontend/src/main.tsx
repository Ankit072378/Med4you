import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import "leaflet/dist/leaflet.css";

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);
