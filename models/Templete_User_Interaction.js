import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const templeteUserInteractionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  Interaction_ID: { type: Number, required: true, unique: true },
  Interaction_Description: { type: String, maxlength: 255, required: true },
  created_dtm: { type: Date, default: Date.now },
  end_dtm: { type: Date, default: null },
  ToDoID: { type: Number, required: true },
  Task_Id: { type: Number, default: null },
  Requeted_Group: { type: String, maxlength: 30, required: true },
  Interation_Mode: { type: String, maxlength: 30, required: true },
  Special_Display_Interaction: { type: String, maxlength: 30, default: null },
  para1: { type: String, maxlength: 30, default: null },
  para2: { type: String, maxlength: 30, default: null },
  para3: { type: String, maxlength: 30, default: null },
  para4: { type: String, maxlength: 30, default: null },
  para5: { type: String, maxlength: 30,  default: null },
}, {
  collection: 'Template_User_Interaction',
});

const TempleteUserInteraction = model('TempleteUserInteraction', templeteUserInteractionSchema);

export default TempleteUserInteraction;