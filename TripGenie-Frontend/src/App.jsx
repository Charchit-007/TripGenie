import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login_Page from './Pages/Login_Page.jsx';
import Landing_Page from './Pages/Landing_Page.jsx';
import AdminPanel from './Admin/AdminPanel.jsx';
import Chat_UI from './Pages/Chat_UI.jsx';
import ProtectedRoute from './ProtectedRoutes.jsx'; // Import the gatekeeper


//import Landing from './LandingPage.jsx';
//import Chat from './Chat_UI.jsx';
//import New from './NewLanding.jsx';
//import NewChat from './New_Chat_UI_Claude.jsx';
//import NewPage from './NewLanding.jsx';


function App() {
  return(
    <Router>
      <AdminPanel />
    </Router>
  );
}

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Public Route: Anyone can see this */}
//         <Route path="/" element={<Login />} />
        
//         {/* Protected Route: Only logged-in users can see this */}
//         <Route 
//           path="/home" 
//           element={
//             <ProtectedRoute>
//               <Landing />
//             </ProtectedRoute>
//           } 
//         />
//         <Route 
//           path="/chat" 
//           element={
//             <ProtectedRoute>
//               <Chat_Ui />
//             </ProtectedRoute>
//           } 
//         />
//       </Routes>
//     </Router>
//   );
// }

export default App;