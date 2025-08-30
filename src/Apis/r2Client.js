// r2Client.js
import { S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: "https://fff50cf33deaf058d417178eae241724.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "b358cfc0eb0a47297b57a0355a85cf12",
    secretAccessKey: "f2960a0b0ffebc67cb57297f38bb5584d097a8381095ba7ec6a7400fb445385b",
  },
});

export default r2Client;
