import { BrowserRouter as Router } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import Layout from "./components/Layout";
import AnimatedRoutes from "./components/AnimatedRoutes";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <Router>
            <Layout>
              <AnimatedRoutes />
            </Layout>
          </Router>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

