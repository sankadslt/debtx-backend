import Case_details from "../models/Case_details.js";

// export const getAllWriteOffCases = async (req, res) => {
//     try {
//         const { status, fromDate, toDate, page = 1 } = req.body;
        
//         // Validate page number
//         let currentPage = Number(page);
//         if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

//         // Set pagination parameters
//         const limit = currentPage === 1 ? 10 : 30;
//         const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;
        
//         // Build the query
//         let query = {};
        
//         // Add status filter if provided
//         if (status) {
//             query.case_current_status = status;
//         }
        
//         // Add date range filter if both dates are provided
//         if (fromDate && toDate) {
//             const fromDateObj = new Date(fromDate);
//             const toDateObj = new Date(toDate);
            
//             // Set toDate to end of day
//             toDateObj.setHours(23, 59, 59, 999);
            
//             query['case_status'] = {
//                 $elemMatch: {
//                     created_dtm: {
//                         $gte: fromDateObj,
//                         $lte: toDateObj
//                     }
//                 }
//             };
//         }
        
//         // Fetch total count for pagination
//         const totalCount = await Case_details.countDocuments(query);
        
//         // Calculate total pages
//         const totalPages = currentPage === 1 
//             ? Math.ceil((totalCount - 10) / 30) + 1 
//             : Math.ceil((totalCount - 10) / 30) + 1;
        
//         // Fetch the cases
//         const cases = await Case_details.find(query)
//             .skip(skip)
//             .limit(limit)
//             .sort({ case_id: -1 });
            
//         // Transform the data to match the frontend requirements
//         const formattedCases = cases.map(caseItem => {
//             // Find the latest case status entry for write-off date
//             const writeOffStatus = caseItem.case_status
//                 .sort((a, b) => new Date(b.created_dtm) - new Date(a.created_dtm))
//                 .find(status => status.case_status === "Write off" || status.case_status === "Pending write off");
                
//             return {
//                 caseId: caseItem.case_id,
//                 status: caseItem.case_current_status,
//                 accountNo: caseItem.account_no,
//                 customerRef: caseItem.customer_ref,
//                 amount: caseItem.current_arrears_amount,
//                 phase: caseItem.action_type, // Assuming action_type corresponds to phase
//                 writeOffOn: writeOffStatus ? writeOffStatus.created_dtm : null
//             };
//         });
        
//         res.status(200).json({
//             status: "success",
//             message: "Write-off cases retrieved successfully.",
//             data: {
//                 currentPage,
//                 totalPages,
//                 limit,
//                 count: formattedCases.length,
//                 total: totalCount,
//                 results: formattedCases,
//             }
//         });
//     } catch (error) {
//         console.error("Error retrieving write-off cases:", error);
//         res.status(500).json({
//             status: "error",
//             message: error.message || "An error occurred while retrieving write-off cases."
//         });
//     }
// };




// export const getAllWriteOffCases = async (req, res) => {
//     try {
//         const { status, fromDate, toDate, page = 1 } = req.body;
        
//         // Validate page number
//         let currentPage = Number(page);
//         if (isNaN(currentPage) || currentPage < 1) currentPage = 1;

//         // Set pagination parameters
//         const limit = currentPage === 1 ? 10 : 30;
//         const skip = currentPage === 1 ? 0 : 10 + (currentPage - 2) * 30;
        
//         // Build the query
//         let query = {};
        
//         // Add status filter if provided
//         if (status) {
//             query.case_current_status = status;
//         }
        
//         // Add date range filter if both dates are provided
//         if (fromDate && toDate) {
//             const fromDateObj = new Date(fromDate);
//             const toDateObj = new Date(toDate);
            
//             // Set toDate to end of day
//             toDateObj.setHours(23, 59, 59, 999);
            
//             query['case_status'] = {
//                 $elemMatch: {
//                     created_dtm: {
//                         $gte: fromDateObj,
//                         $lte: toDateObj
//                     }
//                 }
//             };
//         }
        
//         // Ensure at least one filter is applied
//         if (!status && !fromDate && !toDate) {
//             return res.status(400).json({
//                 status: "error",
//                 message: "At least one filter (status, fromDate, or toDate) is required."
//             });
//         }
        
//         // Fetch total count for pagination
//         const totalCount = await Case_details.countDocuments(query);
        
