const apiKey = "578d0a42e4414bc1adf0f18e3e807c67.jaC0xdDjF-kN745D3PCH3GU8";
const url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

async function test() {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "glm-4-flash",
        messages: [{ role: "user", content: "hi" }]
      })
    });
    console.log("Status:", res.status);
    console.log("Status text:", res.statusText);
    const body = await res.text();
    console.log("Body:", body);
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
