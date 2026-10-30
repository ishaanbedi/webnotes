import { DEVELOPER, DEVELOPER_URL } from "@/lib/site";

export function DeveloperLink() {
  return (
    <a href={DEVELOPER_URL} target="_blank" rel="noopener" className="text-foreground underline-offset-4 hover:underline">
      {DEVELOPER}
    </a>
  );
}
