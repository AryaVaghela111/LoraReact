import Layout from "./components/Layout";
import { Provider } from "./components/ui/provider";
import './App.css';
import Dashboard from "./components/Dashboard";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SensorGraphsPage from "./components/SensorGraphsPage";
import { AutoRefreshProvider } from "./components/AutoRefreshContext";

function App() {
  return (
    <Provider>
      <AutoRefreshProvider>
        <Router>
          <Routes>
            <Route path="/" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/graphs" element={
              <Layout>
                <SensorGraphsPage />
              </Layout>
            } />
            <Route path="/graphs/:frequency" element={
              <Layout>
                <SensorGraphsPage />
              </Layout>
            } />
          </Routes>
        </Router>
      </AutoRefreshProvider>
    </Provider>
  );
}

export default App;