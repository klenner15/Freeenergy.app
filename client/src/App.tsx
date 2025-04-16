import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import StoreDetailPage from "@/pages/store-detail-page";
import CartPage from "@/pages/cart-page";
import TrackingPage from "@/pages/tracking-page";
import RoleSelectionPage from "@/pages/role-selection-page";
import MerchantDashboardPage from "@/pages/merchant/dashboard-page";
import { ProtectedRoute } from "@/lib/protected-route";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

function Router() {
  const { user } = useAuth();
  
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/role-selection" component={RoleSelectionPage} />

      {/* Consumer routes */}
      <ProtectedRoute 
        path="/" 
        component={HomePage} 
        requiredRole="CONSUMER" 
      />
      <ProtectedRoute 
        path="/store/:storeId" 
        component={StoreDetailPage} 
        requiredRole="CONSUMER" 
      />
      <ProtectedRoute 
        path="/cart" 
        component={CartPage} 
        requiredRole="CONSUMER" 
      />
      <ProtectedRoute 
        path="/order/:orderId" 
        component={TrackingPage} 
        requiredRole="CONSUMER" 
      />

      {/* Merchant routes */}
      <ProtectedRoute 
        path="/merchant/dashboard" 
        component={MerchantDashboardPage} 
        requiredRole="MERCHANT" 
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { user, isLoading } = useAuth();
  
  console.log("App: User state -", user ? `Logged in as ${user.username} (${user.role})` : "Not logged in", "Loading:", isLoading);
  
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
