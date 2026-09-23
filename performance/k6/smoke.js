import http from 'k6/http';
import { check, sleep } from 'k6';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const BASE_URL = (__ENV.BASE_URL || 'http://localhost:30401').replace(/\/$/, '');
const API_URL = (__ENV.API_URL || 'http://localhost:5080/api').replace(/\/$/, '');
const WRITE_BOUNDED_SAMPLES = (__ENV.K6_BOUNDED_SAMPLES || '1') === '1';
const MAX_METRIC_SAMPLE_LINES = 24;

export const options = {
  scenarios: {
    smoke: {
      executor: 'constant-vus',
      vus: 2,
      duration: '90s',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<250'],
  },
};

export default function smoke() {
  const home = http.get(`${BASE_URL}/`);
  check(home, {
    'home status is 200': (r) => r.status === 200,
  });

  const tags = http.get(`${API_URL}/tags`);
  check(tags, {
    'tags status is 200': (r) => r.status === 200,
  });

  const articles = http.get(`${API_URL}/articles?limit=10`);
  check(articles, {
    'articles status is 200': (r) => r.status === 200,
  });

  sleep(1);
}

function boundedMetricSamplesNdjson(data) {
  const lines = [];
  const metrics = data.metrics || {};
  for (const [name, metric] of Object.entries(metrics)) {
    if (lines.length >= MAX_METRIC_SAMPLE_LINES) {
      break;
    }
    if (!metric || typeof metric !== 'object' || !metric.values) {
      continue;
    }
    lines.push(
      JSON.stringify({
        ts: new Date().toISOString(),
        metric: name,
        values: metric.values,
      }),
    );
  }
  return `${lines.join('\n')}\n`;
}

export function handleSummary(data) {
  const outputs = {
    'k6/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };

  if (WRITE_BOUNDED_SAMPLES) {
    outputs['k6/metric-samples.ndjson'] = boundedMetricSamplesNdjson(data);
  }

  return outputs;
}
