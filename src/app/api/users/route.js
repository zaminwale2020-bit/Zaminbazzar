import { connectDB } from "@/lib/mongodb";
import User from "@/models/User"; // Example Mongoose model

export async function GET() {
  await connectDB();
  const users = await User.find();
  return Response.json(users);
}
