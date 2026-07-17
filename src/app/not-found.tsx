import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center">
      <h1 className="font-display font-semibold text-4xl">404</h1>
      <p className="mt-3 text-neutral-500">Esta página no existe / This page does not exist.</p>
      <Link href="/" className="btn-primary mt-8">
        akrono →
      </Link>
    </div>
  );
}
