import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScanQR from "./components/QRScan";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<ScanQR title={"Xin mời quét thùng hàng"} />}
          ></Route>
          <Route
            path="/scan-warehouse"
            element={<ScanQR title={"Xin mời quét kho"} />}
          ></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
