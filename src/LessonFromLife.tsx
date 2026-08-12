import { useEffect, useState } from "react";
import {
  Heart, Star, Gift, Users, UserRound,
  BookOpen, CalendarDays, Briefcase, GraduationCap, Menu, X, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useReveal, useCountUp } from "@/hooks/use-reveal";
import "./lesson-from-life-fonts.css";

/* ---------- assets (place under /public exactly as named — see README) ---------- */
const LOGO_WHITE = "/svg/logo-white.svg";
const HERO_PHOTO = "/images/hero-doctor-boy.png";
const HERO_TEXTURE = "/images/hero-bg-texture.png";
const UNDERLINE_BIG = "/images/underline-big.svg";
const MENTOR_TEENS = "/images/mentor-teens.png";
const CLASSROOM_BG = "/images/classroom-bg.png";
const CRISIS_IMG = "/images/crisis-illustration-2.jpg";
const LAWYER_BOY = "/images/lawyer-boy.png";
const RANAN_PHOTO = "/images/ranan.png";

const NAV_LINKS = [
  { href: "#founder", label: "אודות המיזם" },
  { href: "#next-gen", label: "איך זה עובד?" },
  { href: "#who-fits", label: "למי זה מתאים?" },
  { href: "#impact", label: "מה זה נותן?" },
  { href: "#register", label: "שאלות נפוצות" },
  { href: "#register", label: "צור קשר" },
];

const PROFESSIONS = ["עורכי דין", "מהנדס", "חקלאי", "מוזיקאי", "איש קבע", "סטודנט", "יזמות", "ועוד.."];

const SERVICE_CARDS = [
  { icon: Gift, title: "תגמול הולם", text: "בלי לאבד את תחושת השליחות" },
  { icon: Briefcase, title: "כל תחום", text: "הנדסה, עסקים, חקלאות, ביטחון, יהדות" },
  { icon: GraduationCap, title: "אנחנו מכשירים", text: "לא צריך רקע בהוראה" },
  { icon: CalendarDays, title: "שעה בשבוע", text: "כל אחד לפי היכולת שלו" },
];

const GIVES_YOU = [
  { icon: Heart, title: "מזון לנשמה", text: "להרגיש שאתה עושה משהו בעל ערך" },
  { icon: Star, title: "להגשים חלום ישן", text: "תמיד רצית ללמד? הנה ההזדמנות שלך" },
  { icon: Gift, title: "תגמול הולם והכשרה מלאה", text: "מקבלים שכר ומלווים אתכם בצעדים הראשונים" },
  { icon: Users, title: "להיות חלק ממשהו גדול", text: "מהפכה אזורית בחינוך - ואתה חלק ממנה" },
];

const GIVES_STUDENTS = [
  { icon: UserRound, title: "פוגשים דמויות מעצבות", text: "אנשים אמיתיים שמשפיעים בזכות מי שהם" },
  { icon: BookOpen, title: "לומדים תוכן לימודי רלוונטי", text: "החומר מתחבר למציאות שלהם" },
  { icon: Heart, title: "מקבלים תשומת לב, לא רק חומר", text: "מעורבות אמיתית ונוכחות מעצימה" },
  { icon: Users, title: "גדלים בקהילה שאכפת לה", text: "חיבור שכובש בין ערכים לבני אדם" },
];

