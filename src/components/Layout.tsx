import { Flex } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" minH="100vh">
    <Header />
    <Flex flex="1" direction="row" overflow="hidden">
      {children}
    </Flex>
    <Footer />
  </Flex>
);

export default Layout;
