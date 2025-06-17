export const POST = async (req: Request) => {
  try {
    const body = await req.json();

    const PINATA_API_KEY = process.env.PINATA_API_KEY;
    const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;
    const PINATA_JWT = process.env.PINATA_JWT;
    // Use the official Pinata API endpoint for pinning JSON
    const pinataUrl = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    if (!PINATA_API_KEY && !PINATA_JWT) {
      return Response.json({ error: 'Pinata credentials not found in env' }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (PINATA_JWT) {
      headers['Authorization'] = `Bearer ${PINATA_JWT}`;
    } else {
      headers['pinata_api_key'] = PINATA_API_KEY!;
      headers['pinata_secret_api_key'] = PINATA_SECRET_API_KEY!;
    }

    const response = await fetch(pinataUrl!, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        pinataContent: body,
      }),
    });



    let data;
    try {
      data = await response.json();
    } catch (jsonErr) {
      const text = await response.text();
      console.error('Pinata response not JSON:', text);
      return Response.json({ error: 'Pinata error: ' + text }, { status: 500 });
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/store-listing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cid: data.IpfsHash }),
      });
    } catch (err) {
    }
    return Response.json({ cid: data.IpfsHash });
  } catch (error: any) {
    console.log(error);
    return Response.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
};
