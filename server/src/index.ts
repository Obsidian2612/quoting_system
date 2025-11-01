import express from 'express';
import cors from 'cors';
import vehicleRoutes from './routes/vehicles';
import quoteRoutes from './routes/quotes';
import serviceRoutes from './routes/services';
import supplierRoutes from './routes/suppliers';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});