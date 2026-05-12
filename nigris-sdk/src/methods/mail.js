export async function sendTemplate(client, { template, to, variables }) {
  const response = await client.request("/mail/send", {
    method: "POST",
    body: JSON.stringify({ template, to, variables }),
  });
  return response;
}

export async function sendDirect(client, { to, subject, html }) {
  const response = await client.request("/mail/send-direct", {
    method: "POST",
    body: JSON.stringify({ to, subject, html }),
  });
  return response;
}