//         // Calculate total pages
//         const totalPages = currentPage === 1 
//             ? Math.ceil((totalCount - 10) / 30) + 1 
//             : Math.ceil((totalCount - 10) / 30) + 1;
        
//         // Fetch the cases
//         const cases = await Case_details.find(query)
//             .skip(skip)
//             .limit(limit)
//             .sort({ case_id: -1 });
            
//         // Transform the data to match the frontend requirements
//         const formattedCases = cases.map(caseItem => {
//             // Find the latest case status entry for write-off date
//             const writeOffStatus = caseItem.case_status
//                 .sort((a, b) => new Date(b.created_dtm) - new Date(a.created_dtm))
//                 .find(status => status.case_status === "Write off" || status.case_status === "Pending write off");
                
//             return {
//                 caseId: caseItem.case_id,
//                 status: caseItem.case_current_status,
//                 accountNo: caseItem.account_no,
//                 customerRef: caseItem.customer_ref,
//                 amount: caseItem.current_arrears_amount,
//                 phase: caseItem.action_type, // Assuming action_type corresponds to phase
//                 writeOffOn: writeOffStatus ? writeOffStatus.created_dtm : null
//             };
//         });
        
//         res.status(200).json({
//             status: "success",
//             message: "Write-off cases retrieved successfully.",
//             data: {
//                 currentPage,
//                 totalPages,
//                 limit,
//                 count: formattedCases.length,
//                 total: totalCount,
//                 results: formattedCases,
//             }
//         });
//     } catch (error) {
//         console.error("Error retrieving write-off cases:", error);
//         res.status(500).json({
//             status: "error",
//             message: error.message || "An error occurred while retrieving write-off cases."
//         });
//     }
// };




// export const getAllWriteOffCases = async (req, res) => {
//     try {
//         const { status, fromDate, toDate, pages } = req.body;
        
//         // Build the query object based on provided filters
//         let query = {};
        
//         // Add status filter if provided
//         if (status) {
//             query.case_current_status = status;
//         }
        
//         // Add date range filter if provided
//         if (fromDate || toDate) {
//             query.case_status = { $elemMatch: {} };
            
//             if (fromDate) {
//                 query.case_status.$elemMatch.created_dtm = { 
//                     ...query.case_status.$elemMatch.created_dtm,
//                     $gte: new Date(fromDate) 
//                 };
//             }
            
//             if (toDate) {
//                 query.case_status.$elemMatch.created_dtm = { 
//                     ...query.case_status.$elemMatch.created_dtm,
//                     $lte: new Date(toDate) 
//                 };
//             }
//         }
        
//         // Pagination logic
//         let page = Number(pages);
//         if (isNaN(page) || page < 1) page = 1;

//         const limit = page === 1 ? 10 : 30;
//         const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

//         // Fetch the total count of cases that match the filter criteria
//         const totalCount = await Case_details.countDocuments(query);
        
//         // Fetch the filtered cases with pagination
//         const distributions = await Case_details.find(query)
//             .skip(skip)
//             .limit(limit)
//             .sort({ case_id: -1 });
            
//         // Transform the data to match the table structure
//         const formattedData = distributions.map(item => {
//             // Find the write-off date from case_status array
//             const writeOffDate = item.case_status && item.case_status.length > 0 
//                 ? item.case_status[0].created_dtm 
//                 : null;
                
//             return {
//                 CASE_ID: item.case_id,
//                 STATUS: item.case_current_status,
//                 ACCOUNT_NO: item.account_no,
//                 CUSTOMER_REF: item.customer_ref,
//                 AMOUNT: item.current_arrears_amount,
//                 WRITE_OFF_ON: writeOffDate ? new Date(writeOffDate).toISOString().split('T')[0] : 'N/A'
//             };
//         });

//         return res.status(200).json({
//             status: "success",
//             message: "Cases retrieved successfully.",
//             data: formattedData,
//             total_cases: totalCount,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: error.message,
//         });
//     }
// };







// export const getAllWriteOffCases = async (req, res) => {
//     try {
//         let { status, fromDate, toDate, pages } = req.body;

//         // Pagination logic
//         let page = Number(pages);
//         if (isNaN(page) || page < 1) page = 1;
//         const limit = page === 1 ? 10 : 30;
//         const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

//         // Build filter query
//         const query = {};

//         // Filter by status if provided
//         if (status) {
//             query.case_current_status = status;
//         }

