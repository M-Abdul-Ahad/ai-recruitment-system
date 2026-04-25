import ResumeDashboard from "./pages/ResumeDashboard"
export default function App() {
  return (
    <ResumeDashboard/>
  )
}

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Signup from "./pages/Signup";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import ProtectedRoute from "./auth/ProtectedRoute";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/signup" element={<Signup />} />
//         <Route path="/login" element={<Login />} />

//         {/* generic entry point; ProtectedRoute will redirect based on role */}
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />

//         {/* explicit role dashboards (reuse same component for now) */}
//         <Route
//           path="/applicant-dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/recruiter-dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/admin-dashboard"
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;