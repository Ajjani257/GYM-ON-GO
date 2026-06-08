import './globals.css';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/Toast';
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google';

const inter = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-body' });
const outfit = Outfit({ subsets: ['latin'], weight: ['600', '700', '800', '900'], variable: '--font-head' });

export const metadata = {
  title: "GYM-ON-GO — Flexible Gym Sessions Near You",
  description: "Find nearby gyms, compare prices, and book hourly workout sessions without a membership.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${outfit.variable}`}>
        <Providers>
          <ToastProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
