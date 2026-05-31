"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const roleRoutes_1 = __importDefault(require("./routes/roleRoutes"));
const authMiddleware_1 = require("./middlewares/authMiddleware");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
app.use('/api/v1/roles', roleRoutes_1.default);
// Health check
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));
exports.default = app;
//# sourceMappingURL=app.js.map