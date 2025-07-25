const chatWithGemini = async (req, res, next) => {
    try {
      const { input } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ message: "Vui lòng cung cấp input hợp lệ." });
      };
      const GEMINI_API_KEY = process.env.KEYCHAT;
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const response = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: input,
                  },
                ],
              },
            ],
          }),
        }
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(`API lỗi: ${JSON.stringify(json)}`);
      }
      const aiText =
        json?.candidates?.[0]?.content?.parts?.[0]?.text || "Không có kết quả.";
      return res.status(200).json({
        message: "Thành công",
        data: aiText,
      });
  
    } catch (error) {
      console.error("Lỗi khi gọi Gemini:", error.message);
      return res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
    }
  };
  
  module.exports = {
    chatWithGemini,
  };