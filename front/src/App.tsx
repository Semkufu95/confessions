
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Starred } from './pages/Starred';
import { Connections } from './pages/Connections';
import { ConnectionProfilePage } from './pages/ConnectionProfile';
import { Profile } from './pages/Profile';
import { ConfessionDetail } from './pages/ConfessionDetail';
import { ComingSoon } from './pages/ComingSoon';
import { ContactUs } from './pages/ContactUs';
import { TermsOfService } from './pages/TermsOfService';
import { CommunityGuidelines } from './pages/CommunityGuidelines';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { useAuth } from './context/AuthContext';
//
// function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const { user } = useAuth();
//     return user ? <>{children}</> : <Navigate to="/login" />;
// }

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
            <Route path="/starred" element={<Starred />} />
            <Route path="/connections" element={<Connections />} />
            <Route path="/connections/:id/profile" element={<ConnectionProfilePage />} />
            <Route path="/messages" element={<ComingSoon />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/confession/:id" element={<ConfessionDetail />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/help" element={<ComingSoon />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        </Routes>
    );
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
    );
}

export default App;
