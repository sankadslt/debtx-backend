import mongoose from "mongoose";

const TemplateMediationBoardSchema = new mongoose.Schema(
  {
    mediation_id: 
    { 
        type: Number, 
        required: true, 
        unique: true 
    },
    mediation_description: 
    { 
        type: String, 
        required: true 
    },
    mediation_type: {
      type: String,
      enum: ["Field", "Fail"], // Allowed values: Field, Fail
      required: true,
    },
    commission: { 
        type: Number, 
        required: true, 
        min: 0
     }, // Commission percentage or amount
    abbreviation: { 
        type: String, 
        required: true 
    }, // Short form or abbreviation
    end_dtm: { 
        type: Date, 
        required: true 
    }, // End date/time
    todo_id: {
        type: Number,
        required: true,
        unique: true
    },
    task_id: {
        type: Number,
        required: true,
        unique: true
    },
  },
  {
    collection: 'Template_Mediation_Board',
  }
);

const TemplateMediationBoard = model("Template_Mediation_Board", TemplateMediationBoardSchema);

export default TemplateMediationBoard;
