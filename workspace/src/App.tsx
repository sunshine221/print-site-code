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
import AdminProductEdit from "@/pages/admin/ProductEdit"
import AdminInquiries from "@/pages/admin/Inquiries"
import AdminInquiryDetail from "@/pages/admin/InquiryDetail"
import AdminPricing from "@/pages/admin/Pricing"
import AdminPricingEdit from "@/pages/admin/PricingEdit"
import AdminSettings from "@/pages/admin/Settings"
import { useTheme } from "@/hooks/useTheme"

export default function App() {
  useTheme()

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
          <Route path="products/new" element={<AdminProductEdit />} />
          <Route path="products/:id/edit" element={<AdminProductEdit />} />
          <Route path="inquiries" element={<AdminInquiries />} />
          <Route path="inquiries/:id" element={<AdminInquiryDetail />} />
          <Route path="pricing" element={<AdminPricing />} />
          <Route path="pricing/new" element={<AdminPricingEdit />} />
          <Route path="pricing/:id/edit" element={<AdminPricingEdit />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}
