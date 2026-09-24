
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Home() {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");

  // GET CURRENT USER
  const getCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");

      setUser(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  // LOGOUT USER
  const handleLogout = async () => {
    try {
      await api.post("/users/logout");

      navigate("/login");
    } catch (error) {
      console.log(error);

      setMessage("Unable to logout");
    }
  };

  // GET ALL POSTS
  const getPosts = async () => {
    try {
      const response = await api.get("/posts");

      setPosts(response.data);
    } catch (error) {
      console.log(error);

      setMessage("Unable to fetch posts");
    }
  };

  useEffect(() => {
    getCurrentUser();
    getPosts();
  }, []);

  // CREATE POST
  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      setMessage("Post must contain text or an image");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("content", content);

      if (image) {
        formData.append("image", image);
      }

      await api.post("/posts", formData);

      setContent("");
      setImage(null);
      setMessage("");

      getPosts();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to create post"
      );
    }
  };

  // START EDITING
  const startEditing = (post) => {
    setEditingPostId(post._id);
    setEditingContent(post.content);
    setMessage("");
  };

  // CANCEL EDITING
  const cancelEditing = () => {
    setEditingPostId(null);
    setEditingContent("");
  };

  // UPDATE POST
  const handleUpdatePost = async (postId) => {
    if (!editingContent.trim()) {
      setMessage("Post content cannot be empty");
      return;
    }

    try {
      await api.put(`/posts/${postId}`, {
        content: editingContent
      });

      setEditingPostId(null);
      setEditingContent("");
      setMessage("");

      getPosts();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to update post"
      );
    }
  };

  // DELETE POST
  const handleDeletePost = async (postId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/posts/${postId}`);

      setMessage("");

      getPosts();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to delete post"
      );
    }
  };

  return (
    <div>
      <h1>Social Media App</h1>

      {user && (
        <h2>
          Welcome, {user?.username}
        </h2>
      )}

      <button onClick={handleLogout}>
        Logout
      </button>

      <h2>Create Post</h2>

      <form onSubmit={handleCreatePost}>
        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <br />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <br />

        {image && (
          <p>
            Selected image: {image.name}
          </p>
        )}

        <button type="submit">
          Create Post
        </button>
      </form>

      <p>{message}</p>

      <hr />

      <h2>All Posts</h2>

      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map((post) => {
          const isOwner =
            user &&
            post.author &&
            user._id === post.author._id;

          return (
            <div key={post._id}>
              <h3>
                {post.author?.username || "Unknown User"}
              </h3>

              {editingPostId === post._id ? (
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) =>
                      setEditingContent(e.target.value)
                    }
                  />

                  <br />

                  <button
                    onClick={() =>
                      handleUpdatePost(post._id)
                    }
                  >
                    Save
                  </button>

                  <button onClick={cancelEditing}>
                    Cancel
                  </button>
                </div>
              ) : (
                <p>{post.content}</p>
              )}

              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  style={{
                    width: "100%",
                    maxWidth: "500px",
                    borderRadius: "10px"
                  }}
                />
              )}

              <br />

              <small>
                {new Date(post.createdAt).toLocaleString()}
              </small>

              {isOwner && editingPostId !== post._id && (
                <div>
                  <button
                    onClick={() => startEditing(post)}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleDeletePost(post._id)
                    }
                  >
                    Delete
                  </button>
                </div>
              )}

              <hr />
            </div>
          );
        })
      )}
    </div>
  );
}

export default Home;