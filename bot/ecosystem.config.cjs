module.exports = {
  apps: [{
    name: 'heru-bot',
    script: 'index.js',
    cwd: './bot',
    watch: false,
    env: { NODE_ENV: 'production' },
    error_file: '../logs/heru-bot-error.log',
    out_file: '../logs/heru-bot-out.log',
  }],
};
