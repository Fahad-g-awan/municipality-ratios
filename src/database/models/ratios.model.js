import mongoose from "mongoose";

const ratiosSchema = mongoose.Schema(
  {
    ratioId: Number,
    state: String,
    city: String,
    dateOfAuditReport: String,
    yearOfAuditReport: String,
    name: String,
    descrition: String,
    ratio: Number,
    category: String,
    logoUrl: String,
  },
  { timestamps: true }
);

export default mongoose.model("Ratio", ratiosSchema);
