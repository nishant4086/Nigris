export async function sendTemplate(client, { template, to, variables }) {
  return client.request({
    method: "POST",
    url: "/mail/send",
    data: { template, to, variables },
  });
}

export async function sendDirect(client, { to, subject, html }) {
  return client.request({
    method: "POST",
    url: "/mail/send-direct",
    data: { to, subject, html },
  });
}
