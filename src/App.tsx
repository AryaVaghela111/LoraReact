import { useState } from 'react'
import Layout from "./components/Layout";
import PacketList from "./components/PacketList";
import { Provider } from "./components/ui/provider"; 
import './App.css'

function App() {

  return (
    <>
    <Provider>
      <Layout>
        <PacketList />
      </Layout>
      </Provider>
    </>
  )
}

export default App
