import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Funkshan - Invite, Socialize, Memorialize',
    description:
        'Organize everything from casual hangouts to major galas in one app. The future of event planning is here.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' className='dark'>
            <head>
                <meta charSet='utf-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />
                <link rel='preconnect' href='https://fonts.googleapis.com' />
                <link
                    rel='preconnect'
                    href='https://fonts.gstatic.com'
                    crossOrigin='anonymous'
                />
                <link
                    href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap'
                    rel='stylesheet'
                />
                <link
                    href='https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
                    rel='stylesheet'
                />
            </head>
            <body
                className='bg-background-light dark:bg-background-dark font-display text-white overflow-x-hidden antialiased selection:bg-primary selection:text-white'
                suppressHydrationWarning
            >
                {children}
            </body>
        </html>
    );
}
