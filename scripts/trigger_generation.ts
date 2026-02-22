import fetch from "node-fetch";

async function trigger() {
  try {
    console.log("Triggering wallpaper generation...");
    const response = await fetch("http://localhost:3000/api/generate-wallpaper", {
      method: "POST"
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Success:", data);
    } else {
      console.error("Failed:", response.status, await response.text());
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

trigger();
