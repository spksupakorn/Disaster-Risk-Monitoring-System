import { App } from './app';
import { Config } from './config/config';

async function main() {
  const app = new App();

  try {
    await app.initialize();

    const server = app.app.listen(Config.server.port, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║   Disaster Risk Monitoring System                         ║
║   Server running on port ${Config.server.port}                         ║
║   Environment: ${Config.server.nodeEnv}                        ║
║   API Documentation: http://localhost:${Config.server.port}/api-docs  ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received, shutting down gracefully...`);
      
      server.close(async () => {
        await app.shutdown();
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

main();
