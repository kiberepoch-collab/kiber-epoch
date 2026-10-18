exports.handler = async (event) => {
  const reply = (statusCode, data) => ({
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (event.httpMethod !== "POST") {
    return reply(405, { error: "Method not allowed" });
  }

  if (!event.body  event.body.length > 10000) {
    return reply(400, { error: "Invalid request" });
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return reply(400, { error: "Invalid JSON" });
  }

  const clean = (value, max = 150) =>
    String(value ?? "").trim().slice(0, max);

  const name = clean(data.name);
  const phone = clean(data.phone, 40);
  const product = clean(data.product);
  const price = clean(data.price, 40);
  const city = clean(data.city);
  const branch = clean(data.branch);
  const comment = clean(data.comment, 500);

  if (!name  !phone  !product) {
    return reply(400, { error: "Missing required fields" });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token  !chatId) {
    return reply(500, { error: "Bot is not configured" });
  }

  const message = [
    "🖥 НОВА ЗАЯВКА — KIBER_EPOCH",
    "",
    Комп'ютер: ${product},
    Ціна: ${price || "Уточнюється"},
    "",
    Ім'я: ${name},
    Телефон: ${phone},
    Місто: ${city || "Не вказано"},
    Нова пошта: ${branch || "Не вказано"},
    Коментар: ${comment || "Немає"},
  ].join("\n");

  try {
    const response = await fetch(
      https://api.telegram.org/bot${token}/sendMessage,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
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
