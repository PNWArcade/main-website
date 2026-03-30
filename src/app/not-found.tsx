import Link from "next/link"
import { Button } from "@/components/ui/buttons/Button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons"

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center text-center bg-linear-to-b from-background to-muted/30 px-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-3">
          <FontAwesomeIcon icon={faTriangleExclamation} className="size-10 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight text-foreground">
            404
          </h1>
        </div>

        <p className="max-w-md text-lg text-muted-foreground">
          Oops! The page you’re looking for doesn’t exist.  
          It might’ve been moved, deleted, or maybe you followed a bad link.
        </p>

        <Button asChild size="lg" variant="default" className="mt-4">
          <Link href="/">Back to Home</Link>
        </Button>

        <div className="mt-8 text-sm text-muted-foreground">
          <p> Purdue Northwest ASME</p>
        </div>
      </div>
    </main>
  )
}
