import { Box, Flex } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children }: { children: React.ReactNode }) => (
  <Flex direction="column" minH="100vh">
    <Header />
    <Box flex="1">{children}</Box>
    <Footer />
  </Flex>
);

export default Layout;
