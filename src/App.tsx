import Layout from "./components/Layout";
// import PacketList from "./components/PacketList";
import { Provider } from "./components/ui/provider"; 
import './App.css'
import PacketTable from "./components/PacketTable";

function App() {

  return (
    <>
    <Provider>
      <Layout>
        <PacketTable />
      </Layout>
      </Provider>
    </>
  )
}

export default App
