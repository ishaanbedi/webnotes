import PlateEditor from '@/components/plate-editor';
import { ThemeToggle } from '@/components/site/theme-toggle';

export default function IndexPage() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="rounded-lg border bg-background shadow">
        <PlateEditor />
      </div>
    </section>
  );
}
