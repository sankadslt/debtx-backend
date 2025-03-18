import mongoose, { model } from 'mongoose';
const { Schema } = mongoose;

const templeteUserInteractionSchema = new Schema({
  doc_version : {type:Number, required: true, default: 1},
  user_interaction_id: { type: Number, required: true, unique: true },
  user_interaction_type: { type: String, required: true },
  parameters: [{type: String}],
}, {
  collection: 'Templete_User_Interaction',
});

const TempleteUserInteraction = model('TempleteUserInteraction', templeteUserInteractionSchema);

export default TempleteUserInteraction;