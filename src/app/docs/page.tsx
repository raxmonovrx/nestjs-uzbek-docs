import { redirect } from "next/navigation"
import { getFirstDoc } from "@/lib/docs"

export default function DocsIndexPage() {
  const firstDoc = getFirstDoc()

  if (!firstDoc) {
    return null
  }

  redirect(firstDoc.href)
}
