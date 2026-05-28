import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: "GYM-ON-GO — India's First Pay-Per-Use Fitness Platform",
  description: "Book gym sessions by the hour across 500+ partner gyms in India. No memberships. No lock-ins.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      </head>
      <body>
        <Providers>
          <div className="blue-glow tl"></div>
          <div className="blue-glow br"></div>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
