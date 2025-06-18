
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // For demo purposes, we'll use admin role. In real app, this would come from authentication
  const userRole = 'admin' as 'admin' | 'seller';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar userRole={userRole} />
            <main className="flex-1 p-6 ml-64">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/reports" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Reports Page</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                <Route path="/users" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Users Management</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                <Route path="/settings" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Settings</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                <Route path="/receipts" element={<div className="text-center py-12"><h1 className="text-2xl font-bold">Receipts</h1><p className="text-gray-600 mt-2">Coming soon...</p></div>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
