import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { jwtDecode } from 'jwt-decode';  // Correct import for jwt-decode
import Dashboard from './pages/Dashboard';
import LeftPanel from './components/LeftPanel';
import Medicines from './pages/Medicines';
import MedicineCreate from './pages/MedicineCreate';
import InvoiceCreate from './pages/InvoiceCreate';
import InvoiceView from './pages/InvoiceView';
import CustomerCreate from './pages/CustomerCreate';
import Customers from './pages/Customers';
import SupplierCreate from './pages/SupplierCreate';
import Suppliers from './pages/Suppliers';
import SalesReport from './pages/SalesReport';
import PurchaseReport from './pages/PurchaseReport';
import LoginPage from './pages/LoginPage';
import ActivityLogs from './pages/ActivityLogs';
import { useEffect, useState } from 'react';

// Layout for all protected pages
const Layout = ({ children }) => (
  <div className="flex">
    <LeftPanel />
    <div className="ml-[20%] w-[80%] p-6">{children}</div>
  </div>
);

// ProtectedRoute to handle authentication
const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      // Check if token is expired
      try {
        const decodedToken = jwtDecode(token); // Decode token using jwt-decode
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expired, redirect to login
          localStorage.removeItem("token");
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Token decoding error", error);
        localStorage.removeItem("token");
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div>Loading...</div>; // Show loading while checking auth
  }

  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine/add"
          element={
            <ProtectedRoute>
              <Layout>
                <MedicineCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/medicine/inventory"
          element={
            <ProtectedRoute>
              <Layout>
                <Medicines />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/create"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/view"
          element={
            <ProtectedRoute>
              <Layout>
                <InvoiceView />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/add"
          element={
            <ProtectedRoute>
              <Layout>
                <CustomerCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer/view"
          element={
            <ProtectedRoute>
              <Layout>
                <Customers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/add"
          element={
            <ProtectedRoute>
              <Layout>
                <SupplierCreate />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/view"
          element={
            <ProtectedRoute>
              <Layout>
                <Suppliers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/sales"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesReport />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/purchase"
          element={
            <ProtectedRoute>
              <Layout>
                <PurchaseReport />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <Layout>
                <ActivityLogs />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route to redirect to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
