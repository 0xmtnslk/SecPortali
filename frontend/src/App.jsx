import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './layouts/Layout'
import Login from './pages/Login'
import Portal from './pages/Portal'
import Dashboard from './pages/Dashboard'
import Maintenance from './pages/Maintenance'
import FaultRequests from './pages/FaultRequests'
import AssetInventory from './pages/AssetInventory'
import AssetForm from './pages/AssetForm'
import AssetDetails from './pages/AssetDetails'
import Areas from './pages/Areas'
import AreaDetails from './pages/AreaDetails'
import Calendar from './pages/Calendar'
import Notifications from './pages/Notifications'
import SettingsPage from './pages/Settings'
import FacilitiesManagement from './components/FacilitiesManagement'
// import FacilitiesList from './pages/FacilitiesList'
import FacilityForm from './pages/FacilityForm'
import FacilityDetail from './pages/FacilityDetail'
import FacilityMap from './pages/FacilityMap'
import NotFound from './pages/NotFound'
import ModulePlaceholder from './pages/ModulePlaceholder'
import { 
  Users, 
  ClipboardCheck, 
  ShieldAlert, 
  HeartPulse, 
  Leaf, 
  BarChart3 
} from 'lucide-react'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Portal Route (No Sidebar Layout) */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Portal />
                </ProtectedRoute>
              }
            />
            
            {/* Protected Module Routes */}
            <Route 
              path="/eams" 
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="fault-requests" element={<FaultRequests />} />
              <Route path="assets" element={<AssetInventory />} />
              <Route path="assets/new" element={<AssetForm />} />
              <Route path="assets/:id" element={<AssetDetails />} />
              <Route path="assets/:id/edit" element={<AssetForm />} />
              <Route path="areas" element={<Areas />} />
              <Route path="areas/:id" element={<AreaDetails />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings/:tab" element={<SettingsPage />} />
            </Route>
  
            {/* Placeholder for other modules */}
            <Route path="/cms" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
               <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<ModulePlaceholder title="Taşeron Yönetim Modülü" icon={Users} color="text-indigo-600" />} />
            </Route>
  
            <Route path="/aums" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
               <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<ModulePlaceholder title="Denetim Yönetim Modülü" icon={ClipboardCheck} color="text-amber-600" />} />
            </Route>
  
            <Route path="/ohs" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
               <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<ModulePlaceholder title="İş Güvenliği Yönetimi" icon={ShieldAlert} color="text-red-600" />} />
            </Route>
  
            <Route path="/health" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
               <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<ModulePlaceholder title="İş Sağlığı Yönetimi" icon={HeartPulse} color="text-pink-600" />} />
            </Route>
  
            <Route path="/env" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
               <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<ModulePlaceholder title="Çevre Yönetimi" icon={Leaf} color="text-green-600" />} />
            </Route>
  
            <Route path="/sus" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
               <Route index element={<Navigate to="dashboard" replace />} />
               <Route path="dashboard" element={<ModulePlaceholder title="Sürdürülebilirlik Yönetimi" icon={BarChart3} color="text-teal-600" />} />
            </Route>
  
            {/* Global System Settings / Admin Panel */}
            <Route path="/settings" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="facilities/new" element={<FacilityForm />} />
              <Route path="facilities/edit/:id" element={<FacilityForm />} />
              <Route path="facilities/:id/edit" element={<FacilityForm />} />
              <Route path="facilities/:id" element={<FacilityDetail />} />
              <Route path=":tab" element={<SettingsPage />} />
            </Route>
  
            {/* Global Facility Management & Map */}
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="facilities/:facilityId/map" element={<FacilityMap />} />
              <Route path="settings/facilities/:id/edit" element={<FacilityForm />} />
              <Route path="settings/facilities/:id" element={<FacilityDetail />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
