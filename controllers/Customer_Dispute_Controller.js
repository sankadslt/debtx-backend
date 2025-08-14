import Dispute_Letter_Creation from "../models/Dispute_Letter_Creation.js";    


export const createLetter = async (req, res) => {
  try {
    const {
      case_id, customer_ref, account_no, arrears_amount, last_payment_date,
      signature_owner, template, dispute_mode = "Dispute", handover_channel = "CRC",
      email, email_cc, remark,created_by
    } = req.body;

    if (!case_id || !customer_ref || !account_no || !arrears_amount || 
        !last_payment_date || !signature_owner || !template || !email) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const existingLetter = await Dispute_Letter_Creation.findOne({ case_id});
    if (existingLetter) return res.status(409).json({ success: false, message: 'Letter already exists for this case' });

 

    const newLetter = new Dispute_Letter_Creation({
      
      case_id,
      customer_ref,
      account_no,
      arrears_amount: parseFloat(arrears_amount),
      last_payment_date: new Date(last_payment_date),
      signature_owner,
      template,
      dispute_mode,
      handover_channel,
      email,
      email_cc,
      remark,
      created_by
    });

    await newLetter.save();

 
    res.status(201).json({ success: true, message: 'Letter created', data: newLetter });
  } catch (error) {
    console.log('Error creating Letter of Demand', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};