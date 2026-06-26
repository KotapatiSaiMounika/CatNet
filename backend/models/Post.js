import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['Lost', 'Found', 'Adoption'],
        message: 'Category must be Lost, Found, or Adoption',
      },
      required: [true, 'Category is required'],
    },
    catImage: {
      type: String,
      default: '',
    },
    location: {
      address: { type: String, default: '' },
      lat:     { type: Number, default: null },
      lng:     { type: Number, default: null },
    },
    contactInfo: {
      type: String,
      trim: true,
      maxlength: [200, 'Contact info cannot exceed 200 characters'],
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

// Text index for search
postSchema.index({ title: 'text', description: 'text' });

// Regular indexes for filtering
postSchema.index({ category: 1 });
postSchema.index({ 'location.address': 1 });
postSchema.index({ createdBy: 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;