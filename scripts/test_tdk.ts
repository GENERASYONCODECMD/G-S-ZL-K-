import fetch from "node-fetch";

async function testTDK() {
  try {
    console.log("Testing TDK API...");
    const response = await fetch("http://localhost:3000/api/tdk?q=kalem");
    
    if (response.ok) {
      const data = await response.json();
      console.log("Success:", JSON.stringify(data).substring(0, 200) + "...");
    } else {
      console.error("Failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

testTDK();
