import AgencyTable from "./components/AgencyTable";

async function getAgencies() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/agencies`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json();
}

export default async function Home() {
  const data = await getAgencies();

  return (
    <main>
      <AgencyTable agencies={data.agencies} />
    </main>
  );
}
