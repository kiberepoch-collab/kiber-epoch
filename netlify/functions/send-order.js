
exports.handler = async function (event) {
  const reply = (statusCode, payload) => ({
    statusCode,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload)
  });

  if (event.httpMethod !== "POST") {
    return reply(405, { error: "Method not allowed" });
  }
  if (typeof event.body !== "string") {
    return reply(400, { error: "Missing request body" });
  }
  if (event.body.length > 10000) {
    return reply(413, { error: "Request too large" });
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }

  if (data === null) return reply(400, { error: "Invalid order" });
  if (typeof data !== "object") return reply(400, { error: "Invalid order" });
  if (Array.isArray(data)) return reply(400, { error: "Invalid order" });

  const clean = (value, limit) =>
    String(value == null ? "" : value).trim().slice(0, limit);

  const name = clean(data.name, 100);
  const phone = clean(data.phone, 40);
  const product = clean(data.product, 150);
  const price = clean(data.price, 40);
  const city = clean(data.city, 100);
  const branch = clean(data.branch, 100);
  const comment = clean(data.comment, 500);

  if (!name) return reply(400, { error: "Name required" });
  if (!phone) return reply(400, { error: "Phone required" });
  if (!product) return reply(400, { error: "Product required" });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token) return reply(500, { error: "Bot not configured" });
  if (!chatId) return reply(500, { error: "Chat not configured" });

  const message = [
    "🖥 НОВА ЗАЯВКА — KIBER_EPOCH",
    "",
    "Комп'ютер: " + product,
    "Ціна: " + (price ? price : "Уточнюється"),
    "",
    "Ім'я: " + name,
    "Телефон: " + phone,
    "Місто: " + (city ? city : "Не вказано"),
    "Нова пошта: " + (branch ? branch : "Не вказано"),
    "Коментар: " + (comment ? comment : "Немає")
  ].join("\n");

  try {
    const response = await fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    if (!response.ok) {
      return reply(502, { error: "Telegram delivery failed" });
    }

    return reply(200, { success: true });
  } catch {
    return reply(502, { error: "Telegram unavailable" });
  }
};
