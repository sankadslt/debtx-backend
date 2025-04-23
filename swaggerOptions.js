/* 
    Purpose: This template is used for the DRC Routes.
    Created Date: 2024-11-21
    Created By:   Lasandi Randini (randini-im20057@stu.kln.ac.lk)
    Last Modified Date: 2024-11-21
    Version: Node.js v20.11.1
    Dependencies: express
    Related Files: swaggerOptions.js
    Notes:  
*/



import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Debet Recovery",
      version: "1.0.0",
      description: "API documentation for Debet Recovery",
    },
    servers: [
      {
        url: "http://localhost:5000", 
      },
    ],
  },
  apis: ["./routes/*.js"], 
};

export const swaggerSpec = swaggerJSDoc(options);
