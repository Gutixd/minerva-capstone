export default function Loading() {
  return (
    <div className="container-x grid gap-10 pb-12 pt-28 lg:grid-cols-12 lg:gap-14" aria-busy="true" aria-label="Cargando producto">
      <div className="skeleton aspect-[4/5] rounded-[2rem] lg:col-span-7" />
      <div className="space-y-4 lg:col-span-5">
        <div className="skeleton h-4 w-24 rounded-full" />
        <div className="skeleton h-14 w-4/5 rounded-2xl" />
        <div className="skeleton h-8 w-32 rounded-full" />
        <div className="skeleton h-24 rounded-2xl" />
        <div className="skeleton h-56 rounded-[1.75rem]" />
        <div className="skeleton h-14 rounded-full" />
      </div>
    </div>
  );
}
