const winston = require("winston");
const { ElasticsearchTransport } = require("winston-elasticsearch");

const esTransportOpts = {
  level: "info",
  clientOpts: { node: process.env.ELASTICSEARCH_URL || "http://localhost:9200" },
  indexPrefix: "kcc-logs",
  indexSuffixPattern: "YYYY.MM.DD",
};

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: "logs/app.log" }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new ElasticsearchTransport(esTransportOpts),
  ],
});

// Handle transport errors to prevent fatal application crashes
logger.on('error', (error) => {
  console.error('Logger Error Caught (e.g. Elasticsearch connection failed):', error.message);
});

module.exports = logger;