"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const vehicles_1 = __importDefault(require("./routes/vehicles"));
const quotes_1 = __importDefault(require("./routes/quotes"));
const services_1 = __importDefault(require("./routes/services"));
const suppliers_1 = __importDefault(require("./routes/suppliers"));
const admin_1 = __importDefault(require("./routes/admin"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/vehicles', vehicles_1.default);
app.use('/api/quotes', quotes_1.default);
app.use('/api/services', services_1.default);
app.use('/api/suppliers', suppliers_1.default);
app.use('/api/admin', admin_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
