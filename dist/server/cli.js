import { createExamMixerServer } from "./app-server.js";
const PORT = parseInt(process.env.PORT || "3000", 10);
const HOST = process.env.HOST || "0.0.0.0";
const server = createExamMixerServer();
server.listen(PORT, HOST, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 EXAM MIXER APPLICATION SERVER ĐÃ KHỞI CHẠY THÀNH CÔNG!`);
    console.log(`📍 Địa chỉ truy cập UI: http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});
