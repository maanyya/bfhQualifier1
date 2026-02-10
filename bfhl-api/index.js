const express = require("express")
const cors = require("cors")
const axios = require("axios")
require('dotenv').config();

const app = express()
app.use(cors())
app.use(express.json())

const EMAIL = process.env.OFFICIAL_EMAIL

const isPrime = (n) => {
  if (n < 2) return false
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false
  }
  return true
}

const gcd = (a, b) => b === 0 ? a : gcd(b, a % b)
const lcm = (a, b) => (a * b) / gcd(a, b)

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: EMAIL
  })
})

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body
    const key = Object.keys(body)[0]

    if (!key) {
      return res.status(400).json({
        is_success: false,
        official_email: EMAIL
      })
    }

    let data

    if (key === "fibonacci") {
      const n = body.fibonacci
      if (typeof n !== "number" || n < 0) throw "Invalid input"

      const fib = [0, 1]
      for (let i = 2; i < n; i++) {
        fib.push(fib[i - 1] + fib[i - 2])
      }
      data = fib.slice(0, n)
    }

    else if (key === "prime") {
      if (!Array.isArray(body.prime)) throw "Invalid input"
      data = body.prime.filter(isPrime)
    }

    else if (key === "lcm") {
      if (!Array.isArray(body.lcm)) throw "Invalid input"
      data = body.lcm.reduce((a, b) => lcm(a, b))
    }

    else if (key === "hcf") {
      if (!Array.isArray(body.hcf)) throw "Invalid input"
      data = body.hcf.reduce((a, b) => gcd(a, b))
    }

    else if (key === "AI") {
      const question = body.AI
      if (typeof question !== "string") throw "Invalid input"

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.AI_API_KEY}`,
        {
          contents: [{ parts: [{ text: question }] }]
        }
      )

      data = response.data.candidates[0].content.parts[0].text.split(" ")[0]
    }

    else {
      throw "Invalid key"
    }

    res.status(200).json({
      is_success: true,
      official_email: EMAIL,
      data
    })

  } catch (err) {
    res.status(400).json({
      is_success: false,
      official_email: EMAIL
    })
  }
})

app.get('/', (req, res) => {
    res.send('Welcome to the BFHL API!');
});

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log("Server running on", PORT))
