import User_Interaction_Log from "../models/User_Interaction_Log.js";
import User_Interaction_Progress_Log from "../models/User_Interaction_Progress_Log.js";
import db from "../config/db.js"; 


export const createUserInteractionFunction = async ({ Interaction_ID, User_Interaction_Type, CreateDTM, delegate_user_id, Created_By, User_Transaction_Status, Transaction_Status_DTM, ...dynamicParams }) => {
    //Create_DTM parameter or db default??
    //User_Transaction_Status pparameter or default hardcode to Open

    try{
        if (!Interaction_ID || !User_Interaction_Type || !CreateDTM || !delegate_user_id || !Created_By || !User_Transaction_Status || !Transaction_Status_DTM) {
            throw new Error("Missing fields");
        }

    }catch(error){

    }
}