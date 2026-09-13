import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { HomePage } from "./pages/HomePage";
import { TeacherDashboardPage } from "./pages/TeacherDashboardPage";
import { SubmitDataPage } from "./pages/SubmitDataPage";
import { MyDataPage } from "./pages/MyDataPage";
import { AllExperimentsDataPage } from "./pages/AllExperimentsDataPage";

function App() {
  const { firebaseUser, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="page page-centered">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={firebaseUser ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={
          !firebaseUser ? (
            <Navigate to="/login" replace />
          ) : profile ? (
            <Navigate to="/" replace />
          ) : (
            <RegisterPage />
          )
        }
      />
      <Route
        path="/"
        element={
          !firebaseUser ? (
            <Navigate to="/login" replace />
          ) : !profile ? (
            <Navigate to="/register" replace />
          ) : (
            <HomePage />
          )
        }
      />
      <Route
        path="/teacher"
        element={
          !firebaseUser ? (
            <Navigate to="/login" replace />
          ) : !profile ? (
            <Navigate to="/register" replace />
          ) : profile.role !== "teacher" ? (
            <Navigate to="/" replace />
          ) : (
            <TeacherDashboardPage />
          )
        }
      />
      <Route
        path="/submit"
        element={
          !firebaseUser ? (
            <Navigate to="/login" replace />
          ) : !profile ? (
            <Navigate to="/register" replace />
          ) : profile.role !== "student" ? (
            <Navigate to="/" replace />
          ) : (
            <SubmitDataPage />
          )
        }
      />
      <Route
        path="/my-data"
        element={
          !firebaseUser ? (
            <Navigate to="/login" replace />
          ) : !profile ? (
            <Navigate to="/register" replace />
          ) : profile.role !== "student" ? (
            <Navigate to="/" replace />
          ) : (
            <MyDataPage />
          )
        }
      />
      <Route
        path="/experiments"
        element={
          !firebaseUser ? (
            <Navigate to="/login" replace />
          ) : !profile ? (
            <Navigate to="/register" replace />
          ) : profile.role !== "student" ? (
            <Navigate to="/" replace />
          ) : (
            <AllExperimentsDataPage />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
