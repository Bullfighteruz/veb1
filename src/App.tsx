import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/useCart";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{
            style: {
              background: "rgba(18,22,31,0.9)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              backdropFilter: "blur(20px)",
            },
          }}
        />
      </CartProvider>
    </BrowserRouter>
  );
}
