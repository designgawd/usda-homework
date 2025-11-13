import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import { LayoutProvider }from "@/contexts/LayoutContext";
import { GET as getAgencies } from './api/agencies/route';
import { GET as getCorrections } from './api/corrections/route';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "USDS Engineering Take-Home Assessment",
  description: "The goal of this assessment is to create a simple website to analyze Federal Regulations to allow for more digestible and actionable insights to be made on potential deregulation efforts across the government.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const agenciesRes = await getAgencies();
  const agencies = await agenciesRes.json();

  const correctionsRes = await getCorrections();
  const corrections = await correctionsRes.json();

  // console.log("Agencies:",agencies)
  // console.log("Corrections:",corrections)

  const data = { agencies, corrections };

  return (
    <html lang="en">
      <body className={` ${inter.className} mt-24`}>
        <LayoutProvider data={data}>
          <Navigation />
          {children}
        </LayoutProvider>
      </body>
    </html>
  );
}
