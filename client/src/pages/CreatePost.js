import { useState } from "react";
import { Navigate } from "react-router-dom";
import Editor from "../Editor";
import "react-quill/dist/quill.snow.css"; //importing the css for the quill template

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState("");
  const [redirect, setRedirect] = useState(false);

  async function createNewPost(ev) {
    const data = new FormData(); //this to grab the data of the form in form type only rather than saving it in the json type
    data.set("title", title);
    data.set("summary", summary);
    data.set("content", content);
    data.set("file", files[0]); //despite of selecting multiple files it will only select the first one
    ev.preventDefault();

    const response = await fetch("http://localhost:4000/post", {
      method: "POST",
      body: data, //instead dof sending json it will send the whole data of the form
      credentials: "include",
    });
    if (response.ok) {
      //if the response is ok then we want to redirect it to the home page
      setRedirect(true);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <form onSubmit={createNewPost}>
      <input
        type="title"
        placeholder={"Title"}
        value={title}
        onChange={(ev) => setTitle(ev.target.value)}
      ></input>

      <input
        type="summary"
        placeholder={"Summary"}
        value={summary}
        onChange={(ev) => setSummary(ev.target.value)}
      ></input>
      <input type="file" onChange={(ev) => setFiles(ev.target.files)}></input>

      <Editor value={content} onChange={setContent} />
      <button style={{ marginTop: "5px" }}>Create Post</button>
    </form> // we would use react quill which is a editor which can do same functionalities as we do changes in word
  );
}
