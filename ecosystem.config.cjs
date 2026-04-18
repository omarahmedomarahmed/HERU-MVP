// PM2 Ecosystem Configuration for HERU.gg
// Usage: pm2 start ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: 'heru-backend',
      cwd: './backend',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '500M',
      error_file: '/var/log/pm2/heru-error.log',
      out_file: '/var/log/pm2/heru-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
    {
      name: 'heru-bot',
      cwd: './bot',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
      },
      max_memory_restart: '250M',
      error_file: '/var/log/pm2/heru-bot-error.log',
      out_file: '/var/log/pm2/heru-bot-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: false,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 5000,
    },
  ],
};
