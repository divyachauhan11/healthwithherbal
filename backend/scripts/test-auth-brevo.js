const mongoose = require("mongoose");
const config = require("../src/config");
const User = require("../src/models/User");
const Otp = require("../src/models/Otp");
const app = require("../src/app");
const http = require("http");

async function runTests() {
  console.log("=================================================");
  console.log("🧪 Starting Automated Brevo OTP & Auth Verification");
  console.log("=================================================");

  // Connect DB
  await mongoose.connect(config.mongoUri);
  console.log("✅ MongoDB connected successfully");

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(4005, resolve));
  const baseUrl = "http://127.0.0.1:4005/api/auth";
  console.log("✅ Test API server running at http://127.0.0.1:4005");

  try {
    // -----------------------------------------------------------------
    // TEST 1: Request Login OTP with unregistered mobile number
    // -----------------------------------------------------------------
    console.log("\n[Test 1] Testing login with non-existent phone...");
    const res1 = await fetch(`${baseUrl}/login/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "9999999999" }),
    });
    const data1 = await res1.json();
    if (res1.status === 404 && data1.notRegistered) {
      console.log("✅ PASS: Correctly blocked unregistered phone number (404)");
    } else {
      throw new Error(`Test 1 Failed: Expected 404, got ${res1.status}: ${JSON.stringify(data1)}`);
    }

    // -----------------------------------------------------------------
    // TEST 2: Request Login OTP with existing user phone
    // -----------------------------------------------------------------
    console.log("\n[Test 2] Testing login request-otp with existing user (8532877063)...");
    const res2 = await fetch(`${baseUrl}/login/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "8532877063" }),
    });
    const data2 = await res2.json();
    if (res2.ok && data2.success) {
      console.log(`✅ PASS: Login OTP generated for email (${data2.maskedEmail})`);
    } else {
      throw new Error(`Test 2 Failed: ${JSON.stringify(data2)}`);
    }

    // Check OTP record in DB
    const existingUser = await User.findOne({ phone: "8532877063" });
    const otpDoc2 = await Otp.findOne({ email: existingUser.email, purpose: "login" });
    if (!otpDoc2 || otpDoc2.otp.length !== 6) {
      throw new Error("Test 2 Failed: 6-digit OTP document was not stored in database");
    }
    console.log(`✅ PASS: Found 6-digit OTP in MongoDB Otp collection: ${otpDoc2.otp}`);

    // -----------------------------------------------------------------
    // TEST 3: Verify Login OTP with wrong code
    // -----------------------------------------------------------------
    console.log("\n[Test 3] Testing verify-otp with incorrect OTP (000000)...");
    const res3 = await fetch(`${baseUrl}/login/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "8532877063", otp: "000000" }),
    });
    const data3 = await res3.json();
    if (res3.status === 400 && data3.error.includes("Incorrect")) {
      console.log("✅ PASS: Correctly rejected invalid OTP");
    } else {
      throw new Error(`Test 3 Failed: ${JSON.stringify(data3)}`);
    }

    // -----------------------------------------------------------------
    // TEST 4: Verify Login OTP with correct code
    // -----------------------------------------------------------------
    console.log("\n[Test 4] Testing verify-otp with correct OTP...");
    const res4 = await fetch(`${baseUrl}/login/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "8532877063", otp: otpDoc2.otp }),
    });
    const data4 = await res4.json();
    if (res4.ok && data4.user && data4.user.email === existingUser.email) {
      console.log(`✅ PASS: Successfully verified login and returned user: ${data4.user.name}`);
    } else {
      throw new Error(`Test 4 Failed: ${JSON.stringify(data4)}`);
    }

    // Verify OTP was removed from DB after successful login
    const deletedOtp = await Otp.findOne({ _id: otpDoc2._id });
    if (!deletedOtp) {
      console.log("✅ PASS: OTP record cleanly deleted from database after verification");
    } else {
      throw new Error("Test 4 Failed: OTP record was not deleted after verification");
    }

    // -----------------------------------------------------------------
    // TEST 5: Signup request-otp with duplicate email
    // -----------------------------------------------------------------
    console.log("\n[Test 5] Testing signup request-otp with duplicate email...");
    const res5 = await fetch(`${baseUrl}/signup/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Duplicate",
        email: existingUser.email,
        phone: "9123456789",
      }),
    });
    const data5 = await res5.json();
    if (res5.status === 409) {
      console.log("✅ PASS: Correctly prevented duplicate signup (409 Conflict)");
    } else {
      throw new Error(`Test 5 Failed: ${JSON.stringify(data5)}`);
    }

    // -----------------------------------------------------------------
    // TEST 6: Signup request-otp with new user
    // -----------------------------------------------------------------
    const testSignupEmail = `test_brevo_${Date.now()}@healthwithherbal.local`;
    const testSignupPhone = "9876501234";
    const testSignupName = "Herbal Seeker";

    console.log(`\n[Test 6] Testing signup request-otp for new user (${testSignupEmail})...`);
    const res6 = await fetch(`${baseUrl}/signup/request-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: testSignupName,
        email: testSignupEmail,
        phone: testSignupPhone,
      }),
    });
    const data6 = await res6.json();
    if (res6.ok && data6.success) {
      console.log(`✅ PASS: Signup OTP created for ${data6.maskedEmail}`);
    } else {
      throw new Error(`Test 6 Failed: ${JSON.stringify(data6)}`);
    }

    // -----------------------------------------------------------------
    // TEST 7: Signup verify-otp and user creation in MongoDB
    // -----------------------------------------------------------------
    console.log("\n[Test 7] Testing signup verify-otp and MongoDB account creation...");
    const otpDoc6 = await Otp.findOne({ email: testSignupEmail, purpose: "signup" });
    if (!otpDoc6) {
      throw new Error("Test 7 Failed: Signup OTP document not found in DB");
    }

    const res7 = await fetch(`${baseUrl}/signup/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: testSignupName,
        email: testSignupEmail,
        phone: testSignupPhone,
        otp: otpDoc6.otp,
      }),
    });
    const data7 = await res7.json();
    if (res7.status === 201 && data7.user && data7.user.email === testSignupEmail) {
      console.log(`✅ PASS: New user account created in MongoDB! ID: ${data7.user._id}`);
    } else {
      throw new Error(`Test 7 Failed: ${JSON.stringify(data7)}`);
    }

    // Verify user exists in MongoDB User collection
    const createdUser = await User.findOne({ email: testSignupEmail });
    if (createdUser && createdUser.role === "customer" && createdUser.isActive) {
      console.log("✅ PASS: Verified created user in MongoDB User collection");
    } else {
      throw new Error("Test 7 Failed: User not saved properly in MongoDB");
    }

    // Clean up test user
    await User.deleteOne({ _id: createdUser._id });
    await Otp.deleteMany({ email: testSignupEmail });
    console.log("🧹 Cleaned up temporary test user and OTPs.");

    console.log("\n=================================================");
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=================================================\n");
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("❌ Test run failed with error:", err);
  process.exit(1);
});
