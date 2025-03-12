import { BrowserRouter, Route, Routes } from "react-router"
import UserRoutes from './users/pages/UserRoutes'
import AdminRoutes from "./admin/pages/AdminRoutes"
import './App.css'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "./ui/Tooltip";
import { Toaster } from "./ui/Toaster";
import { Toaster as Sonner } from "sonner"
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient();


const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;


function App() {


  return (
    <>
      <GoogleOAuthProvider clientId={googleClientId} >
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/*" element={<UserRoutes />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </>
  )
}

export default App
