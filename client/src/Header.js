import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch("https://mern-smvq.onrender.com/profile", {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch("https://mern-smvq.onrender.com/logout", {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  }

  const name = userInfo?.name;

  return (
    <header>
      <Link to={"/"} className="logo">
        My Blog
      </Link>
      <nav>
        {name && (
          <>
            <Link to="/create">Create new post</Link>
            <a onClick={logout}>Logout</a>
          </>
        )}
        {!name && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
