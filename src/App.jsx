import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import Layout from "./components/Layout";
// Pages will be imported here
import Home from "./pages/Home";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import AnimatedRoutes from "./components/AnimatedRoutes";

// Placeholder components for pages initially
function Placeholder({ title }) {
  return <div className="container mx-auto px-4 py-12 text-center text-2xl dark:text-white">{title}</div>;
}

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

