import dotenv from "dotenv";
dotenv.config({ path: "./backend/.env" });

async function sendTestEmail() {
  const res = await fetch("https://smtp.maileroo.com/api/v2/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": process.env.MAILEROO_API_KEY,
    },
    body: JSON.stringify({
      from: {
        address: process.env.MAILEROO_FROM_EMAIL || "no-reply@pkserver.in",
        name: process.env.MAILEROO_FROM_NAME || "Forge",
      },
      to: [
        {
          address: "pkritwan1020@gmail.com",
          name: "Prashant",
        },
      ],
      subject: "Test Email 🚀",
      text: "Working or not?",
    }),
  });

  const data = await res.json();
  console.log(data);
}

sendTestEmail();
