import db from "../config/db.js";

export const getSequence = async (req, res) => {
    try {
        const {collection_name} = req.body;
        let nextValueString ='-1';
        const sequenceMap = new Map([
            ['Services', 'seq_service_type'],
        ]);

        if(!collection_name){
            return res.status(400).json({
                status: 'error',
                message: 'Failed to retrieve next sequence details.',
                error: {
                    "code": 400,
                    "description": "collection_name is required."
                }
              });
        }

        const seq = sequenceMap.get(collection_name);
        if (!seq) {
            return res.status(404).json({
              status: 'not found',
              message: 'Unknown collection or sequence name.',
              data: { sequence: nextValueString },
            });
        }

        const query = `SELECT NEXTVAL(${seq}) AS next_val`;
    
        const connection = await db.pool.getConnection();
    
        try {
          
          const result = await connection.query(query);
          const nextValue = result?.[0]?.next_val; 
          nextValueString = nextValue ? parseInt(nextValue, 10) : '-1';
          // console.log(nextValueString);

          return res.status(200).json({
            status: 'success',
            message: 'Successfully etrieved next sequence value.',
            data:{sequence:nextValueString}, 
          });

        } finally {
          connection.release();
        }

      } catch (error) {
      
        return res.status(500).json({
          status: 'error',
          message: 'An error occurred while retrieving the next sequence value.',
          error: error.message,
        });

      }
}