import mongoose from "mongoose";

const hackathonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  organizer: { type: String, required: true },
  registrationDeadline: { type: Date, required: true },
  eventDate: { type: Date, required: true },
  registrationLink: { type: String, required: true },
  skills: { type: String },
  eligibility: { type: String },
  prize: { type: String },
  participantCount: { type: Number, default: 0 },
  createdBy: { type: String, required: true }, // HOD userId
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Hackathon = mongoose.models.Hackathon || mongoose.model("Hackathon", hackathonSchema);
export default Hackathon;
