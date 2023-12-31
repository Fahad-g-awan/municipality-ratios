import excelToJSON from "convert-excel-to-json";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import fs from "fs";

import { RatiosModel } from "../../database/models/index.js";

cloudinary.config({
  cloud_name: "die8a0e2l",
  api_key: "675986535461776",
  api_secret: "2MK_Fa7SsKoeJKU-CNwYTJ2ZGj0",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const createUploadsDirectory = () => {
  const uploadsPath = path.join(__dirname, "uploads");

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
  }
};

const saveFile = async (file) => {
  createUploadsDirectory();
  console.log("file.file", file.file);

  const { createReadStream, filename, mimetype } = await file.file;
  let fileName;

  if (filename.includes("xlsx")) {
    fileName = filename + "_excel";
  } else {
    fileName = filename + "_logo";
  }

  const stream = createReadStream();
  const filePath = path.join(__dirname, "uploads", fileName);

  const writeStream = fs.createWriteStream(filePath);

  await new Promise((resolve, reject) => {
    stream.pipe(writeStream).on("finish", resolve).on("error", reject);
  });

  return filePath;
};

const importExcelData = async (filePath, logoUrl) => {
  try {
    const excelData = excelToJSON({
      sourceFile: filePath,
      sheets: [
        {
          name: "Ratios",
          header: {
            rows: 0,
          },
          columnsToKey: {
            A: "ratioId",
            B: "state",
            C: "city",
            D: "dateOfAuditReport",
            E: "yearOfAuditReport",
            F: "name",
            G: "descrition",
            H: "ratio",
            R: "category",
          },
        },
      ],
    });

    console.log("exceldata:", excelData);

    // Create an array of documents based on the excelData
    const documents = [];

    for (let i = 1; i < excelData.Ratios.length; i++) {
      const row = excelData.Ratios[i];
      console.log("logoUrl", logoUrl);
      const document = {
        ratioId: row.A,
        state: row.B,
        city: row.C,
        dateOfAuditReport: row.D,
        yearOfAuditReport: row.E,
        name: row.F,
        descrition: row.G,
        ratio: row.H,
        category: row.R,
        logoUrl: logoUrl,
      };

      documents.push(document);
    }

    const result = await RatiosModel.insertMany(documents);

    console.log("Data successfully saved to MongoDB:", result);
  } catch (err) {
    console.error("Error saving data to MongoDB:", err);
  }

  // Remove the uploaded file after saving to MongoDB
  fs.unlinkSync(filePath);
};

const ratiosResolver = {
  Query: {
    ratios: async (parent, { city }, context) => {
      console.log("city", city);
      try {
        const ratios = await RatiosModel.find({ city: city });
        console.log("ratios", ratios);

        let ratiosData = [];

        if (ratios) {
          for (let i = 0; i < ratios.length; i++) {
            ratiosData.push({
              ratioId: ratios[i].ratioId,
              state: ratios[i].state,
              city: ratios[i].city,
              dateOfAuditReport: ratios[i].dateOfAuditReport,
              yearOfAuditReport: ratios[i].yearOfAuditReport,
              name: ratios[i].name,
              descrition: ratios[i].descrition,
              ratio: `${Math.floor(ratios[i].ratio * 100)}%`,
              category: ratios[i].category,
              logoUrl: ratios[i].logoUrl,
            });
          }
        } else {
          throw new Error("No records found");
        }

        return ratiosData;
      } catch (error) {
        throw error;
      }
    },
  },

  Mutation: {
    uploadRatios: async (parent, { files }, context) => {
      // console.log("files", files);
      const filePaths = await Promise.all(files.map(async (file) => saveFile(file)));
      console.log("Files saved:", filePaths);

      let logoPath;
      let excelPath;

      for (let file of filePaths) {
        if (file.includes("logo")) {
          logoPath = file;
        } else {
          excelPath = file;
        }
      }

      const cloudinaryUploadResponse = await cloudinary.uploader.upload(
        logoPath,
        {
          folder: "uploads",
          use_filename: true,
          unique_filename: false,
        },
        function (error, result) {
          {
            if (error) console.log(error);
            if (result) return result;
          }
        }
      );

      const logoUrl = cloudinaryUploadResponse.secure_url;

      console.log("logoUrl", logoUrl);

      // const filePath = __basedir + "/uploads/" + excel.filename;
      await importExcelData(excelPath, logoUrl);

      return "Files uploaded successfully";
    },
  },
};

export default ratiosResolver;
