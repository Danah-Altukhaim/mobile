import dotenv from 'dotenv';
dotenv.config({ path: '../../../../.env' });

import { createServiceApp, errorHandler } from '@masari/backend-shared';
import { registerRoutes } from './routes';

const PORT = process.env.CAMPUS_SERVICE_PORT || 3005;
const { app } = createServiceApp();

registerRoutes(app);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[Campus Service] running on port ${PORT}`);
});
