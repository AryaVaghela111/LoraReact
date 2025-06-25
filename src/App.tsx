import Layout from "./components/Layout";
import { Provider } from "./components/ui/provider";
import './App.css';
import Dashboard from "./components/Dashboard";


function App() {
  return (
    <Provider>
      <Layout>
        <Dashboard />
      </Layout>
    </Provider>
  );
}

export default App;
