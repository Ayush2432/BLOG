import Post from "../Post";
import { useEffect, useState } from "react";

export default function IndexPage() {
  const [posts, setPosts] = useState([]); //setting the state so we can show all posts on the display
  useEffect(() => {
    fetch("http://localhost:4000/post").then((response) => {
      response.json().then((posts) => {
        setPosts(posts);
      });
    });
  }, []);
  return <>{posts.length > 0 && posts.map((post) => <Post {...post} />)}</>;
}
