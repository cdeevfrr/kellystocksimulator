// App.tsx
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { AssetsPage } from "./Pages/AssetsPage";
import { OldApp } from "./Pages/OldApp";
import { PortfoliosPage } from "./Pages/PortfoliosPage";

export default function App() {
  return (
    <BrowserRouter basename='/kellystocksimulator/'>
      <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
        <NavLink to="/assets">Assets</NavLink>
        <NavLink to="/portfolios">Portfolios</NavLink>
        <NavLink to="/oldApp">Old App</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<AssetsPage />} />
        <Route path="/assets" element={<AssetsPage />} />
        <Route path="/portfolios" element={<PortfoliosPage />} />
        <Route path="/oldApp" element={<OldApp />} />
      </Routes>
    </BrowserRouter>
  );
}