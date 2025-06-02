import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const templeteUserInteractionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  Interaction_ID: { type: Number, required: true, unique: true },
  Interaction_Description: { type: String, required: true },
  created_dtm: { type: Date, default: Date.now },
  end_dtm: { type: Date, default: null },
  ToDoID: { type: String, required: true },
  Task_Id: { type: Number, default: null },
  Requeted_Group: { type: String, required: true },
  Interation_Mode: { type: String, required: true },
  Special_Display_Interaction: { type: String, default: null },
  para1: { type: String, default: null },
  para2: { type: String, default: null },
  para3: { type: String, default: null },
  para4: { type: String, default: null },
  para5: { type: String, default: null },
}, {
  collection: 'Templete_User_Interaction',
});

const TempleteUserInteraction = model('TempleteUserInteraction', templeteUserInteractionSchema);

export default TempleteUserInteraction;