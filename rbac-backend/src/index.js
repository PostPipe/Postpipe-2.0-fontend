"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
dotenv_1.default.config();
const PORT = process.env.PORT || 8080;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/postpipe_rbac';
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('Connected to MongoDB (Multi-Tenant RBAC)');
    app_1.default.listen(PORT, () => {
        console.log(`RBAC Service listening on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map