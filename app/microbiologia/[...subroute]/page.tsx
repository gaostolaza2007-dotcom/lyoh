import { redirect } from "next/navigation";

export default function MicrobiologiaSubrouteRedirectPage({
  searchParams,
}: {
  params: { subroute?: string[] };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const params = new URLSearchParams();
  if (searchParams) {
    for (const [key, val] of Object.entries(searchParams)) {
      if (Array.isArray(val)) {
        val.forEach((v) => params.append(key, v));
      } else if (typeof val === "string") {
        params.append(key, val);
      }
    }
  }

  const query = params.toString();
  const destination = query
    ? `/agentes-infecciosos/microbiologia?${query}`
    : `/agentes-infecciosos/microbiologia`;

  redirect(destination);
}
