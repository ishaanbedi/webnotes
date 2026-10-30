// One-off: allow the browser to PUT images straight to the bucket via presigned URLs.
// Usage: APP_ORIGIN=https://your-app.com node --env-file=.env.local scripts/storage-cors.mjs
import { PutBucketCorsCommand, S3Client } from "@aws-sdk/client-s3";

const origins = (process.env.APP_ORIGIN ?? "http://localhost:3000").split(",");
const client = new S3Client({
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_ENDPOINT_URL_S3,
  forcePathStyle: true,
  credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
});

await client.send(
  new PutBucketCorsCommand({
    Bucket: process.env.S3_BUCKET ?? "uploads",
    CORSConfiguration: {
      CORSRules: [{ AllowedOrigins: origins, AllowedMethods: ["PUT"], AllowedHeaders: ["*"], MaxAgeSeconds: 3600 }],
    },
  }),
);
console.log("CORS set for", origins.join(", "));
