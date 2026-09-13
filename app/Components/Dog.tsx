"use client";

import {
  AlertTriangle,
  BadgeCheck,
  Check,
  CircleUserRound,
  Droplets,
  HeartPulse,
  Home,
  IdCard,
  MapPin,
  Maximize2,
  MessageCircle,
  Navigation,
  PawPrint,
  Phone,
  Pill,
  ShieldCheck,
  Siren,
  Stethoscope,
  TrafficCone,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ButtonHTMLAttributes } from "react";

// TODO: move this to an environment variable (e.g. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
// before deploying, and restrict the key in Google Cloud Console to your domain.
const MAPS_API_KEY = "AIzaSyCbawb4Jj2t8-MOwHQS8yLxtmZuPxtZYWE";

const dog = {
  id: "DOG-00124",
  name: "Rookie",
  status: "Lost",
  breed: "Rare breed (exact breed not known, not a local breed)",
  age: "3 Years",
  gender: "Male",
  color: "Black",
  size: "Large · 31 kg",
  collar: "Orange nylon collar with a silver QR tag",
  marks: "White patch in the center of the chest, rest of the coat solid black",
  recognition: "Look for my solid black coat with a white patch right in the center of my chest, and my orange collar.",
  owner: { name: "Abdul Ahad", phoneDisplay: "+92 311 0461411", phone: "+923110461411" },
  emergency: { name: "Shahbana Kausar", phoneDisplay: "+92 323 4666765", phone: "+923234666765" },
  returnPoint: {
    label: "Home / Safe Return Point",
    address: "House No. 159, Block D, Naz Town, Near Valencia, Lahore",
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      "House No. 159, Block D, Naz Town, Near Valencia, Lahore",
    )}`,
    privacy: "The owner has chosen to keep the exact home address private. Please call before travelling.",
  },
  health: {
    allergies: "No known allergies",
    medication: "None",
    notes: "Can act aggressive and may growl or bark to scare people off, but does not bite. Approach calmly and give him space.",
    vaccination: "Up to date",
    microchip: "956000014321987",
    vet: "Ali Veterinary Audit and Account Society",
  },
} as const;

const RETURN_ADDRESS_QUERY = encodeURIComponent(dog.returnPoint.address);

const gallery = [
  { label: "Front photo", crop: "left-0 top-0" },
  { label: "Side photo", crop: "-left-full top-0" },
  { label: "Full-body photo", crop: "left-0 -top-full" },
  { label: "Collar & chest mark", crop: "-left-full -top-full" },
];

const instructions: Array<{ icon: LucideIcon; title: string; text: string }> = [
  { icon: PawPrint, title: "Don't chase me", text: "Crouch down, stay calm, and let me approach." },
  { icon: ShieldCheck, title: "Keep me safe", text: "Use a secure, enclosed space if possible." },
  { icon: Droplets, title: "Offer clean water", text: "A small bowl of fresh water will help." },
  { icon: Phone, title: "Contact my owner", text: "Call or message Abdul Ahad right away." },
  { icon: Navigation, title: "Share your location", text: "Send where you found me to my owner." },
  { icon: TrafficCone, title: "Stay away from roads", text: "Keep me clear of traffic and loud areas." },
];

function ActionButton({
  tone = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: "primary" | "secondary" | "quiet" | "danger" | "whatsapp";
}) {
  const tones = {
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90",
    secondary: "border border-border bg-card text-foreground shadow-sm hover:border-primary/30 hover:bg-accent",
    quiet: "bg-secondary text-secondary-foreground hover:bg-secondary/70",
    danger: "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90",
    whatsapp: "bg-success text-success-foreground shadow-lg shadow-success/20 hover:bg-success/90",
  };
  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition duration-200 active:scale-[.98] disabled:pointer-events-none disabled:opacity-50 ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6 max-w-2xl">
      <p className="mb-2 text-xs font-extrabold uppercase tracking-[.16em] text-primary">{eyebrow}</p>
      <h2 className="font-display text-3xl font-bold tracking-normal text-foreground sm:text-4xl">{title}</h2>
      {description ? <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border/70 py-3 last:border-0">
      <dt className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-base font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function IconTile({ icon: Icon, title, value }: { icon: LucideIcon; title: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-primary"><Icon className="size-5" /></span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[.08em] text-muted-foreground">{title}</span>
        <span className="mt-1 block text-sm font-semibold leading-snug text-foreground">{value}</span>
      </span>
    </div>
  );
}

export default function DogSafetyProfile() {
  const [lightbox, setLightbox] = useState<{ src: string; label: string; crop?: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [foundCoords, setFoundCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lightbox) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setLightbox(null);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [lightbox]);

  // Shows the safe return point by default. Once a finder shares their location,
  // switches to a live directions view from that location to the return point.
  const mapSrc = foundCoords
    ? `https://www.google.com/maps/embed/v1/directions?key=${MAPS_API_KEY}&origin=${foundCoords.lat},${foundCoords.lng}&destination=${RETURN_ADDRESS_QUERY}&mode=driving`
    : `https://www.google.com/maps/embed/v1/place?key=${MAPS_API_KEY}&q=${RETURN_ADDRESS_QUERY}`;

  const call = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };
  const whatsapp = () => {
    window.open(
      `https://wa.me/${dog.owner.phone.replace("+", "")}?text=${encodeURIComponent(`Hi ${dog.owner.name}, I found ${dog.name} (${dog.id}).`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };
  const shareLocation = () => {
    if (!navigator.geolocation) {
      setNotice("Location sharing isn't available on this device. Please call the owner instead.");
      return;
    }
    setNotice("Getting your location…");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setFoundCoords({ lat: coords.latitude, lng: coords.longitude });
        const map = `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
        const text = `I found ${dog.name} (${dog.id}). My location: ${map}`;
        if (navigator.share) navigator.share({ title: `Found ${dog.name}`, text }).catch(() => undefined);
        else
          window.open(
            `https://wa.me/${dog.owner.phone.replace("+", "")}?text=${encodeURIComponent(text)}`,
            "_blank",
            "noopener,noreferrer",
          );
        setNotice("Location ready to share with Rookie's owner.");
      },
      () => setNotice("We couldn't access your location. Please allow location access or call the owner."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-background pb-24 text-foreground md:pb-0">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 text-hero-foreground">
            <span className="grid size-10 place-items-center rounded-xl border border-hero-foreground/20 bg-hero-foreground/10 backdrop-blur"><PawPrint className="size-5" /></span>
            <div><p className="text-sm font-extrabold">PawSafe</p><p className="text-[10px] font-bold uppercase tracking-[.14em] text-hero-foreground/70">QR Recovery Profile</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-hero-foreground/20 bg-hero-foreground/10 px-3 py-2 text-xs font-bold text-hero-foreground backdrop-blur">
            <ShieldCheck className="size-4" /> Verified
          </div>
        </div>
      </header>

      <section className="relative min-h-[780px] overflow-hidden bg-hero sm:min-h-[720px] lg:min-h-[700px]">
        <img src="/Images/doghero.png" alt="Rookie, a rare-breed dog wearing a blue collar" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover object-[55%_center] sm:object-center" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative mx-auto flex min-h-[780px] max-w-7xl items-end px-4 pb-7 pt-28 sm:min-h-[720px] sm:px-6 sm:pb-10 lg:min-h-[700px] lg:items-center lg:px-8 lg:pt-28">
          <div className="w-full max-w-2xl text-hero-foreground">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-lost px-3.5 py-2 text-xs font-extrabold uppercase tracking-[.12em] text-lost-foreground shadow-lg">
              <span className="relative flex size-2.5"><span className="absolute inline-flex size-full animate-ping rounded-full bg-lost-foreground opacity-60" /><span className="relative inline-flex size-2.5 rounded-full bg-lost-foreground" /></span>
              Lost · Please contact my owner
            </div>
            <h1 className="font-display text-5xl font-bold tracking-normal sm:text-7xl">Hi, I’m {dog.name}.</h1>
            <p className="mt-3 max-w-xl text-xl font-medium leading-snug text-hero-foreground/90 sm:text-2xl">If you’ve found me, please help me get home.</p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-hero-foreground/80">
              <span className="inline-flex items-center gap-2"><IdCard className="size-4" /> {dog.id}</span>
              <span>{dog.breed}</span><span>{dog.age}</span><span>{dog.gender}</span>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <ActionButton tone="danger" className="sm:min-w-40" onClick={() => call(dog.owner.phone)}><Phone className="size-5" /> Call Owner</ActionButton>
              <ActionButton tone="whatsapp" className="sm:min-w-44" onClick={whatsapp}><MessageCircle className="size-5" /> WhatsApp</ActionButton>
              <ActionButton className="col-span-2 border border-hero-foreground/25 bg-hero-foreground/15 text-hero-foreground shadow-none backdrop-blur hover:bg-hero-foreground/25 sm:min-w-48" onClick={shareLocation}><Navigation className="size-5" /> Share Found Location</ActionButton>
            </div>
          </div>
        </div>
      </section>

      {notice ? (
        <div className="fixed left-1/2 top-5 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-card p-4 text-sm font-semibold text-foreground shadow-2xl">
          <Check className="size-5 shrink-0 text-success" /><span className="flex-1">{notice}</span><button aria-label="Close message" className="rounded-lg p-2 hover:bg-accent" onClick={() => setNotice(null)}><X className="size-4" /></button>
        </div>
      ) : null}

      <section className="relative z-10 mx-auto -mt-1 max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid overflow-hidden rounded-2xl border border-lost/20 bg-lost-soft shadow-xl lg:grid-cols-[1fr_auto]">
          <div className="flex gap-4 p-5 sm:p-7">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-lost text-lost-foreground"><Siren className="size-6" /></span>
            <div><p className="text-xs font-extrabold uppercase tracking-[.14em] text-lost">Immediate help</p><h2 className="mt-1 font-display text-2xl font-bold">I Found This Dog</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">Thank you for helping. Quickly notify {dog.name}’s owner and share where you found him.</p></div>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-lost/15 bg-card/60 p-4 sm:grid-cols-4 lg:grid-cols-2 lg:border-l lg:border-t-0 lg:p-5 xl:grid-cols-4">
            <ActionButton tone="danger" onClick={() => call(dog.owner.phone)}><Phone className="size-4" /> Call</ActionButton>
            <ActionButton tone="whatsapp" onClick={whatsapp}><MessageCircle className="size-4" /> WhatsApp</ActionButton>
            <ActionButton tone="secondary" onClick={shareLocation}><Navigation className="size-4" /> Location</ActionButton>
            <ActionButton tone="secondary" onClick={() => fileInput.current?.click()}><Upload className="size-4" /> Photo</ActionButton>
            <input ref={fileInput} className="hidden" type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && setNotice(`“${event.target.files[0].name}” is ready. The owner will receive it when uploads are connected.`)} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <SectionHeading eyebrow="People waiting for Rookie" title="Contact his family" description="Please call Abdul Ahad first. If you can’t reach him, contact the family member listed below." />
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: "Primary owner", person: dog.owner, icon: CircleUserRound, primary: true },
            { label: "Emergency contact", person: dog.emergency, icon: Phone, primary: false },
          ].map(({ label, person, icon: Icon, primary }) => (
            <article key={label} className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
                <span className="grid size-12 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-6" /></span>
                <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">{label}</p><h3 className="mt-1 truncate text-xl font-bold">{person.name}</h3><p className="mt-0.5 text-sm text-muted-foreground">{person.phoneDisplay}</p></div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ActionButton tone={primary ? "danger" : "primary"} onClick={() => call(person.phone)}><Phone className="size-5" /> Call {primary ? "Owner" : "Contact"}</ActionButton>
                {primary ? <ActionButton tone="whatsapp" onClick={whatsapp}><MessageCircle className="size-5" /> WhatsApp</ActionButton> : <ActionButton tone="secondary" onClick={() => setNotice("A text message to Rookie's emergency contact is ready to send.")}><MessageCircle className="size-5" /> Send Message</ActionButton>}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-section">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:px-8 lg:py-20">
          <div className="flex flex-col justify-center">
            <SectionHeading eyebrow="Return point" title="Safe Return Location" description="A safe meeting point selected by Rookie’s owner. Call before heading there so the family can meet you." />
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Home className="size-5" /></span><div><h3 className="font-bold">{dog.returnPoint.label}</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{dog.returnPoint.address}</p></div></div>
              <div className="my-4 flex gap-2 rounded-xl bg-muted p-3 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-primary" />{dog.returnPoint.privacy}</div>
              <ActionButton className="w-full" onClick={() => window.open(dog.returnPoint.mapUrl, "_blank", "noopener,noreferrer")}><Navigation className="size-5" /> Get Directions</ActionButton>
            </div>
          </div>
          <div className="relative min-h-80 overflow-hidden rounded-2xl border border-border bg-map shadow-lg sm:min-h-[420px]">
            <iframe
              title="Rookie's safe return location"
              src={mapSrc}
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {foundCoords ? (
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-lg bg-card/95 px-3 py-2 text-xs font-bold text-foreground shadow-md backdrop-blur">
                <Navigation className="size-4 shrink-0 text-primary" /> Showing the route from the shared location to the return point
              </div>
            ) : (
              <div className="absolute bottom-4 left-4 rounded-lg bg-card/95 px-3 py-2 text-xs font-bold text-foreground shadow-md backdrop-blur">Naz Town · Safe return area</div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading eyebrow="Identification" title={`About ${dog.name}`} description="Use these details to make sure you’ve found the right dog." />
        <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <div className="grid gap-x-8 rounded-2xl border border-border bg-card px-5 py-2 shadow-sm sm:grid-cols-2 sm:px-7">
            <dl><Detail label="Dog ID" value={dog.id} /><Detail label="Name" value={dog.name} /><Detail label="Breed" value={dog.breed} /><Detail label="Age" value={dog.age} /><Detail label="Gender" value={dog.gender} /></dl>
            <dl><Detail label="Color" value={dog.color} /><Detail label="Size" value={dog.size} /><Detail label="Collar" value={dog.collar} /><Detail label="Distinguishing marks" value={dog.marks} /></dl>
          </div>
          <aside className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-xl sm:p-8">
            <PawPrint className="absolute -bottom-8 -right-6 size-40 opacity-10" />
            <p className="text-xs font-extrabold uppercase tracking-[.14em] text-primary-foreground/70">How to recognize me</p>
            <p className="relative mt-4 font-display text-2xl font-bold leading-snug sm:text-3xl">“{dog.recognition}”</p>
            <div className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-2 text-xs font-bold"><BadgeCheck className="size-4" /> Matches registered profile</div>
          </aside>
        </div>
      </section>

      <section className="border-y border-border bg-section">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading eyebrow="Visual identification" title={`${dog.name}’s photos`} description="Tap a photo to see Rookie’s identifying features more clearly." />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((photo) => (
              <button key={photo.label} className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-muted shadow-sm" onClick={() => setLightbox({ src: "/Images/max-gallery.png", label: photo.label, crop: photo.crop })}>
                <img src="/Images/max-gallery.png" alt={photo.label} width={1024} height={1024} loading="lazy" className={`absolute h-[200%] w-[200%] max-w-none transition duration-500 group-hover:scale-[1.03] ${photo.crop}`} />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-image-caption p-3 text-left text-xs font-bold text-hero-foreground sm:text-sm">{photo.label}<Maximize2 className="size-4" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <SectionHeading eyebrow="Health record" title="Vaccination & proof" description="Rookie’s current vaccination summary and owner-approved proof document." />
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-extrabold text-success"><ShieldCheck className="size-5" /> Vaccinations Up to Date</span>
        </div>
        <article className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-lg lg:grid-cols-[1.2fr_.8fr]">
          <button className="group relative min-h-72 overflow-hidden bg-muted lg:min-h-[460px]" onClick={() => setLightbox({ src: "/Images/vacination.png", label: "Rookie’s vaccination certificate" })}>
            <img src="/Images/vacination.png" alt="Rookie’s vaccination certificate showing current DHPP and rabies vaccines" width={1024} height={768} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
            <span className="absolute bottom-4 right-4 grid size-11 place-items-center rounded-full bg-card text-foreground shadow-lg"><Maximize2 className="size-5" /></span>
          </button>
          <div className="p-5 sm:p-8">
            <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-success-soft text-success"><BadgeCheck className="size-6" /></span><div><p className="text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">Vaccination record 1</p><h3 className="text-xl font-bold">Core Vaccination Certificate</h3></div></div>
            <dl className="mt-6"><Detail label="Vaccines" value="DHPP + Rabies" /><Detail label="Vaccination date" value="12 June 2026" /><Detail label="Next due" value="12 June 2027" /><Detail label="Status" value="Current · Verified document" /></dl>
            <p className="mt-5 flex gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="size-4 shrink-0 text-success" />This document was selected by the owner for public emergency viewing.</p>
          </div>
        </article>
      </section>

      <section className="border-y border-border bg-section">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading eyebrow="Emergency care" title="Medical & safety information" description="Only information useful for Rookie’s immediate safety is shown here." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <IconTile icon={AlertTriangle} title="Allergies" value={dog.health.allergies} />
            <IconTile icon={Pill} title="Medication" value={dog.health.medication} />
            <IconTile icon={HeartPulse} title="Special note" value={dog.health.notes} />
            <IconTile icon={ShieldCheck} title="Vaccinations" value={dog.health.vaccination} />
            <IconTile icon={IdCard} title="Microchip ID" value={dog.health.microchip} />
            <IconTile icon={Stethoscope} title="Vet contact" value={dog.health.vet} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        <SectionHeading eyebrow="Please stay calm" title="If You Found Me" description="A few simple steps can keep Rookie safe and help reunite him with his family quickly." />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {instructions.map(({ icon: Icon, title, text }, index) => (
            <article key={title} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-5" /></span>
              <div><div className="flex items-center gap-2"><span className="text-xs font-extrabold text-primary">0{index + 1}</span><h3 className="font-bold">{title}</h3></div><p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{text}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8 lg:pb-20">
        <div className="grid items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:grid-cols-[1fr_auto] sm:p-8">
          <div className="flex min-w-0 items-center gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-full bg-success-soft text-success"><BadgeCheck className="size-7" /></span><div className="min-w-0"><h2 className="font-display text-xl font-bold">Verified Dog Profile</h2><p className="mt-1 text-sm text-muted-foreground">Owner verified · Dog ID {dog.id} · QR registered</p></div></div>
          <div className="flex gap-2"><span className="rounded-full bg-muted px-3 py-2 text-xs font-bold text-muted-foreground">Identity checked</span><span className="rounded-full bg-success-soft px-3 py-2 text-xs font-bold text-success">Active</span></div>
        </div>
      </section>

      <footer className="bg-footer text-footer-foreground">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 py-9 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-footer-foreground/10"><PawPrint className="size-5" /></span><div><p className="font-bold">{dog.name} · {dog.id}</p><p className="text-xs text-footer-foreground/60">Help me get home.</p></div></div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-footer-foreground/60"><ShieldCheck className="size-4" /> PawSafe QR Safety</p>
        </div>
      </footer>

      <nav aria-label="Emergency actions" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-border bg-card/95 px-2 pb-[max(.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_-18px_var(--shadow-color)] backdrop-blur md:hidden">
        <button className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-destructive transition active:bg-lost-soft" onClick={() => call(dog.owner.phone)}><Phone className="size-5" />Call</button>
        <button className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-success transition active:bg-success-soft" onClick={whatsapp}><MessageCircle className="size-5" />WhatsApp</button>
        <button className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-xs font-bold text-primary transition active:bg-accent" onClick={shareLocation}><Navigation className="size-5" />Location</button>
      </nav>

      {lightbox ? (
        <div role="dialog" aria-modal="true" aria-label={lightbox.label} className="fixed inset-0 z-[60] grid place-items-center bg-modal p-4 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-card shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <button aria-label="Close image" className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full bg-card/90 text-foreground shadow-lg transition hover:bg-card" onClick={() => setLightbox(null)}><X className="size-5" /></button>
            {lightbox.crop ? (
              <div className="relative aspect-square max-h-[72vh] w-[min(88vw,72vh)] overflow-hidden bg-muted">
                <img src={lightbox.src} alt={lightbox.label} className={`absolute h-[200%] w-[200%] max-w-none ${lightbox.crop}`} />
              </div>
            ) : (
              <img src={lightbox.src} alt={lightbox.label} className="max-h-[82vh] w-auto max-w-full object-contain" />
            )}
            <div className="flex items-center justify-between gap-4 border-t border-border px-5 py-4"><span className="font-bold">{lightbox.label}</span><span className="text-xs text-muted-foreground">Tap outside to close</span></div>
          </div>
        </div>
      ) : null}
    </main>
  );
}