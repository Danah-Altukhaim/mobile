import dotenv from 'dotenv';
dotenv.config({ path: '../../../../.env' });

import { createServiceApp, errorHandler } from '@masari/backend-shared';
import { registerRoutes } from './routes';

const PORT = process.env.ACADEMIC_SERVICE_PORT || 3002;
const { app } = createServiceApp();

registerRoutes(app);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Academic Service] running on port ${PORT}`);
});
