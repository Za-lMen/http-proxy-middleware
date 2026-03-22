const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  const target = req.query._target_url_;

  if (!target) {
    return res.status(400).send('Missing required parameter: _target_url_');
  }

  try {
    new URL(target);
  } catch {
    return res.status(400).send('Invalid URL in _target_url_');
  }

  delete req.query._target_url_;
  const params = new URLSearchParams(req.query).toString();
  req.url = req.path + (params ? '?' + params : '');

  createProxyMiddleware({
    target,
    changeOrigin: true,
    followRedirects: true,
    on: {
      error: (err, req, res) => {
        res.status(502).send('Proxy error: ' + err.message);
      }
    }
  })(req, res, next);
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
