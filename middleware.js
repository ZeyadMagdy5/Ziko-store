// Standard Vercel Edge Middleware
export default async function middleware(request) {
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
     const backendUrl = new URL(url.pathname, 'https://bags-shop.runasp.net');
     backendUrl.search = url.search;

     // Prepare headers for backend
     const backendHeaders = new Headers(request.headers);
     backendHeaders.set('Host', 'bags-shop.runasp.net');
     backendHeaders.set('X-Forwarded-Host', url.host);
     backendHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));

     // Pass request to backend
     const backendRes = await fetch(backendUrl.toString(), {
       headers: backendHeaders,
       method: request.method,
       body: request.body, // readable stream
       redirect: 'manual', 
     });

     // Create response
     const headers = new Headers(backendRes.headers);
     
     // Fix Set-Cookie
     const setCookie = headers.get('set-cookie');
     if (setCookie) {
       // Strip Domain
       headers.set('set-cookie', setCookie.replace(/Domain=[^;]+;?/gi, ''));
     }

     return new Response(backendRes.body, {
       status: backendRes.status,
       headers: headers
     });
  }
}

export const config = {
  matcher: '/api/:path*',
};
  

