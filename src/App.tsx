import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Home from "@/pages/Home"
import WorkList from "@/pages/WorkList"
import WorkDetail from "@/pages/WorkDetail"
import ServicePrint from "@/pages/ServicePrint"
import Quote from "@/pages/Quote"
import AdminLogin from "@/pages/admin/Login"
import RequireAdmin from "@/pages/admin/RequireAdmin"
import AdminLayout from "@/pages/admin/AdminLayout"
import AdminDashboard from "@/pages/admin/Dashboard"
import AdminProducts from "@/pages/admin/Products"
import AdminInquiries from "@/pages/admin/Inquiries"
import AdminPricing from "@/pages/admin/Pricing"
import AdminSettings from "@/pages/admin/Settings"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/service/print" element={<ServicePrint />} />
        <Route path="/work" element={<WorkList />} />
        <Route path="/work/:id" element={<WorkDetail />} />
        <Route path="/quote" element={<Quote />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
