import { LeadFlow } from "@/components/lead-flow"
import { AuthHeader } from "@/components/auth-header"

const MAIN_FORM_ID = "f5fad560-eea2-443c-98e9-1a66447dae86"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex justify-end p-4">
        <AuthHeader />
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <LeadFlow formId={MAIN_FORM_ID} />
      </div>
    </main>
  )
}