function Reveal({
  as: Tag = "div",
  variant = "up",
  delay = 0,
  className = "",
  children,
}: {
  as?: any;
  variant?: "up" | "scale" | "side";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const { ref, visible } = useReveal();
  const base =
    variant === "scale" ? "lfl-reveal-scale" : variant === "side" ? "lfl-reveal-r" : "lfl-reveal";
  return (
    <Tag
      ref={ref}
      className={`${base} ${visible ? "in" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

function Stat({ to, suffix, prefix, label }: { to: number; suffix?: string; prefix?: string; label: string }) {
  const { ref, value } = useCountUp(to);
  return (
    <div className="relative flex-1 text-center px-2 border-t md:border-t-0 md:border-s first:border-none first:pt-0 pt-5 md:pt-0 border-[hsl(var(--lfl-navy-900))]/10">
      <b
        ref={ref as any}
        className="font-stanga block font-black text-[hsl(var(--lfl-navy-900))] leading-none text-[clamp(2.8rem,8.3vw,5.8rem)]"
      >
        {prefix}{value}{suffix}
      </b>
      <span className="font-ploni block mt-2 font-bold text-[clamp(1rem,2vw,1.5rem)] text-[hsl(var(--lfl-navy-900))]">
        {label}
      </span>
    </div>
  );
}

export default function LessonFromLife() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div dir="rtl" className="font-ploni bg-[hsl(var(--lfl-bg-soft))] text-[hsl(var(--lfl-navy-900))] overflow-x-clip">
      {/* ============ NAV ============ */}
      <header
        className={`fixed inset-x-0 top-0 z-[100] transition-all duration-500 ${
          scrolled ? "bg-[hsl(var(--lfl-navy-900))]/75 backdrop-blur-md shadow-lg py-2.5" : "py-4 md:py-5"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 flex items-center justify-between gap-5">
          <a href="#hero" className="w-[108px] md:w-[144px] shrink-0">
            <img src={LOGO_WHITE} alt="שיעור מהחיים" className="w-full h-auto" />
          </a>
          <nav className="hidden md:flex items-center gap-8 lg:gap-12">
            {NAV_LINKS.map((l, i) => (
              <a
                key={i}
                href={l.href}
                className="relative text-white text-[clamp(.85rem,1.76vw,1.15rem)] py-1 group whitespace-nowrap"
              >
                {l.label}
                <span className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-[hsl(var(--lfl-lime))] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </nav>
          <Button
            asChild
            className="hidden md:inline-flex bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] hover:bg-[hsl(var(--lfl-lime))] hover:-translate-y-1 hover:scale-105 rounded-[20px] font-bold shadow-lg transition-all px-6 h-auto py-2.5 text-[clamp(.9rem,1.5vw,1.15rem)]"
          >
            <a href="#register">אני רוצה להצטרף</a>
          </Button>
          <button
            aria-label="תפריט"
            className="md:hidden text-white"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[99] bg-[hsl(var(--lfl-navy-900))] flex flex-col items-center justify-center gap-8">
          {NAV_LINKS.map((l, i) => (
            <a key={i} href={l.href} onClick={() => setMenuOpen(false)} className="text-white text-2xl">
              {l.label}
            </a>
          ))}
          <Button asChild className="bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] rounded-[20px] font-bold px-8 py-3 h-auto">
            <a href="#register" onClick={() => setMenuOpen(false)}>אני רוצה להצטרף</a>
          </Button>
        </div>
      )}

      {/* ============ HERO ============ */}
      <section
        id="hero"
        className="relative min-h-[100dvh] overflow-hidden"
        style={{ background: "linear-gradient(68deg, hsl(var(--lfl-navy-800)) 14%, hsl(var(--lfl-blue-600)) 104%)" }}
      >
        <div
          className="absolute -inset-[8%] opacity-[.22] blur-[10px] pointer-events-none bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_TEXTURE})` }}
        />
        {/* fixed-aspect box matching the Figma canvas (1920x1083) — intentionally NO max-height
            cap. Capping height independently of width was the actual root cause of two bugs
            in turn (a big photo-to-bubble gap, then a cropped photo when that fix
            over-corrected) — both came from the row's height being inconsistent relative to
            its width. Locking height purely to aspect-ratio keeps everything below it
            consistent on any window shape, at the cost of the hero sometimes running a little
            taller than the viewport on unusually short windows — a safer trade-off than
            clipped or disproportionate content. */}
        <div className="relative z-[2] w-[80vw] mx-auto aspect-[1920/1083] max-md:w-full max-md:aspect-auto max-md:h-auto max-md:flex max-md:flex-col max-md:pt-[clamp(90px,20vw,120px)]">
          {/* photo is a transparent cutout PNG — anchored to the bottom, allowed to rise in
              front of the bubble, NOT a rectangular cover photo. */}
          <Reveal
            variant="scale"
            className="absolute left-0 bottom-0 h-[88%] z-[3] pointer-events-none flex items-end max-md:static max-md:h-[44vh] max-md:w-full max-md:justify-center max-md:order-1"
          >
            <img
              src={HERO_PHOTO}
              alt="רופא מתנדב עם נער - שיעור מהחיים"
              className="h-full w-auto max-w-none block [filter:drop-shadow(0_30px_50px_rgba(4,15,34,.4))] max-md:h-full max-md:w-auto"
            />
          </Reveal>
          <div
            dir="rtl"
            className="absolute right-0 top-0 bottom-0 w-[54%] z-[2] flex flex-col justify-center px-5 md:px-12 py-6 max-md:static max-md:w-full max-md:order-2 max-md:py-8"
          >
            <Reveal>
              <div className="relative bg-white rounded-[clamp(28px,3.2vw,48px)] shadow-[0_25px_60px_rgba(4,15,34,.35)] px-[clamp(26px,3vw,50px)] py-[clamp(22px,2.6vw,42px)] w-fit max-w-full">
                <span className="absolute w-[clamp(28px,3.4vw,46px)] h-[clamp(28px,3.4vw,46px)] bg-white -bottom-3 start-[clamp(40px,5vw,70px)] rotate-45 rounded-bl-[10px] -z-10" />
                <h1 className="font-stanga font-black text-[hsl(var(--lfl-navy-ink))] leading-[1.18] text-[clamp(2.6rem,6.3vw,5.4rem)]">
                  <span className="block">גם אם אתה לא מורה,</span>
                  <span className="block">
                    אתה יכול{" "}
                    <span className="relative inline-block">
                      להשפיע
                      <span className="absolute inset-x-[2%] -bottom-[.08em] h-[.14em] bg-[hsl(var(--lfl-lime))] rounded" />
                    </span>
                  </span>
                  <span className="block">על הדור הבא!</span>
                </h1>
              </div>
            </Reveal>
            <Reveal delay={300}>
              <Button
                asChild
                className="mt-[clamp(22px,3vw,34px)] self-center md:self-end bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] hover:bg-[hsl(var(--lfl-lime))] hover:-translate-y-1 hover:scale-105 rounded-[20px] font-bold shadow-2xl transition-all h-auto px-8 py-3.5 text-[clamp(.95rem,2.05vw,1.55rem)]"
              >
                <a href="#register">ספרו לי על המיזם</a>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      <div className="relative z-[3] max-w-[1440px] mx-auto px-5 md:px-16 -mt-[clamp(40px,6vw,70px)]">
        <Reveal>
          <div className="bg-[#fbfbfb] rounded-[clamp(24px,3vw,45px)] shadow-[0_10px_50px_rgba(13,43,94,0.10)] grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-0 py-[clamp(20px,3.5vw,46px)] max-w-[1150px] mx-auto">
            <Stat to={100} suffix="%" label="השפעה לדור הבא" />
            <Stat to={10} prefix="2-" suffix="%" label="מהזמן שלך" />
            <Stat to={40} suffix="%" label="חוסר במורים" />
          </div>
        </Reveal>
      </div>

      {/* ============ NEXT GEN ============ */}
      <section id="next-gen" className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)]">
        <div dir="ltr" className="max-w-[1440px] mx-auto px-5 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <Reveal className="[direction:rtl] text-right">
            <h2 className="font-stanga font-black leading-[1.22] text-[clamp(2.2rem,4.4vw,4.1rem)]">
              הדור הבא צריך ללמוד
              <br />
              <span className="relative inline-block">
                מאנשים כמוך!
                <span className="absolute inset-x-[2%] -bottom-[.1em] h-[.11em] bg-[hsl(var(--lfl-lime))] rounded" />
              </span>
            </h2>
            <p className="font-light text-[clamp(1.05rem,2.3vw,1.55rem)] leading-[1.55] text-[hsl(var(--lfl-navy-ink))] mt-6 md:mt-8">
              בעידן שבו יש חוסר עצום במחנכים ומורים, ובתי ספר רבים פועלים עם פער של 40% ויותר -
              הגיע הזמן שלך להצטרף למהפכה. שעה בשבוע. מהתחום שלך. מהחיים האמיתיים.
            </p>
            <p className="font-light text-[clamp(1.05rem,2.3vw,1.55rem)] leading-[1.55] text-[hsl(var(--lfl-navy-ink))] mt-4">
              אנשי קהילה אמיתיים שמקדישים 2% עד 10% מהזמן שלהם, ומביאים את הניסיון, המקצוע
              והשליחות שלהם אל תוך הכיתה - כדי לעזור לדור הבא לגדול עם דמויות אמיתיות מהחיים.
            </p>
          </Reveal>
          <Reveal variant="side">
            <div className="relative rounded-[clamp(24px,3vw,49px)] overflow-hidden shadow-2xl aspect-[667/647] group">
              <img
                src={MENTOR_TEENS}
                alt="מנטור עם בני נוער"
                className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-1000"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ shared light-gray panel: who-fits / crisis / breakpoint / impact / register / founder ============ */}
      <div className="bg-[hsl(var(--lfl-bg-panel))]">
        {/* WHO FITS */}
        <section id="who-fits" className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)] text-center">
          <div className="max-w-[1440px] mx-auto px-5 md:px-16">
            <Reveal>
              <h2 className="font-stanga font-black leading-[1.2] max-w-[20ch] mx-auto text-[clamp(2.1rem,6.3vw,5.6rem)]">
                לכל מי שרוצה להיות חלק ומרגיש שיש לו מה לתת
              </h2>
            </Reveal>
            <div className="flex flex-wrap justify-center gap-3 md:gap-5 mt-8 md:mt-14">
              {PROFESSIONS.map((p, i) => (
                <Reveal key={p} variant="scale" delay={i * 160}>
                  <span className="inline-block bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] font-bold text-[clamp(.95rem,1.6vw,1.4rem)] px-6 py-2.5 rounded-[20px] shadow-md hover:-translate-y-1.5 hover:-rotate-1 hover:shadow-xl transition-all duration-300">
                    {p}
                  </span>
                </Reveal>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-7 mt-12 md:mt-20">
              {SERVICE_CARDS.map((c, i) => (
                <Reveal key={c.title} delay={i * 160}>
                  <div className="group bg-white rounded-[clamp(20px,2.4vw,38px)] shadow-[0_0_30px_rgba(18,44,73,0.10)] px-6 py-8 md:py-10 text-center hover:-translate-y-2.5 hover:shadow-2xl transition-all duration-500 h-full">
                    <c.icon
                      className="mx-auto text-[hsl(var(--lfl-navy-900))] group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-500"
                      size={56}
                      strokeWidth={1.5}
                    />
                    <h3 className="font-bold text-[clamp(1.05rem,2vw,1.6rem)] mt-3">{c.title}</h3>
                    <p className="text-[clamp(.85rem,1.5vw,1.1rem)] text-slate-500 mt-1.5">{c.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CRISIS — illustration + card, per updated design brief (site fonts, not the reference image's font) */}
        <section className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)]">
          <div className="max-w-[1440px] mx-auto px-5 md:px-16">
            <Reveal>
              <div dir="ltr" className="relative bg-white rounded-[clamp(24px,3vw,48px)] shadow-[0_20px_60px_rgba(18,44,73,.12)] p-[clamp(14px,1.6vw,26px)] grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-[clamp(14px,1.6vw,26px)] items-stretch">
                <div className="relative rounded-[clamp(18px,2.4vw,36px)] overflow-hidden min-h-[280px] md:min-h-[440px]">
                  <img src={CRISIS_IMG} alt="דור הבא צומח מתוך נקודת שבר" className="absolute inset-0 w-full h-full object-cover" />
                  <svg viewBox="0 0 32 28" className="lfl-animate-float absolute top-[6%] start-[6%] w-[clamp(30px,3.6vw,54px)] text-[hsl(var(--lfl-lime))] drop-shadow-[0_2px_4px_rgba(0,0,0,.25))]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 25S3 17 3 9.5C3 4.8 6.8 2 10.3 2c2.5 0 4.5 1.3 5.7 3.3C17.2 3.3 19.2 2 21.7 2 25.2 2 29 4.8 29 9.5 29 17 16 25 16 25Z"/></svg>
                  <svg viewBox="0 0 60 44" className="absolute top-[16%] start-[13%] w-[clamp(46px,5vw,74px)] text-[hsl(var(--lfl-lime))] drop-shadow-[0_2px_4px_rgba(0,0,0,.25))]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4c18 2 32 12 34 34"/><path d="M28 32l10 6 2-11"/></svg>
                  <div className="absolute bottom-[clamp(14px,2vw,26px)] start-[clamp(14px,2vw,26px)] bg-[hsl(var(--lfl-navy-900))] text-white rounded-[20px] px-[1.1em] py-[.8em] shadow-[0_12px_26px_rgba(0,0,0,.3)] min-w-[132px]">
                    <b className="font-stanga block font-black text-[hsl(var(--lfl-lime))] text-[clamp(1.6rem,2.6vw,2.3rem)] leading-none">40%</b>
                    <span className="block font-ploni font-semibold text-[.72rem] leading-[1.35] mt-2 text-slate-200">פערים של עשרות<br />אחוזים במערכת</span>
                    <span className="block w-[34px] h-[3px] bg-[hsl(var(--lfl-lime))] rounded mt-2" />
                  </div>
                </div>
                <div className="relative px-[clamp(16px,2vw,30px)] py-[clamp(20px,2.6vw,40px)] flex flex-col justify-center" dir="rtl">
                  <span className="self-end inline-flex items-center gap-2 bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] font-bold text-sm px-[1.1em] py-[.5em] rounded-[20px]">
                    <Zap size={16} />
                    המציאות היום
                  </span>
                  <h2 className="font-stanga font-black text-[hsl(var(--lfl-navy-900))] leading-[1.28] mt-3 text-right text-[clamp(1.7rem,3.4vw,3rem)]">
                    עולם החינוך נמצא בנקודת שבר
                  </h2>
                  <div className="flex items-center gap-2.5 mt-2 justify-end">
                    <svg viewBox="0 0 150 12" className="h-[10px] w-[clamp(90px,10vw,150px)] text-[hsl(var(--lfl-lime))]" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M2 8c12-10 24 8 36-2s24 8 36-2 24 8 36-2 24 8 36-2"/></svg>
                    <svg viewBox="0 0 32 28" className="w-5 h-5 text-[hsl(var(--lfl-lime))]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M16 25S3 17 3 9.5C3 4.8 6.8 2 10.3 2c2.5 0 4.5 1.3 5.7 3.3C17.2 3.3 19.2 2 21.7 2 25.2 2 29 4.8 29 9.5 29 17 16 25 16 25Z"/></svg>
                  </div>
                  <p className="font-light text-[clamp(1rem,2vw,1.35rem)] leading-[1.75] mt-4 text-[hsl(var(--lfl-navy-ink))] text-right">
                    פחות ופחות אנשים בוחרים במקצוע ההוראה, ותחום החינוך מתמודד עם חוסר מורים חמור.
                    בתי ספר רבים ברחבי הארץ, כולל בגוש עציון, פועלים עם פערים של עשרות אחוזים.
                    הילדים זקוקים לדמויות חינוכיות אמיתיות, והדלת נפתחת לאנשים שיביאו איתם את
                    השליחות שלהם מהחיים עצמם.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* BREAKPOINT — photo left / light panel right, matching the updated reference */}
        <section className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)]">
          <div className="max-w-[1440px] mx-auto px-5 md:px-16">
            <Reveal variant="scale">
              <div dir="ltr" className="relative rounded-[clamp(24px,3vw,49px)] overflow-hidden bg-white shadow-[0_20px_60px_rgba(18,44,73,.12)] grid grid-cols-1 md:grid-cols-2 items-stretch">
                <div className="relative min-h-[260px] md:min-h-[clamp(280px,32vw,460px)]">
                  <img src={CLASSROOM_BG} alt="כיתה" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="relative z-[2] p-[clamp(28px,4vw,60px)] flex flex-col justify-center" dir="rtl">
                  <h2 className="font-stanga font-black text-[hsl(var(--lfl-navy-900))] leading-[1.3] text-[clamp(1.7rem,3.4vw,3rem)]">
                    אבל בנקודות שבר
                    <br />
                    <span className="inline-block bg-[hsl(var(--lfl-navy-900))] text-[hsl(var(--lfl-lime))] rounded-[8px] px-[.36em] py-[.12em] mt-1">
                      נולדות מהפכות
                    </span>
                  </h2>
                  <p className="font-light text-[clamp(1rem,2vw,1.35rem)] leading-[1.7] text-[hsl(var(--lfl-navy-ink))] mt-4">
                    המהפכה היא לא רעיון תיאורטי - היא קורה עכשיו. אנשי קהילה מכל תחומי החיים
                    מקדישים חלק מזמנם ומגיעים לכיתות כדי להעשיר את עולמם של הילדים. מהנדסים,
                    חקלאים, יזמים, אנשי ביטחון, אמנים ואנשי תוכן - כולם מביאים איתם את הניסיון,
                    התשוקה והידע שלהם, ומשאירים חותם שלא נמחק.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* IMPACT TWO-COLUMN */}
        <section id="impact" className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)] text-center">
          <div className="max-w-[1440px] mx-auto px-5 md:px-16">
            <Reveal>
              <span className="inline-flex bg-[hsl(var(--lfl-navy-900))] text-[hsl(var(--lfl-lime))] font-bold text-sm px-5 py-2 rounded-[20px]">
                מה יוצא מזה
              </span>
              <h2 className="font-stanga font-black mt-3 leading-[1.2] max-w-[26ch] mx-auto text-[clamp(1.9rem,4.5vw,4rem)]">
                זה משנה אותך. וזה משנה אותם.
              </h2>
            </Reveal>
            <div dir="ltr" className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-7 mt-9 md:mt-14">
              <Reveal variant="side">
                <div
                  dir="rtl"
                  className="rounded-[clamp(22px,2.8vw,45px)] p-6 md:p-11 text-white h-full text-right"
                  style={{ background: "linear-gradient(160deg, hsl(var(--lfl-navy-800)), hsl(var(--lfl-blue-600)))" }}
                >
                  <h3 className="font-bold text-center text-[clamp(1.2rem,2.3vw,1.7rem)] mb-4">מה זה נותן לך</h3>
                  {GIVES_YOU.map((it, i) => (
                    <div key={it.title} className={`flex gap-4 items-start py-4 ${i > 0 ? "border-t border-white/20" : ""}`}>
                      <it.icon className="shrink-0 mt-0.5" size={30} strokeWidth={1.6} />
                      <div>
                        <b className="block font-bold text-[clamp(.95rem,1.7vw,1.25rem)]">{it.title}</b>
                        <span className="block font-light text-[clamp(.8rem,1.4vw,1rem)] opacity-90 mt-1">{it.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal variant="side" delay={100}>
                <div dir="rtl" className="rounded-[clamp(22px,2.8vw,45px)] p-6 md:p-11 bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] h-full text-right">
                  <h3 className="font-bold text-center text-[clamp(1.2rem,2.3vw,1.7rem)] mb-4">מה זה נותן לתלמידים</h3>
                  {GIVES_STUDENTS.map((it, i) => (
                    <div key={it.title} className={`flex gap-4 items-start py-4 ${i > 0 ? "border-t border-[hsl(var(--lfl-navy-900))]/15" : ""}`}>
                      <it.icon className="shrink-0 mt-0.5" size={30} strokeWidth={1.6} />
                      <div>
                        <b className="block font-bold text-[clamp(.95rem,1.7vw,1.25rem)]">{it.title}</b>
                        <span className="block font-light text-[clamp(.8rem,1.4vw,1rem)] opacity-90 mt-1">{it.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* REGISTER FORM */}
        <section id="register" className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)] bg-[hsl(var(--lfl-navy-900))]">
          <div className="max-w-[1440px] mx-auto px-5 md:px-16">
            <Reveal>
              <div className="relative overflow-hidden flex flex-col md:block">
                <div className="relative md:absolute md:inset-y-0 md:right-0 w-full md:w-[44%] h-[260px] md:h-auto order-first md:order-none overflow-hidden bg-[hsl(var(--lfl-navy-900))] flex items-end justify-center">
                  {/* both figures must always stay fully visible — contain, not cover */}
                  <img src={LAWYER_BOY} alt="מנטור עם נער" className="w-full h-full object-contain object-bottom" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--lfl-navy-900))] to-transparent to-[22%] pointer-events-none" />
                </div>
                <div className="relative z-[2] bg-white rounded-[clamp(20px,2.6vw,38px)] m-4 md:m-8 md:mr-auto max-w-[640px] p-6 md:p-12">
                  <div className="text-slate-500 text-[clamp(.9rem,1.5vw,1.1rem)]">רוצים להיות חלק מהמהפכה?</div>
                  <h2 className="font-stanga font-black text-[hsl(var(--lfl-navy-900))] mt-1 leading-[1.25] text-[clamp(1.5rem,3.4vw,2.6rem)]">
                    לבירורים ופגישת היכרות - הירשמו.
                  </h2>
                  <p className="font-light text-slate-500 text-[clamp(.9rem,1.5vw,1.05rem)] leading-[1.5] mt-3">
                    השאירו פרטים ונחזור אליכם כדי לקבוע פגישת היכרות שתתאים לכם אישית או קבוצתית,
                    על התפקיד שלכם בה וההכשרה.
                  </p>
                  <form
                    className="mt-6 flex flex-col gap-3"
                    onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
                  >
                    <Input placeholder="שם מלא" required className="h-auto py-3.5 rounded-xl" />
                    <Input type="tel" placeholder="טלפון*" required className="h-auto py-3.5 rounded-xl" />
                    <Input type="email" placeholder="אימייל" className="h-auto py-3.5 rounded-xl" />
                    <Input placeholder="התחום שלך / מה היית רוצה ללמד" className="h-auto py-3.5 rounded-xl" />
                    <Textarea placeholder="ספרו לנו קצת על עצמכם (אופציונלי)" rows={2} className="rounded-xl" />
                    <Button
                      type="submit"
                      className="mt-1 bg-[hsl(var(--lfl-lime))] text-[hsl(var(--lfl-navy-ink))] hover:bg-[hsl(var(--lfl-lime))] hover:-translate-y-1 rounded-2xl font-bold h-auto py-3.5 text-[clamp(1rem,1.8vw,1.2rem)] shadow-lg transition-all"
                    >
                      {submitted ? "תודה! נחזור אליכם בקרוב 🌱" : "אשמח לשמוע פרטים על המיזם"}
                    </Button>
                    <small className="text-slate-400 text-xs mt-1">
                      בהרשמה אני מאשר/ת קבלת פרטים ומסכימ/ה לתנאי השימוש ומדיניות הפרטיות
                    </small>
                  </form>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* FOUNDER */}
        <section id="founder" className="py-[clamp(70px,9vw,150px)] max-md:py-[clamp(44px,8vw,70px)]">
          <div dir="ltr" className="max-w-[1440px] mx-auto px-5 md:px-16 grid grid-cols-1 md:grid-cols-[1.1fr_.9fr] gap-10 md:gap-16 items-center">
            <Reveal className="[direction:rtl] text-right">
              <div className="text-slate-500 font-semibold text-[clamp(.95rem,1.6vw,1.2rem)]">מי עומד מאחורי המיזם?</div>
              <h2 className="font-stanga font-black leading-[1.2] mt-2 text-[clamp(1.7rem,4.84vw,3.4rem)]">
                איש חינוך. איש שטח. איש חזון.
              </h2>
              <p className="font-light text-[clamp(1.05rem,2.3vw,1.55rem)] leading-[1.6] mt-5 text-[hsl(var(--lfl-navy-ink))]">
                רענן, מנהל בית הספר חמ"ד כרמי יהודה בגוש עציון, רואה כל יום מקרוב את המשבר במערכת
                החינוך - ובמקום לקבל אותו כגזירה, בחר להוביל אחרת.
              </p>
              <p className="font-light text-[clamp(1.05rem,2.3vw,1.55rem)] leading-[1.6] mt-4 text-[hsl(var(--lfl-navy-ink))]">
                לצד תפקידו בחינוך הוא משרת כמפקד במילואים. שני העולמות האלה - שדה הקרב והכיתה -
                לימדו אותו אותו דבר: שמהפכות אמיתיות לא נולדות מלמעלה, אלא מאנשים שמחליטים
                להתגייס.
              </p>
              <p className="font-light text-[clamp(1.05rem,2.3vw,1.55rem)] leading-[1.6] mt-4 text-[hsl(var(--lfl-navy-ink))]">
                המיזם של מנטורים חינוכיים מהחיים הוא הניסיון שלו לחבר את הקהילה לבית הספר, לפני
                שיהיה מאוחר מדי.
              </p>
            </Reveal>
            <Reveal variant="side" className="relative flex justify-center items-end pt-[8%] mt-6 md:mt-0 isolate">
              {/* faint decorative rings behind everything */}
              <div className="absolute end-[2%] top-[-6%] w-[46%] aspect-square rounded-full border-2 border-[hsl(var(--lfl-navy-900))]/10 z-0 pointer-events-none" />
              <div className="absolute end-[calc(2%+7%)] top-[calc(-6%+7%)] w-[calc(46%-14%)] aspect-square rounded-full border-2 border-[hsl(var(--lfl-navy-900))]/10 z-0 pointer-events-none" />
              {/* lime blob, bottom-anchored */}
              <div className="absolute w-[82%] aspect-[614/528] bg-[hsl(var(--lfl-lime))] rounded-[clamp(40px,6vw,69px)] bottom-0 z-[1]" />
              {/* photo is a transparent cutout — sits directly on the blob, rises above it, glued to the section bottom */}
              <img
                src={RANAN_PHOTO}
                alt="רענן, מייסד שיעור מהחיים"
                className="relative z-[2] w-[76%] block [filter:drop-shadow(0_20px_34px_rgba(18,44,73,.28))] group-hover:scale-[1.04] transition-transform duration-1000"
              />
            </Reveal>
          </div>
        </section>
      </div>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[hsl(var(--lfl-navy-900))] py-6 md:py-8">
        <div className="max-w-[1440px] mx-auto px-5 md:px-16 flex items-center justify-between flex-wrap gap-3">
          <img src={LOGO_WHITE} alt="שיעור מהחיים" className="w-[100px] md:w-[150px]" />
          <p className="text-slate-300 text-[clamp(.85rem,1.4vw,1.05rem)]">עיצוב ופיתוח: שיעור מהחיים © 2026</p>
        </div>
      </footer>
    </div>
  );
}
