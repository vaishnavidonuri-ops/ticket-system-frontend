import { useState } from "react";
import users from "../data/users.json";

 export const CURRENT_USER_ID = "EMP004";

const Header = () => {
  const [showProfile, setShowProfile] = useState(false);

  const user = users.find(u => u.id === CURRENT_USER_ID);

  return (
    <div className="header">

      <h2>System Dashboard</h2>

      {/* Profile Section */}
      <div className="profile">
        
        <div onClick={() => setShowProfile(!showProfile)} className="profile-box">
          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt="profile"
            className="profile-img"
          />
          <span>{user?.name}</span>
        </div>

        {/* Dropdown */}
        {showProfile && (
          <div className="profile-dropdown">
            <p><b>Name:</b> {user?.name}</p>
            <p><b>Department:</b> {user?.department}</p>
            <p><b>Designation:</b> {user?.designation}</p>
            <p><b>Email:</b> {user?.email}</p>
          </div>
        )}

      </div>
    </div>
    
  );
};

export default Header;