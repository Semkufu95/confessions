import {AuthProvider, useAuth} from "./context/AuthContext.tsx";
import {AppProvider} from "./context/AppContext";
import React from "react";
import { BrowserRouter as Router,Routes, Route, Navigate} from "react-router-dom"
import {Home} from "./pages/Home.tsx";
import {Layout} from "./components/layout/Layout.tsx";

function ProtectedRoute({ children }: { children: React.ReactNode}) {
    const { user } = useAuth();
    return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
    // const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Home />}/>
        </Routes>
    )
}

function App() {
  return (
      <AuthProvider>
          <AppProvider>
              <Router>
                  <Layout>
                      <AppRoutes />
                  </Layout>
              </Router>
          </AppProvider>
      </AuthProvider>
  )
}

export default App;
