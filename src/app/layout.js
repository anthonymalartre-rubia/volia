import './globals.css';

export const metadata = {
  title: 'EZDrive - Scraping Prospects DOM',
  description: 'B2B prospect scraping tool for DOM territories (971, 972, 973, 974). Automated prospection and lead generation from multiple sources.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-bg-base min-h-screen">
        {children}
      </body>
    </html>
  );
}
