import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { LinksProvider } from "./contexts/LinksContext";
import { UsersProvider } from "./contexts/UserProfileContext";
import AppLayout from "./ui/AppLayout";
import Loader from "./ui/Loader";
import ProtectedRoute from "./ui/ProtectedRoute";

const Signup = lazy(() => import("./authentication/Signup"));
const Login = lazy(() => import("./authentication/Login"));
const ForgotPassword = lazy(() => import("./authentication/ForgotPassword"));
const ResetPassword = lazy(() => import("./authentication/ResetPassword"));
const VerifyEmailSection = lazy(
  () => import("./authentication/VerifyEmailSection"),
);
const ProfileLinksSection = lazy(
  () => import("./features/links/ProfileLinksSection"),
);
const ProfileDetailsSection = lazy(
  () => import("./features/profile/ProfileDetailsSection"),
);
const PreviewPage = lazy(() => import("./ui/PreviewPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <UsersProvider>
        <LinksProvider>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route
                path="/"
                index
                element={<Navigate replace to="add-links" />}
              />
              <Route path="signup" element={<Signup />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="verify-email" element={<VerifyEmailSection />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="add-links" element={<ProfileLinksSection />} />
                <Route path="profile" element={<ProfileDetailsSection />} />
              </Route>
              <Route path="preview/:id" element={<PreviewPage />} />
              <Route path="*" element={<Navigate replace to="signup" />} />
            </Routes>
          </Suspense>

          <Toaster
            position="top-center"
            gutter={12}
            containerStyle={{ margin: "8px" }}
            toastOptions={{
              success: { duration: 3000 },
              error: { duration: 5000 },
              style: {
                fontSize: "16px",
                maxWidth: "500px",
                padding: "16px 24px",
                backgroundColor: "#fff",
                color: "#0c0e16",
              },
            }}
          />
        </LinksProvider>
      </UsersProvider>
    </QueryClientProvider>
  );
}
