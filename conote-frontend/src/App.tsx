import React from "react";
import "./App.css";
import Editor from "./components/editor/Editor";
import Home from "./components/Home";
import Login from "./components/user/Login";
import Signup from "./components/user/Signup";
import Dashboard from "./components/user/Dashboard";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { useProvideAuth } from "hooks/useAuth";
import ErrorPage from "components/ErrorPage";

function App() {
  const authentication = useProvideAuth();

  const RedirectRoute = ({
    isAllowed,
    redirectPath,
    children,
  }: {
    isAllowed: any;
    redirectPath: string;
    children: any;
  }) => {
    if (!isAllowed) {
      return <Navigate to={redirectPath} replace />;
    } else {
      return children ? children : <Outlet />;
    }
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route
            element={
              <RedirectRoute
                isAllowed={!authentication.user}
                redirectPath="dashboard"
                children={undefined}
              />
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>
          <Route path="editor" element={<Editor />} />
          <Route
            path="dashboard"
            element={
              <RedirectRoute isAllowed={!!authentication.user} redirectPath="/">
                <Dashboard />
              </RedirectRoute>
            }
          />
          <Route path="docs/edit/:docID" element={<Editor />} />
          <Route path="error/:errorID" element={<ErrorPage />} />
          <Route
            path="*"
            element={
              <RedirectRoute
                isAllowed={false}
                redirectPath="/error/404"
                children={undefined}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
