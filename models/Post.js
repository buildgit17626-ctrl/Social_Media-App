const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: ""
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    image: {
      type: String,
      default: null
    },

    imagePublicId: {
      type: String,
      default: null
    },
likes: {
  type: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  default: []
}
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Post", postSchema);