import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";

function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  // GET CURRENT USER
  const getCurrentUser = async () => {
    try {
      const response = await api.get("/users/me");

      setCurrentUser(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  // GET PROFILE
  const getProfile = async () => {
    try {
      const response = await api.get(`/users/${id}/profile`);

      setProfile(response.data.user);
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        "Unable to fetch profile"
      );
    }
  };

  useEffect(() => {
    getCurrentUser();
    getProfile();
  }, [id]);

  // FOLLOW USER
  const handleFollow = async () => {
    try {
      await api.post(`/users/${id}/follow`);

      setMessage("");
      getProfile();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        "Unable to follow user"
      );
    }
  };

  // UNFOLLOW USER
  const handleUnfollow = async () => {
    try {
      await api.delete(`/users/${id}/unfollow`);

      setMessage("");
      getProfile();
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
        "Unable to unfollow user"
      );
    }
  };

  if (!profile) {
    return (
      <div>
        <p>{message || "Loading profile..."}</p>

        <button onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  const isOwnProfile =
    currentUser &&
    currentUser._id === profile._id;

  return (
    <div>
      <h1>Profile</h1>

      <button onClick={() => navigate("/")}>
        Back to Home
      </button>

      <hr />

      <h2>{profile.username}</h2>

      <p>Email: {profile.email}</p>

      <p>
        Followers: {profile.followersCount}
      </p>

      <p>
        Following: {profile.followingCount}
      </p>

      {!isOwnProfile && (
        <div>
          {profile.isFollowing ? (
            <button onClick={handleUnfollow}>
              Unfollow
            </button>
          ) : (
            <button onClick={handleFollow}>
              Follow
            </button>
          )}
        </div>
      )}

      <p>{message}</p>
    </div>
  );
}

export default Profile;