//         // Filter by created_dtm in case_status array (date range)
//         if (fromDate || toDate) {
//             // Convert to ISO strings for MongoDB comparison
//             let from = fromDate ? new Date(fromDate) : null;
//             let to = toDate ? new Date(toDate) : null;

//             // $elemMatch on case_status array for created_dtm
//             query.case_status = { 
//                 $elemMatch: {
//                     created_dtm: {
//                         ...(from && { $gte: from }),
//                         ...(to && { $lte: to })
//                     }
//                 }
//             };
//         }

//         // Fetch total count (without pagination)
//         const totalCount = await Case_details.countDocuments(query);

//         // Fetch paginated data, sorted by case_id descending
//         const cases = await Case_details.find(query)
//             .skip(skip)
//             .limit(limit)
//             .sort({ case_id: -1 });

//         // Format results for frontend
//         const results = cases.map(item => {
//             // Find the latest case_status (by created_dtm)
//             let writeOffStatus = (item.case_status || []).reduce((latest, curr) => {
//                 if (!latest || new Date(curr.created_dtm) > new Date(latest.created_dtm)) {
//                     return curr;
//                 }
//                 return latest;
//             }, null);

//             // Format date as 'YYYY-MM-DD'
//             let writeOffOn = writeOffStatus && writeOffStatus.created_dtm
//                 ? new Date(writeOffStatus.created_dtm).toISOString().slice(0, 10)
//                 : "";

//             return {
//                 caseId: item.case_id,
//                 case_current_status: item.case_current_status,
//                 accountNo: item.account_no,
//                 customerRef: item.customer_ref,
//                 amount: item.current_arrears_amount,
//                 case_phase: "case_status.case_phase", // No data yet
//                 status_dtm: "case_status.create_dtm"
//             };
//         });

//         // Calculate pagination info
//         const totalPages = Math.ceil(totalCount / (page === 1 ? 10 : 30));
//         const currentPage = page;
//         const count = results.length;

//         return res.status(200).json({
//             status: "success",
//             message: "Write-off cases retrieved successfully.",
//             data: {
//                 currentPage,
//                 totalPages,
//                 limit,
//                 count,
//                 total: totalCount,
//                 results
//             }
//         });

//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: error.message,
//         });
//     }
// };

// file: controllers/writeOffCasesController.js

export const getAllWriteOffCases = async (req, res) => {
    try {
        let { status, fromDate, toDate, pages } = req.body;

        let page = Number(pages);
        if (isNaN(page) || page < 1) page = 1;
        const limit = page === 1 ? 10 : 30;
        const skip = page === 1 ? 0 : 10 + (page - 2) * 30;

        const query = {};

        if (status) {
            query.case_current_status = status;
        }

        if (fromDate || toDate) {
            let from = fromDate ? new Date(fromDate) : null;
            let to = toDate ? new Date(toDate) : null;

            query.case_status = {
                $elemMatch: {
                    created_dtm: {
                        ...(from && { $gte: from }),
                        ...(to && { $lte: to })
                    }
                }
            };
        }

        const totalCount = await Case_details.countDocuments(query);

        const cases = await Case_details.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ case_id: -1 });

        const results = cases.map(item => {
            const latestStatus = (item.case_status || []).reduce((latest, curr) => {
                if (!latest || new Date(curr.created_dtm) > new Date(latest.created_dtm)) {
                    return curr;
                }
                return latest;
            }, null);

            const writeOffOn = latestStatus?.created_dtm
                ? new Date(latestStatus.created_dtm).toISOString().slice(0, 10)
                : "";
            // const casePhase = latestStatus?.case_phase
            //     ? new String(latestStatus.case_phase)
            //     : "";

            return {
                caseId: item.case_id,
                case_current_status: item.case_current_status,
                accountNo: item.account_no,
                customerRef: item.customer_ref,
                amount: item.current_arrears_amount,
                // case_phase: casePhase,
                status_dtm: writeOffOn
            };
        });

        const totalPages = Math.ceil(totalCount / (page === 1 ? 10 : 30));
        const currentPage = page;
        const count = results.length;

        return res.status(200).json({
            status: "success",
            message: "Write-off cases retrieved successfully.",
            data: {
                currentPage,
                totalPages,
                limit,
                count,
                total: totalCount,
                results
            }
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            error:error.message
        });
    }
};

