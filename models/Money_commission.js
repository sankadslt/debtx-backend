/*
  Purpose: This template is used for the DRC Controllers.
  Created Date: 2024-11-21
  Created By: Lasandi Randini (randini-im20057@stu.kln.ac.lk)
  Last Modified Date: 2024-11-24
  Modified By: Lasandi Randini (randini-im20057@stu.kln.ac.lk)            
  Version: Node.js v20.11.1
  Dependencies: mysql2
  Related Files: DRC_route.js
  Notes:  
*/

import { Schema, model } from "mongoose";

const moneyCommissionSchema = new Schema({
  doc_version: { type: Number, required: true, default: 1 },
  commission_id: { type: Number, required: true },
  created_dtm: { type: Date, default: Date.now },
  money_transaction_id: { type: Number },
  case_id: { type: Number, required: true },
  account_num: { type: String, maxlength: 30, required: true },
  billing_centre: { type: String, maxlength: 50 },
  commission_type: { type: String, enum: ["arrears", "Commissioned", "Unresolved Commission", "Pending Commission"], required: true },
  catalog_id: { type: Number },
  payment_thresold: { type: String, enum: ["Eligible", "Not Eligible"] },
  commissioning_amount: { type: Number, required: true },
  
  drc: {
    drc_id: { type: Number },
    ro_id: { type: Number, default: null },
    drc_expire_dtm: { type: Date },
    drc_commission_rule: { type: String, maxlength: 50 },
    additional_infor: {
      eligible_field_reason_ids: [{ type: Number }]
    }
  },

  Status_Details: [{
    commi_status: { type: String, enum: ["Open", "Closed", "Pending", "Rejected"] },
    commi_dtm: { type: Date, default: Date.now },
    commi_status_by: { type: String, maxlength: 50 },
    commi_remark: { type: String }
  }],

  Bonus_Details: {
    success_rate_consider: { type: String, enum: ["YES", "NO"], default: "NO" },
    completion_rate_consider: { type: String, enum: ["YES", "NO"], default: "NO" }
  },

  release_batch_id: { type: Schema.Types.Mixed, default: null }  // could be null or an ObjectId/Number

}, {
  collection: 'Money_commission'
});

const MoneyCommission = model("MoneyCommission", moneyCommissionSchema);

export default MoneyCommission;
