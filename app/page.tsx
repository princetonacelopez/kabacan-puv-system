import { auth } from "@/app/api/auth/[...nextauth]/route";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-4">Kabacan PUV Violation System</h1>
      {session ? (
        <div>
          <p>Welcome, {session.user.name} ({session.user.role})</p>
          <form action="/api/auth/signout" method="POST">
            <Button type="submit">Sign Out</Button>
          </form>
        </div>
      ) : (
        <Button asChild>
          <a href="/api/auth/signin">Sign In</a>
        </Button>
      )}
    </main>
  );
}