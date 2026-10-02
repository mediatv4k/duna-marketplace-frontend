import type { Metadata } from "next";
import "./globals.css";
import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import { WishlistProvider } from "@/context/WishlistContext";

const PedidoAmigosFloating = dynamic(
  () => import("@/components/PedidoAmigosFloating").then(mod => mod.PedidoAmigosFloating),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Motor Maestro D'una | Marketplace",
  description: "Arquitectura EAV y componentes reutilizables",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Cuenta del cliente (opcional: comprar no exige sesión). Ver src/context/AuthContext.tsx */}
        <AuthProvider>
          {/* Avisos breves y favoritos de la cuenta (el corazón exige sesión). Ver src/context/WishlistContext.tsx */}
          <ToastProvider>
            <WishlistProvider>
              {children}
              <PedidoAmigosFloating />
            </WishlistProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
