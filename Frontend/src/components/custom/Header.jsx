import React, { useEffect } from "react";
import logo from "/logo1.png";
import { Button } from "../ui/button";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutUser } from "@/Services/login";
import { addUserData } from "@/features/user/userFeatures";

function Header({user}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";


  useEffect(() => {
    if(user){
      console.log("Printing From Header User Found");
    }
    else{
      console.log("Printing From Header User Not Found");
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      if (response.statusCode == 200) {
        dispatch(addUserData(""));
        navigate("/");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div
      id="printHeader"
      className="flex justify-between px-10 py-5 shadow-md items-center"
    >
      <img src={logo} alt="logo" width={300} height={300} />
      {user ? (
        <div className="flex items-center gap-4">
            {isDashboard ? (
            <Button
              variant="outline"
              onClick={() => navigate("/")}
            >
              Home
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
          )}
          <Button onClick={handleLogout}>Logout</Button>
        </div>
      ) : (
        <Link to="/auth/sign-in">
          <Button>Sign In / Sign Up</Button>
        </Link>        
      )}
    </div>
  );
}

export default Header;
