import { Schema, model, Document } from 'mongoose';

// Interface for User document
export interface IUser extends Document {
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// User schema
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please enter a valid email'],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    versionKey: false, // Disable __v field
  }
);

// Add indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });

// Create and export the model
export const User = model<IUser>('User', userSchema);

// Export the schema for potential reuse
export { userSchema };