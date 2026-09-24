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

  const [comments, setComments] = useState({});
const [commentInputs, setCommentInputs] = useState({});
const [visibleComments, setVisibleComments] = useState({});

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

  // LIKE OR UNLIKE POST
  const handleLike = async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}/like`);

      const updatedLikeData = response.data;

      setPosts((previousPosts) =>
        previousPosts.map((post) => {
          if (post._id === postId) {
            return {
              ...post,
              likesCount: updatedLikeData.likesCount,
              liked: updatedLikeData.liked
            };
          }

          return post;
        })
      );
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        "Unable to like post"
      );
    }
  };

useEffect(() => {
  if (posts.length === 0) {
    return;
  }

  const loadAllComments = async () => {
    for (let i = 0; i < posts.length; i++) {
      await getComments(posts[i]._id);
    }

    const updatedVisibility = {};

    for (let i = 0; i < posts.length; i++) {
      updatedVisibility[posts[i]._id] = true;
    }

    setVisibleComments(updatedVisibility);
  };

  loadAllComments();
}, [posts.length]);

 const getComments = async (postId) => {
  try {
    const response = await api.get(
      `/comments/post/${postId}`
    );

    setComments((previousComments) => ({
      ...previousComments,
      [postId]: response.data
    }));
  } catch (error) {
    console.log(
      "GET COMMENTS ERROR:",
      error.response?.data
    );
  }
};

const toggleComments = async (postId) => {
  const isVisible = visibleComments[postId];

  if (!isVisible && !comments[postId]) {
    await getComments(postId);
  }

  setVisibleComments((previousVisibleComments) => ({
    ...previousVisibleComments,
    [postId]: !isVisible
  }));
};

const handleAddComment = async (postId) => {
  const content = commentInputs[postId] || "";

  if (content.trim() === "") {
    setMessage("Comment cannot be empty");
    return;
  }

  try {
    const response = await api.post(
      `/comments/post/${postId}`,
      {
        content: content
      }
    );

    const newComment = response.data.comment;

    setComments((previousComments) => ({
      ...previousComments,
      [postId]: [
        newComment,
        ...(previousComments[postId] || [])
      ]
    }));

    setCommentInputs((previousInputs) => ({
      ...previousInputs,
      [postId]: ""
    }));

    setMessage("");
  } catch (error) {
    console.log(
      "ADD COMMENT ERROR:",
      error.response?.data
    );

    setMessage(
      error.response?.data?.message ||
      "Unable to add comment"
    );
  }
};

const handleCommentInput = (postId, value) => {
  setCommentInputs((previousInputs) => ({
    ...previousInputs,
    [postId]: value
  }));
};

const handleDeleteComment = async (postId, commentId) => {
  try {
    await api.delete(`/comments/${commentId}`);

    setComments((previousComments) => ({
      ...previousComments,
      [postId]: previousComments[postId].filter(
        (comment) => comment._id !== commentId
      )
    }));

    setMessage("");
  } catch (error) {
    console.log(
      "DELETE COMMENT ERROR:",
      error.response?.data
    );

    setMessage(
      error.response?.data?.message ||
      "Unable to delete comment"
    );
  }
};

  return (
    <div>
      <h1>Social Media App</h1>

      {user && (
        <h2>
          Welcome, {user.username}
        </h2>
      )}

      {/* NAVIGATION BUTTONS */}

      <button
        onClick={() => navigate("/")}
      >
        Home
      </button>

      {user && (
        <button
          onClick={() =>
            navigate(`/profile/${user._id}`)
          }
        >
          My Profile
        </button>
      )}

      <button onClick={handleLogout}>
        Logout
      </button>

      <hr />

      {/* CREATE POST */}

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

      {/* ALL POSTS */}

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

              {/* POST DATE */}

              <small>
                {new Date(
                  post.createdAt
                ).toLocaleString()}
              </small>

              <br />

              {/* LIKE BUTTON */}

              <button
                onClick={() => handleLike(post._id)}
              >
                {post.liked ? "Unlike" : "Like"}
              </button>

              <span>
                {" "}
                {post.likesCount ?? post.likes?.length ?? 0} likes
              </span>

              <br />

              <div>
  <button onClick={() => toggleComments(post._id)}>
    {visibleComments[post._id]
      ? "Hide Comments"
      : "Comments"}
  </button>

  {visibleComments[post._id] && (
    <div>
      <h4>Comments</h4>

      <div>
        <input
          type="text"
          placeholder="Write a comment..."
          value={commentInputs[post._id] || ""}
          onChange={(event) =>
            handleCommentInput(
              post._id,
              event.target.value
            )
          }
        />

        <button
          onClick={() => handleAddComment(post._id)}
        >
          Add Comment
        </button>
      </div>

      <div>
        {(comments[post._id] || []).length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments[post._id].map((comment) => (
            <div key={comment._id}>
              <p>
                <strong>
                  {comment.author?.username}
                </strong>
              </p>

              <p>{comment.content}</p>

              {user &&
                comment.author?._id === user._id && (
                  <button
                    onClick={() =>
                      handleDeleteComment(
                        post._id,
                        comment._id
                      )
                    }
                  >
                    Delete
                  </button>
                )}
            </div>
          ))
        )}
      </div>
    </div>
  )}
</div>

              {/* POST AUTHOR */}
              <h3>
                {post.author?.username || "Unknown User"}
              </h3>

              {post.author && (
                <button
                  onClick={() =>
                    navigate(
                      `/profile/${post.author._id}`
                    )
                  }
                >
                  View Profile
                </button>
              )}

              {/* EDIT OR DISPLAY POST CONTENT */}

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

              {/* POST IMAGE */}

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

              {/* POST DATE */}

              <small>
                {new Date(
                  post.createdAt
                ).toLocaleString()}
              </small>

              <br />

              {/* EDIT AND DELETE BUTTONS */}

              {isOwner &&
                editingPostId !== post._id && (
                  <div>
                    <button
                      onClick={() =>
                        startEditing(post)
                      }
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