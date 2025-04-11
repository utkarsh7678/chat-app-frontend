import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Welcome to Chat App</h1>
      <p>Please <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to continue.</p>
    </div>
  );
}

export default Home;

  