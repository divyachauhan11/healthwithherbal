require("dotenv").config();
const {
  isCloudinaryConfigured,
  testConnection,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} = require("../src/services/cloudinary");

async function run() {
  console.log("==================================================");
  console.log("  Health with Herbal - Cloudinary Test Tool       ");
  console.log("==================================================");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_FOLDER || "healthwithherbal";

  console.log(`Cloud Name: ${cloudName ? cloudName : "[NOT SET]"}`);
  console.log(`API Key:    ${apiKey ? `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}` : "[NOT SET]"}`);
  console.log(`API Secret: ${apiSecret ? "[HIDDEN - PRESENT]" : "[NOT SET]"}`);
  console.log(`Folder:     ${folder}`);
  console.log("--------------------------------------------------");

  if (!isCloudinaryConfigured()) {
    console.error("❌ Cloudinary credentials are missing or using placeholder values in .env!");
    console.log("\nPlease add your real credentials to backend/.env:");
    console.log("CLOUDINARY_CLOUD_NAME=your_actual_cloud_name");
    console.log("CLOUDINARY_API_KEY=your_actual_api_key");
    console.log("CLOUDINARY_API_SECRET=your_actual_api_secret");
    process.exit(1);
  }

  if (apiKey === apiSecret) {
    console.error("\n❌ Issue Detected: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are identical!");
    console.error("   You pasted the API Key into the API Secret field.");
    console.error("   The API Secret is a separate secret key (letters & numbers) found right below the API Key in the Cloudinary Console.");
    console.log("   Click the eye icon 👁️ or Copy icon next to 'API Secret' at https://console.cloudinary.com/pm and paste it into CLOUDINARY_API_SECRET in backend/.env.\n");
    process.exit(1);
  }

  try {
    console.log("1. Testing Cloudinary API connection (ping)...");
    const pingRes = await testConnection();
    console.log("   ✅ Connection successful! Cloudinary ping response:", pingRes);

    console.log("\n2. Testing sample image upload to Cloudinary...");
    // 1x1 transparent PNG pixel buffer
    const testBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      "base64"
    );

    const uploadRes = await uploadBufferToCloudinary(testBuffer, {
      folder: `${folder}/tests`,
      tags: ["test", "verification"],
    });

    console.log("   ✅ Image uploaded successfully!");
    console.log(`   Secure URL: ${uploadRes.secure_url}`);
    console.log(`   Public ID:  ${uploadRes.public_id}`);
    console.log(`   Format:     ${uploadRes.format}`);
    console.log(`   Bytes:      ${uploadRes.bytes}`);

    console.log("\n3. Cleaning up test image from Cloudinary...");
    await deleteFromCloudinary(uploadRes.public_id);
    console.log("   ✅ Test image removed cleanly.");

    console.log("\n==================================================");
    console.log("🎉 All Cloudinary tests PASSED! Integration is ready!");
    console.log("==================================================");
  } catch (err) {
    console.error("\n❌ Cloudinary error occurred:", err.message || err);
    if (err.http_code === 401) {
      console.error("   Hint: 401 Unauthorized means your API Key or API Secret is incorrect.");
    } else if (err.http_code === 404) {
      console.error("   Hint: 404 Not Found means your Cloud Name is incorrect.");
    }
    process.exit(1);
  }
}

run();
