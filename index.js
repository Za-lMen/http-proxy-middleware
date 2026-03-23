const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.all('*', async (req, res) => {
  const target = req.query._target_url_ || req.body?._target_url_;

  if (!target) {
    return res.status(400).send('Missing required parameter: _target_url_');
  }

  try {
    new URL(target);
  } catch {
    return res.status(400).send('Invalid URL in _target_url_');
  }

  // מסיר את _target_url_ מהפרמטרים
  const params = { ...req.query };
  delete params._target_url_;

  const body = { ...req.body };
  delete body._target_url_;

  try {
    let url = target;
    const fetchOptions = { method: req.method, redirect: 'follow' };

    if (req.method === 'GET' || req.method === 'HEAD') {
      const qs = new URLSearchParams(params).toString();
      if (qs) url += '?' + qs;
    } else {
      const formData = new URLSearchParams(body).toString();
      fetchOptions.body = formData;
      fetchOptions.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    }

    const response = await fetch(url, fetchOptions);
    const text = await response.text();
    res.status(200).send(text);

  } catch (err) {
    res.status(502).send('Proxy error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
