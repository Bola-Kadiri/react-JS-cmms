import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
// import { RouterProvider } from "react-router-dom";
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
// import { router } from "./routes";
import routes from "./routes";
import { AuthProvider } from "./contexts/AuthContext";
import { LogoutProvider } from "./contexts/LogoutContext";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { createQueryClient } from './lib/queryClient';

// Import i18n configuration
import './i18n';
import { PermissionsProvider } from "./contexts/PermissionsContext";

// Create a client
const queryClient = createQueryClient();

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} /> {/* DevTools - remove in production if desired */}
    </QueryClientProvider>
  );
}

// Routes component that uses the routes configuration
const AppRoutes = () => {
  const routeElements = useRoutes(routes);
  return routeElements;
};

const App = () => (
  <QueryProvider>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {/* <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter> */}
      {/* <RouterProvider router={router} /> */}
      <Router>
        <AuthProvider>
          <LogoutProvider>
            <PermissionsProvider>
              <AppRoutes />
            </PermissionsProvider>
          </LogoutProvider>
        </AuthProvider>
      </Router>
    </TooltipProvider>
  </QueryProvider>
);

export default App;
